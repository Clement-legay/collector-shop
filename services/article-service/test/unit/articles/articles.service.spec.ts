import { Test, TestingModule } from "@nestjs/testing";
import { ArticlesService } from "../../../src/articles/articles.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  Article,
  ArticleStatus,
} from "../../../src/articles/entities/article.entity";
import { RabbitmqService } from "../../../src/rabbitmq/rabbitmq.service";
import { MetricsService } from "../../../src/metrics/metrics.service";
import { NotFoundException } from "@nestjs/common";

describe("ArticlesService", () => {
  let service: ArticlesService;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockRabbitmqService = {
    publish: jest.fn(),
  };

  const mockMetricsService = {
    incrementArticlesCreated: jest.fn(),
    incrementArticlesUpdated: jest.fn(),
    incrementPriceChanges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(Article), useValue: mockRepository },
        { provide: RabbitmqService, useValue: mockRabbitmqService },
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should successfully create an article and publish an event", async () => {
      const dto = {
        title: "Test",
        description: "Desc",
        price: 100,
        sellerId: "1",
      };
      const article = { id: "10", ...dto, status: ArticleStatus.PUBLISHED };

      mockRepository.create.mockReturnValue(article);
      mockRepository.save.mockResolvedValue(article);

      const result = await service.create(dto);

      expect(result).toEqual(article);
      expect(mockRepository.save).toHaveBeenCalledWith(article);
      expect(mockRabbitmqService.publish).toHaveBeenCalledWith(
        "article.created",
        expect.objectContaining({
          eventType: "ArticleCreated",
        }),
      );
      expect(mockMetricsService.incrementArticlesCreated).toHaveBeenCalled();
    });
  });

  describe("updatePrice", () => {
    it("should throw NotFoundException if article does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.updatePrice("1", { price: 150 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should update the price, set previousPrice, and publish price_changed event", async () => {
      const article = {
        id: "1",
        price: 100,
        previousPrice: null,
        sellerId: "123",
      };
      mockRepository.findOne.mockResolvedValue(article);
      mockRepository.save.mockResolvedValue({
        ...article,
        price: 150,
        previousPrice: 100,
      });

      const result = await service.updatePrice("1", { price: 150 });

      expect(result.price).toBe(150);
      expect(article.previousPrice).toBe(100);
      expect(mockRepository.save).toHaveBeenCalledWith(article);

      expect(mockRabbitmqService.publish).toHaveBeenCalledWith(
        "article.price_changed",
        expect.objectContaining({
          eventType: "PriceChanged",
          data: expect.objectContaining({ oldPrice: 100, newPrice: 150 }),
        }),
      );
      expect(mockMetricsService.incrementPriceChanges).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should build query and return articles", async () => {
      const articles = [{ id: "1", title: "Test" }];
      mockQueryBuilder.getMany.mockResolvedValue(articles);

      const result = await service.findAll({ status: ArticleStatus.PUBLISHED });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("article");
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "article.status = :status",
        { status: ArticleStatus.PUBLISHED },
      );
      expect(result).toEqual(articles);
    });
  });
});
