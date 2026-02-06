import { Repository } from "typeorm";
import { Transaction } from "./entities/transaction.entity";
import { InitiatePaymentDto } from "./dto";
import { ArticleClient } from "../clients/article.client";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { MetricsService } from "../metrics/metrics.service";
export declare class PaymentsService {
    private readonly transactionRepository;
    private readonly articleClient;
    private readonly rabbitmqService;
    private readonly metricsService;
    private readonly logger;
    constructor(transactionRepository: Repository<Transaction>, articleClient: ArticleClient, rabbitmqService: RabbitmqService, metricsService: MetricsService);
    initiatePayment(dto: InitiatePaymentDto): Promise<Transaction>;
    completePayment(transactionId: string): Promise<Transaction>;
    findOne(id: string): Promise<Transaction>;
    findByUser(userId: string): Promise<Transaction[]>;
    findAll(): Promise<Transaction[]>;
}
