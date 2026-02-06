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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("./entities/transaction.entity");
const article_client_1 = require("../clients/article.client");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
const metrics_service_1 = require("../metrics/metrics.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(transactionRepository, articleClient, rabbitmqService, metricsService) {
        this.transactionRepository = transactionRepository;
        this.articleClient = articleClient;
        this.rabbitmqService = rabbitmqService;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async initiatePayment(dto) {
        const article = await this.articleClient.getArticle(dto.articleId);
        if (!article) {
            throw new common_1.NotFoundException("Article not found");
        }
        if (article.status !== "published") {
            throw new common_1.BadRequestException("Article is not available for purchase");
        }
        const transaction = this.transactionRepository.create({
            articleId: dto.articleId,
            buyerId: dto.buyerId,
            sellerId: article.sellerId,
            amount: dto.amount,
            status: transaction_entity_1.TransactionStatus.PENDING,
        });
        await this.transactionRepository.save(transaction);
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
        setTimeout(async () => {
            await this.completePayment(transaction.id);
        }, 2000);
        return transaction;
    }
    async completePayment(transactionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException("Transaction not found");
        }
        const updated = await this.articleClient.updateArticleStatus(transaction.articleId, "sold");
        if (!updated) {
            transaction.status = transaction_entity_1.TransactionStatus.FAILED;
            await this.transactionRepository.save(transaction);
            this.logger.error(`Payment failed: ${transactionId} - could not update article status`);
            return transaction;
        }
        transaction.status = transaction_entity_1.TransactionStatus.COMPLETED;
        await this.transactionRepository.save(transaction);
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
    async findOne(id) {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
        });
        if (!transaction) {
            throw new common_1.NotFoundException("Transaction not found");
        }
        return transaction;
    }
    async findByUser(userId) {
        return this.transactionRepository.find({
            where: { buyerId: userId },
            order: { createdAt: "DESC" },
        });
    }
    async findAll() {
        return this.transactionRepository.find({
            order: { createdAt: "DESC" },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        article_client_1.ArticleClient,
        rabbitmq_service_1.RabbitmqService,
        metrics_service_1.MetricsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map