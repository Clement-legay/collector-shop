import { Repository } from "typeorm";
import { Article, ArticleStatus } from "./entities/article.entity";
import { CreateArticleDto, UpdateArticleDto, UpdatePriceDto } from "./dto";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { MetricsService } from "../metrics/metrics.service";
export declare class ArticlesService {
    private readonly articleRepository;
    private readonly rabbitmqService;
    private readonly metricsService;
    private readonly logger;
    constructor(articleRepository: Repository<Article>, rabbitmqService: RabbitmqService, metricsService: MetricsService);
    create(createArticleDto: CreateArticleDto): Promise<Article>;
    findAll(filters?: {
        status?: ArticleStatus;
        sellerId?: string;
    }): Promise<Article[]>;
    findOne(id: string): Promise<Article>;
    update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article>;
    updatePrice(id: string, updatePriceDto: UpdatePriceDto): Promise<Article>;
    updateStatus(id: string, status: ArticleStatus): Promise<Article>;
    remove(id: string): Promise<void>;
}
