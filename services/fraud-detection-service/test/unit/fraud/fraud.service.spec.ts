import { Test, TestingModule } from "@nestjs/testing";
import { FraudService } from "../../../src/fraud/fraud.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  FraudAlert,
  AlertType,
  AlertSeverity,
} from "../../../src/fraud/entities/fraud-alert.entity";
import { FraudProfile } from "../../../src/fraud/entities/fraud-profile.entity";
import { MetricsService } from "../../../src/metrics/metrics.service";

describe("FraudService", () => {
  let service: FraudService;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockAlertRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((dto) => Promise.resolve(dto)),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((dto) => Promise.resolve(dto)),
  };

  const mockMetricsService = {
    incrementFraudAlerts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudService,
        {
          provide: getRepositoryToken(FraudAlert),
          useValue: mockAlertRepository,
        },
        {
          provide: getRepositoryToken(FraudProfile),
          useValue: mockProfileRepository,
        },
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<FraudService>(FraudService);

    // reset HIGH_RISK_THRESHOLD logic mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createAlert", () => {
    it("should create an alert, increment metrics and update user score", async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await service.createAlert(
        AlertType.SUSPICIOUS_PURCHASES,
        AlertSeverity.ORANGE,
        "user-1",
        "article-1",
        { count: 5 },
      );

      expect(mockAlertRepository.create).toHaveBeenCalledWith({
        alertType: AlertType.SUSPICIOUS_PURCHASES,
        severity: AlertSeverity.ORANGE,
        userId: "user-1",
        articleId: "article-1",
        details: { count: 5 },
      });
      expect(mockAlertRepository.save).toHaveBeenCalled();
      expect(mockMetricsService.incrementFraudAlerts).toHaveBeenCalledWith(
        AlertType.SUSPICIOUS_PURCHASES,
        AlertSeverity.ORANGE,
        "user-1",
        "article-1",
        '{"count":5}',
      );
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
      // Because ORANGE, profile score should increment by 10
      expect(mockProfileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ score: 10 }),
      );
    });

    it("should trigger a HIGH_RISK_USER alert if score exceeds threshold (50)", async () => {
      mockProfileRepository.findOne.mockResolvedValue({
        userId: "user-2",
        score: 40,
      });

      // We pass RED severity, which increments score by 50, taking it to 90 (above threshold 50)
      await service.createAlert(
        AlertType.PRICE_VARIATION,
        AlertSeverity.RED,
        "user-2",
        undefined,
        {},
      );

      expect(mockProfileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ score: 90 }),
      );

      // It should recursively call createAlert for HIGH_RISK_USER
      expect(mockAlertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          alertType: AlertType.HIGH_RISK_USER,
          severity: AlertSeverity.RED,
          userId: "user-2",
        }),
      );
    });
  });

  describe("findAll / findByType / findBySeverity", () => {
    it("findAll should return all alerts", async () => {
      const expected = [{ id: "1" }];
      mockAlertRepository.find.mockResolvedValue(expected);
      const res = await service.findAll();
      expect(res).toBe(expected);
    });
  });

  describe("getStats", () => {
    it("should build the stats query", async () => {
      const expected = [{ type: "t", severity: "s", count: "1" }];
      mockQueryBuilder.getRawMany.mockResolvedValue(expected);
      const res = await service.getStats();
      expect(res).toBe(expected);
    });
  });
});
