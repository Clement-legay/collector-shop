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
var ArticlesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("./entities/article.entity");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
const metrics_service_1 = require("../metrics/metrics.service");
let ArticlesService = ArticlesService_1 = class ArticlesService {
    constructor(articleRepository, rabbitmqService, metricsService) {
        this.articleRepository = articleRepository;
        this.rabbitmqService = rabbitmqService;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(ArticlesService_1.name);
    }
    async create(createArticleDto) {
        const article = this.articleRepository.create({
            ...createArticleDto,
            status: createArticleDto.status || article_entity_1.ArticleStatus.PUBLISHED,
        });
        await this.articleRepository.save(article);
        await this.rabbitmqService.publish("article.created", {
            eventType: "ArticleCreated",
            timestamp: new Date().toISOString(),
            data: {
                articleId: article.id,
                sellerId: article.sellerId,
                title: article.title,
                price: article.price,
                status: article.status,
            },
        });
        this.metricsService.incrementArticlesCreated();
        this.logger.log(`Article created: ${article.id}`);
        return article;
    }
    async findAll(filters) {
        const query = this.articleRepository.createQueryBuilder("article");
        if (filters?.status) {
            query.andWhere("article.status = :status", { status: filters.status });
        }
        if (filters?.sellerId) {
            query.andWhere("article.sellerId = :sellerId", {
                sellerId: filters.sellerId,
            });
        }
        query.andWhere("article.status != :deleted", {
            deleted: article_entity_1.ArticleStatus.DELETED,
        });
        query.orderBy("article.createdAt", "DESC");
        return query.getMany();
    }
    async findOne(id) {
        const article = await this.articleRepository.findOne({ where: { id } });
        if (!article) {
            throw new common_1.NotFoundException("Article not found");
        }
        return article;
    }
    async update(id, updateArticleDto) {
        const article = await this.findOne(id);
        if (updateArticleDto.price !== undefined &&
            updateArticleDto.price !== article.price) {
            return this.updatePrice(id, { price: updateArticleDto.price });
        }
        Object.assign(article, updateArticleDto);
        await this.articleRepository.save(article);
        await this.rabbitmqService.publish("article.updated", {
            eventType: "ArticleUpdated",
            timestamp: new Date().toISOString(),
            data: {
                articleId: article.id,
                sellerId: article.sellerId,
                changes: updateArticleDto,
            },
        });
        this.metricsService.incrementArticlesUpdated();
        this.logger.log(`Article updated: ${article.id}`);
        return article;
    }
    async updatePrice(id, updatePriceDto) {
        const article = await this.findOne(id);
        const oldPrice = Number(article.price);
        const newPrice = updatePriceDto.price;
        article.previousPrice = oldPrice;
        article.price = newPrice;
        await this.articleRepository.save(article);
        await this.rabbitmqService.publish("article.price_changed", {
            eventType: "PriceChanged",
            timestamp: new Date().toISOString(),
            data: {
                articleId: article.id,
                oldPrice: oldPrice,
                newPrice: newPrice,
                sellerId: article.sellerId,
            },
        });
        this.metricsService.incrementPriceChanges();
        this.logger.log(`Price changed for article ${article.id}: ${oldPrice} → ${newPrice}`);
        return article;
    }
    async updateStatus(id, status) {
        const article = await this.findOne(id);
        article.status = status;
        await this.articleRepository.save(article);
        this.logger.log(`Article ${id} status changed to ${status}`);
        return article;
    }
    async remove(id) {
        const article = await this.findOne(id);
        article.status = article_entity_1.ArticleStatus.DELETED;
        await this.articleRepository.save(article);
        this.logger.log(`Article soft deleted: ${id}`);
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = ArticlesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rabbitmq_service_1.RabbitmqService,
        metrics_service_1.MetricsService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map