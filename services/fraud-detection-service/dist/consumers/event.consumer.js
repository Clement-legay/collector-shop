"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConsumer = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
const fraud_service_1 = require("../fraud/fraud.service");
const fraud_alert_entity_1 = require("../fraud/entities/fraud-alert.entity");
const metrics_service_1 = require("../metrics/metrics.service");
let EventConsumer = EventConsumer_1 = class EventConsumer {
    constructor(configService, fraudService, metricsService) {
        this.configService = configService;
        this.fraudService = fraudService;
        this.metricsService = metricsService;
        this.connection = null;
        this.channel = null;
        this.logger = new common_1.Logger(EventConsumer_1.name);
        this.purchaseCache = new Map();
        this.priceOrangeThreshold = this.configService.get("PRICE_CHANGE_ORANGE_THRESHOLD", 5);
        this.priceRedThreshold = this.configService.get("PRICE_CHANGE_RED_THRESHOLD", 10);
        this.purchaseOrangeThreshold = this.configService.get("RAPID_PURCHASE_ORANGE_THRESHOLD", 5);
        this.purchaseRedThreshold = this.configService.get("RAPID_PURCHASE_RED_THRESHOLD", 10);
        this.purchaseWindowMs =
            this.configService.get("RAPID_PURCHASE_WINDOW_MINUTES", 10) *
                60 *
                1000;
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            const host = this.configService.get("RABBITMQ_HOST", "localhost");
            const port = this.configService.get("RABBITMQ_AMQP_PORT", 5672);
            const user = this.configService.get("RABBITMQ_USER", "guest");
            const pass = this.configService.get("RABBITMQ_PASS", "guest");
            const url = this.configService.get("RABBITMQ_URL", `amqp://${user}:${pass}@${host}:${port}`);
            const exchange = this.configService.get("RABBITMQ_EXCHANGE", "collector.events");
            const queueName = this.configService.get("RABBITMQ_QUEUE", "fraud-detection-queue");
            this.connection = (await amqp.connect(url));
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(exchange, "topic", { durable: true });
            const queue = await this.channel.assertQueue(queueName, {
                durable: true,
            });
            await this.channel.bindQueue(queue.queue, exchange, "#");
            await this.channel.consume(queue.queue, async (msg) => {
                if (msg) {
                    try {
                        await this.handleMessage(msg);
                        this.channel?.ack(msg);
                    }
                    catch (error) {
                        this.logger.error("Error processing message", error);
                        this.channel?.nack(msg, false, false);
                    }
                }
            });
            this.logger.log(`Connected to RabbitMQ, consuming from queue: ${queueName}`);
        }
        catch (error) {
            this.logger.error("Failed to connect to RabbitMQ", error);
            setTimeout(() => this.connect(), 5000);
        }
    }
    async disconnect() {
        try {
            if (this.channel)
                await this.channel.close();
            if (this.connection)
                await this.connection.close();
        }
        catch (error) {
            this.logger.error("Error disconnecting", error);
        }
    }
    async handleMessage(msg) {
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        this.metricsService.incrementEventsProcessed(content.eventType || routingKey);
        this.logger.debug(`Received event: ${routingKey}`);
        switch (content.eventType) {
            case "PriceChanged":
                await this.handlePriceChanged(content);
                break;
            case "PurchaseCompleted":
                await this.handlePurchaseCompleted(content);
                break;
            default:
                this.logger.debug(`Ignoring event type: ${content.eventType}`);
        }
    }
    async handlePriceChanged(event) {
        const { articleId, oldPrice, newPrice, sellerId } = event.data;
        if (oldPrice <= 0) {
            this.logger.debug("Skipping price check: old price is zero or negative");
            return;
        }
        const ratio = newPrice / oldPrice;
        let severity = fraud_alert_entity_1.AlertSeverity.GREEN;
        if (ratio > this.priceRedThreshold) {
            severity = fraud_alert_entity_1.AlertSeverity.RED;
        }
        else if (ratio > this.priceOrangeThreshold) {
            severity = fraud_alert_entity_1.AlertSeverity.ORANGE;
        }
        if (severity !== fraud_alert_entity_1.AlertSeverity.GREEN) {
            await this.fraudService.createAlert(fraud_alert_entity_1.AlertType.PRICE_VARIATION, severity, sellerId, articleId, {
                oldPrice,
                newPrice,
                ratio: Math.round(ratio * 100) / 100,
                percentChange: Math.round((ratio - 1) * 10000) / 100,
            });
        }
    }
    async handlePurchaseCompleted(event) {
        const { buyerId, transactionId, articleId, amount } = event.data;
        const now = Date.now();
        let timestamps = this.purchaseCache.get(buyerId) || [];
        timestamps = timestamps.filter((ts) => now - ts < this.purchaseWindowMs);
        timestamps.push(now);
        this.purchaseCache.set(buyerId, timestamps);
        const count = timestamps.length;
        let severity = fraud_alert_entity_1.AlertSeverity.GREEN;
        if (count > this.purchaseRedThreshold) {
            severity = fraud_alert_entity_1.AlertSeverity.RED;
        }
        else if (count > this.purchaseOrangeThreshold) {
            severity = fraud_alert_entity_1.AlertSeverity.ORANGE;
        }
        if (severity !== fraud_alert_entity_1.AlertSeverity.GREEN) {
            await this.fraudService.createAlert(fraud_alert_entity_1.AlertType.SUSPICIOUS_PURCHASES, severity, buyerId, articleId, {
                purchaseCount: count,
                windowMinutes: this.purchaseWindowMs / 60000,
                lastTransactionId: transactionId,
                amount,
            });
        }
    }
};
exports.EventConsumer = EventConsumer;
exports.EventConsumer = EventConsumer = EventConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        fraud_service_1.FraudService,
        metrics_service_1.MetricsService])
], EventConsumer);
//# sourceMappingURL=event.consumer.js.map