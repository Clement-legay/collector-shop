import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Article, ArticleStatus } from "./entities/article.entity";
import { CreateArticleDto, UpdateArticleDto, UpdatePriceDto } from "./dto";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly rabbitmqService: RabbitmqService,
    private readonly metricsService: MetricsService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create({
      ...createArticleDto,
      status: createArticleDto.status || ArticleStatus.PUBLISHED,
    });

    await this.articleRepository.save(article);

    // Emit event
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

  async findAll(filters?: {
    status?: ArticleStatus;
    sellerId?: string;
  }): Promise<Article[]> {
    const query = this.articleRepository.createQueryBuilder("article");

    if (filters?.status) {
      query.andWhere("article.status = :status", { status: filters.status });
    }

    if (filters?.sellerId) {
      query.andWhere("article.sellerId = :sellerId", {
        sellerId: filters.sellerId,
      });
    }

    // Exclude deleted articles by default
    query.andWhere("article.status != :deleted", {
      deleted: ArticleStatus.DELETED,
    });

    query.orderBy("article.createdAt", "DESC");

    return query.getMany();
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return article;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOne(id);

    // Check if price is being updated
    if (
      updateArticleDto.price !== undefined &&
      updateArticleDto.price !== article.price
    ) {
      return this.updatePrice(id, { price: updateArticleDto.price });
    }

    Object.assign(article, updateArticleDto);
    await this.articleRepository.save(article);

    // Emit event
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

  async updatePrice(
    id: string,
    updatePriceDto: UpdatePriceDto,
  ): Promise<Article> {
    const article = await this.findOne(id);
    const oldPrice = Number(article.price);
    const newPrice = updatePriceDto.price;

    // Store previous price for tracking
    article.previousPrice = oldPrice;
    article.price = newPrice;
    await this.articleRepository.save(article);

    // Emit price changed event
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
    this.logger.log(
      `Price changed for article ${article.id}: ${oldPrice} → ${newPrice}`,
    );

    return article;
  }

  async updateStatus(id: string, status: ArticleStatus): Promise<Article> {
    const article = await this.findOne(id);
    article.status = status;
    await this.articleRepository.save(article);

    this.logger.log(`Article ${id} status changed to ${status}`);
    return article;
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    article.status = ArticleStatus.DELETED;
    await this.articleRepository.save(article);

    this.logger.log(`Article soft deleted: ${id}`);
  }
}
