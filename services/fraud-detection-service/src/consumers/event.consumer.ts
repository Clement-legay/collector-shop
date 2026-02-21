import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThanOrEqual, LessThan } from "typeorm";
import * as amqp from "amqplib";
import { FraudService } from "../fraud/fraud.service";
import { AlertType, AlertSeverity } from "../fraud/entities/fraud-alert.entity";
import { PurchaseEvent } from "../fraud/entities/purchase-event.entity";
import { MetricsService } from "../metrics/metrics.service";

interface PriceChangedEvent {
  eventType: string;
  timestamp: string;
  data: {
    articleId: string;
    oldPrice: number;
    newPrice: number;
    sellerId: string;
  };
}

interface PaymentInitiatedEvent {
  eventType: string;
  timestamp: string;
  data: {
    transactionId: string;
    articleId: string;
    buyerId: string;
    amount: number;
  };
}

@Injectable()
export class EventConsumer implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;
  private readonly logger = new Logger(EventConsumer.name);

  // Thresholds (configurable)
  private readonly priceOrangeThreshold: number;
  private readonly priceRedThreshold: number;
  private readonly purchaseOrangeThreshold: number;
  private readonly purchaseRedThreshold: number;
  private readonly purchaseWindowMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly fraudService: FraudService,
    private readonly metricsService: MetricsService,
    @InjectRepository(PurchaseEvent)
    private readonly purchaseEventRepository: Repository<PurchaseEvent>,
  ) {
    this.priceOrangeThreshold = this.configService.get<number>(
      "PRICE_CHANGE_ORANGE_THRESHOLD",
      5,
    );
    this.priceRedThreshold = this.configService.get<number>(
      "PRICE_CHANGE_RED_THRESHOLD",
      10,
    );
    this.purchaseOrangeThreshold = this.configService.get<number>(
      "RAPID_PURCHASE_ORANGE_THRESHOLD",
      5,
    );
    this.purchaseRedThreshold = this.configService.get<number>(
      "RAPID_PURCHASE_RED_THRESHOLD",
      10,
    );
    this.purchaseWindowMs =
      this.configService.get<number>("RAPID_PURCHASE_WINDOW_MINUTES", 10) *
      60 *
      1000;
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const host = this.configService.get<string>("RABBITMQ_HOST", "localhost");
      const port = this.configService.get<number>("RABBITMQ_AMQP_PORT", 5672);
      const user = this.configService.get<string>("RABBITMQ_USER", "guest");
      const pass = this.configService.get<string>("RABBITMQ_PASS", "guest");
      const url = this.configService.get<string>(
        "RABBITMQ_URL",
        `amqp://${user}:${pass}@${host}:${port}`,
      );
      const exchange = this.configService.get<string>(
        "RABBITMQ_EXCHANGE",
        "collector.events",
      );
      const queueName = this.configService.get<string>(
        "RABBITMQ_QUEUE",
        "fraud-detection-queue",
      );

      this.connection = (await amqp.connect(url)) as any;
      this.channel = await this.connection.createChannel();

      // Ensure exchange exists
      await this.channel.assertExchange(exchange, "topic", { durable: true });

      // Create queue for this service
      const queue = await this.channel.assertQueue(queueName, {
        durable: true,
      });

      // Bind to ALL events with wildcard '#'
      await this.channel.bindQueue(queue.queue, exchange, "#");

      // Start consuming events
      await this.channel.consume(queue.queue, async (msg: any) => {
        if (msg) {
          try {
            await this.handleMessage(msg);
            this.channel?.ack(msg);
          } catch (error) {
            this.logger.error("Error processing message", error);
            this.channel?.nack(msg, false, false);
          }
        }
      });

      this.logger.log(
        `Connected to RabbitMQ, consuming from queue: ${queueName}`,
      );
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  private async disconnect() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await (this.connection as any).close();
    } catch (error) {
      this.logger.error("Error disconnecting", error);
    }
  }

  private async handleMessage(msg: amqp.ConsumeMessage) {
    const content = JSON.parse(msg.content.toString());
    const routingKey = msg.fields.routingKey;

    this.metricsService.incrementEventsProcessed(
      content.eventType || routingKey,
    );
    this.logger.debug(
      `Received event: ${routingKey}, eventType: ${content.eventType}`,
    );

    // Route to appropriate handler
    switch (content.eventType) {
      case "PriceChanged":
        this.logger.log(`🔍 Processing PriceChanged event`);
        await this.handlePriceChanged(content as PriceChangedEvent);
        break;
      case "PaymentInitiated":
        this.logger.log(
          `🔍 Processing PaymentInitiated event for buyer: ${content.data?.buyerId}`,
        );
        await this.handlePaymentActivity(content as PaymentInitiatedEvent);
        break;
      case "PurchaseCompleted":
        // We track attempts via PaymentInitiated, so we can ignore this for velocity checks
        // or use it for other logic if needed.
        break;
      default:
        this.logger.debug(`Ignoring event type: ${content.eventType}`);
    }
  }

  /**
   * Rule 1: Price variation detection
   * - > 500% (ratio > 5) → ORANGE
   * - > 1000% (ratio > 10) → RED
   */
  private async handlePriceChanged(event: PriceChangedEvent) {
    const { articleId, oldPrice, newPrice, sellerId } = event.data;

    if (oldPrice <= 0) {
      this.logger.debug("Skipping price check: old price is zero or negative");
      return;
    }

    const ratio = newPrice / oldPrice;
    let severity: AlertSeverity = AlertSeverity.GREEN;

    if (ratio > this.priceRedThreshold) {
      severity = AlertSeverity.RED;
    } else if (ratio > this.priceOrangeThreshold) {
      severity = AlertSeverity.ORANGE;
    }

    if (severity !== AlertSeverity.GREEN) {
      await this.fraudService.createAlert(
        AlertType.PRICE_VARIATION,
        severity,
        sellerId,
        articleId,
        {
          oldPrice,
          newPrice,
          ratio: Math.round(ratio * 100) / 100,
          percentChange: Math.round((ratio - 1) * 10000) / 100,
        },
      );
    }
  }

  /**
   * Rule 2: Rapid purchases detection (Attempts)
   * - >= 5 purchases in 10 min → ORANGE
   * - >= 10 purchases in 10 min → RED
   */
  private async handlePaymentActivity(event: PaymentInitiatedEvent) {
    const { buyerId, transactionId, articleId, amount } = event.data;
    const now = new Date();

    this.logger.log(`📊 Velocity check for buyer ${buyerId}`);

    // Save this purchase event to database
    const purchaseEvent = this.purchaseEventRepository.create({
      buyerId,
      transactionId,
      articleId,
      amount,
    });
    await this.purchaseEventRepository.save(purchaseEvent);

    // Calculate cutoff time for the window
    const windowStart = new Date(now.getTime() - this.purchaseWindowMs);

    // Count purchases in the time window from database
    const count = await this.purchaseEventRepository.count({
      where: {
        buyerId,
        createdAt: MoreThanOrEqual(windowStart) as any,
      },
    });

    this.logger.log(
      `  Total count from DB: ${count}, Orange threshold: ${this.purchaseOrangeThreshold}, Red threshold: ${this.purchaseRedThreshold}`,
    );

    let severity: AlertSeverity = AlertSeverity.GREEN;

    // Use >= to trigger ON the threshold
    if (count >= this.purchaseRedThreshold) {
      severity = AlertSeverity.RED;
      this.logger.warn(
        `  🚨 RED ALERT TRIGGERED (count: ${count} >= ${this.purchaseRedThreshold})`,
      );
    } else if (count >= this.purchaseOrangeThreshold) {
      severity = AlertSeverity.ORANGE;
      this.logger.warn(
        `  ⚠️ ORANGE ALERT TRIGGERED (count: ${count} >= ${this.purchaseOrangeThreshold})`,
      );
    } else {
      this.logger.log(
        `  ✅ No alert (count: ${count} < ${this.purchaseOrangeThreshold})`,
      );
    }

    if (severity !== AlertSeverity.GREEN) {
      this.logger.log(`  Creating fraud alert...`);
      await this.fraudService.createAlert(
        AlertType.SUSPICIOUS_PURCHASES,
        severity,
        buyerId,
        articleId,
        {
          purchaseCount: count,
          windowMinutes: this.purchaseWindowMs / 60000,
          lastTransactionId: transactionId,
          amount,
        },
      );
    }

    // Clean up old events periodically (older than window)
    if (Math.random() < 0.1) {
      // 10% chance to clean up
      const cleanupCutoff = new Date(now.getTime() - this.purchaseWindowMs);
      await this.purchaseEventRepository.delete({
        createdAt: LessThan(cleanupCutoff) as any,
      });
    }
  }
}
