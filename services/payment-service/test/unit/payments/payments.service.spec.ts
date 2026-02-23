import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "../../../src/payments/payments.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  Transaction,
  TransactionStatus,
} from "../../../src/payments/entities/transaction.entity";
import { ArticleClient } from "../../../src/clients/article.client";
import { RabbitmqService } from "../../../src/rabbitmq/rabbitmq.service";
import { MetricsService } from "../../../src/metrics/metrics.service";
import { BadRequestException, NotFoundException, Logger } from "@nestjs/common";

describe("PaymentsService", () => {
  let service: PaymentsService;

  const mockTransactionRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((dto) => Promise.resolve({ id: "txn-1", ...dto })),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockArticleClient = {
    getArticle: jest.fn(),
    updateArticleStatus: jest.fn(),
  };

  const mockRabbitmqService = {
    publish: jest.fn(),
  };

  const mockMetricsService = {
    incrementPaymentsInitiated: jest.fn(),
    incrementPaymentsCompleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        { provide: ArticleClient, useValue: mockArticleClient },
        { provide: RabbitmqService, useValue: mockRabbitmqService },
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("initiatePayment", () => {
    it("should throw NotFoundException if article does not exist", async () => {
      mockArticleClient.getArticle.mockResolvedValue(null);
      await expect(
        service.initiatePayment({ articleId: "1", buyerId: "2", amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if article is not published", async () => {
      mockArticleClient.getArticle.mockResolvedValue({
        id: "1",
        status: "sold",
      });
      await expect(
        service.initiatePayment({ articleId: "1", buyerId: "2", amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should create transaction and emit event if valid", async () => {
      mockArticleClient.getArticle.mockResolvedValue({
        id: "1",
        sellerId: "3",
        status: "published",
      });
      mockArticleClient.updateArticleStatus.mockResolvedValue(true);

      const dto = { articleId: "1", buyerId: "2", amount: 100 };
      const result = await service.initiatePayment(dto);

      expect(result.status).toBe(TransactionStatus.PENDING);
      expect(mockTransactionRepository.create).toHaveBeenCalled();
      expect(mockTransactionRepository.save).toHaveBeenCalled();
      expect(mockRabbitmqService.publish).toHaveBeenCalledWith(
        "payment.initiated",
        expect.anything(),
      );
      expect(mockArticleClient.updateArticleStatus).toHaveBeenCalledWith(
        "1",
        "pending",
      );
    });
  });

  describe("validateTransaction", () => {
    it("should throw NotFoundException if transaction not found", async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      await expect(service.validateTransaction("1", true)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should complete payment if approved is true", async () => {
      const txn = {
        id: "txn-1",
        status: TransactionStatus.PENDING,
        articleId: "1",
      };
      mockTransactionRepository.findOne.mockResolvedValue(txn);
      mockArticleClient.updateArticleStatus.mockResolvedValue(true);

      const result = await service.validateTransaction("txn-1", true);

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(mockRabbitmqService.publish).toHaveBeenCalledWith(
        "payment.purchase_completed",
        expect.anything(),
      );
    });

    it("should cancel payment and release article if approved is false", async () => {
      const txn = {
        id: "txn-1",
        status: TransactionStatus.PENDING,
        articleId: "1",
      };
      mockTransactionRepository.findOne.mockResolvedValue(txn);
      mockArticleClient.updateArticleStatus.mockResolvedValue(true);

      const result = await service.validateTransaction("txn-1", false);

      expect(result.status).toBe(TransactionStatus.CANCELLED);
      expect(mockArticleClient.updateArticleStatus).toHaveBeenCalledWith(
        "1",
        "published",
      );
    });

    it("should throw BadRequestException if transaction is not pending", async () => {
      const txn = {
        id: "txn-1",
        status: TransactionStatus.COMPLETED,
        articleId: "1",
      };
      mockTransactionRepository.findOne.mockResolvedValue(txn);
      await expect(service.validateTransaction("txn-1", true)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should set transaction to FAILED if article update fails during completion", async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => { });

      const txn = {
        id: "txn-1",
        status: TransactionStatus.PENDING,
        articleId: "1",
      };
      mockTransactionRepository.findOne.mockResolvedValue(txn);
      mockArticleClient.updateArticleStatus.mockResolvedValue(false);

      const result = await service.validateTransaction("txn-1", true);

      expect(result.status).toBe(TransactionStatus.FAILED);
      expect(mockTransactionRepository.save).toHaveBeenCalled();

      loggerSpy.mockRestore();
    });
  });

  describe("Queries", () => {
    it("findOne should return a transaction or throw NotFoundException", async () => {
      mockTransactionRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne("1")).rejects.toThrow(NotFoundException);

      mockTransactionRepository.findOne.mockResolvedValueOnce({ id: "1" });
      const res = await service.findOne("1");
      expect(res.id).toBe("1");
    });

    it("findByUser should return transactions", async () => {
      mockTransactionRepository.find.mockResolvedValue([{ id: "1" }]);
      const res = await service.findByUser("user1");
      expect(res).toHaveLength(1);
    });

    it("findSalesBySeller should return transactions", async () => {
      mockTransactionRepository.find.mockResolvedValue([{ id: "1" }]);
      const res = await service.findSalesBySeller("seller1");
      expect(res).toHaveLength(1);
    });

    it("findAll should return transactions", async () => {
      mockTransactionRepository.find.mockResolvedValue([{ id: "1" }]);
      const res = await service.findAll();
      expect(res).toHaveLength(1);
    });
  });
});
