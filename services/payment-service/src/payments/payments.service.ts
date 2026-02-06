import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction, TransactionStatus } from "./entities/transaction.entity";
import { InitiatePaymentDto } from "./dto";
import { ArticleClient } from "../clients/article.client";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly articleClient: ArticleClient,
    private readonly rabbitmqService: RabbitmqService,
    private readonly metricsService: MetricsService,
  ) {}

  async initiatePayment(dto: InitiatePaymentDto): Promise<Transaction> {
    // 1. Verify article is available
    const article = await this.articleClient.getArticle(dto.articleId);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.status !== "published") {
      throw new BadRequestException("Article is not available for purchase");
    }

    // 2. Create transaction
    const transaction = this.transactionRepository.create({
      articleId: dto.articleId,
      buyerId: dto.buyerId,
      sellerId: article.sellerId,
      amount: dto.amount,
      status: TransactionStatus.PENDING,
    });

    await this.transactionRepository.save(transaction);

    // 3. Emit PaymentInitiated event
    await this.rabbitmqService.publish("payment.initiated", {
      eventType: "PaymentInitiated",
      timestamp: new Date().toISOString(),
      data: {
        transactionId: transaction.id,
        articleId: transaction.articleId,
        buyerId: transaction.buyerId,
        amount: transaction.amount,
      },
    });

    this.metricsService.incrementPaymentsInitiated();
    this.logger.log(`Payment initiated: ${transaction.id}`);

    // 4. Simulate payment processing (2 seconds)
    setTimeout(async () => {
      await this.completePayment(transaction.id);
    }, 2000);

    return transaction;
  }

  async completePayment(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Update article status to sold
    const updated = await this.articleClient.updateArticleStatus(
      transaction.articleId,
      "sold",
    );

    if (!updated) {
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(transaction);
      this.logger.error(
        `Payment failed: ${transactionId} - could not update article status`,
      );
      return transaction;
    }

    // Update transaction status
    transaction.status = TransactionStatus.COMPLETED;
    await this.transactionRepository.save(transaction);

    // Emit PurchaseCompleted event
    await this.rabbitmqService.publish("payment.purchase_completed", {
      eventType: "PurchaseCompleted",
      timestamp: new Date().toISOString(),
      data: {
        transactionId: transaction.id,
        articleId: transaction.articleId,
        buyerId: transaction.buyerId,
        sellerId: transaction.sellerId,
        amount: Number(transaction.amount),
      },
    });

    this.metricsService.incrementPaymentsCompleted();
    this.logger.log(`Payment completed: ${transactionId}`);

    return transaction;
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    return transaction;
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { buyerId: userId },
      order: { createdAt: "DESC" },
    });
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      order: { createdAt: "DESC" },
    });
  }
}
