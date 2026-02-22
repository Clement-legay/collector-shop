import { Test, TestingModule } from "@nestjs/testing";
import { FraudController } from "../../../src/fraud/fraud.controller";
import { FraudService } from "../../../src/fraud/fraud.service";
import {
  AlertType,
  AlertSeverity,
} from "../../../src/fraud/entities/fraud-alert.entity";

describe("FraudController", () => {
  let controller: FraudController;
  let service: FraudService;

  const mockFraudService = {
    findByType: jest.fn(),
    findBySeverity: jest.fn(),
    findAll: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FraudController],
      providers: [
        {
          provide: FraudService,
          useValue: mockFraudService,
        },
      ],
    }).compile();

    controller = module.get<FraudController>(FraudController);
    service = module.get<FraudService>(FraudService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAlerts", () => {
    it("should return alerts by type if type is provided", async () => {
      const expected = [{ id: "1", alertType: AlertType.HIGH_RISK_USER }];
      mockFraudService.findByType.mockResolvedValue(expected);

      expect(await controller.getAlerts(AlertType.HIGH_RISK_USER)).toBe(
        expected,
      );
      expect(service.findByType).toHaveBeenCalledWith(AlertType.HIGH_RISK_USER);
      expect(service.findBySeverity).not.toHaveBeenCalled();
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it("should return alerts by severity if severity is provided", async () => {
      const expected = [{ id: "1", severity: AlertSeverity.RED }];
      mockFraudService.findBySeverity.mockResolvedValue(expected);

      expect(await controller.getAlerts(undefined, AlertSeverity.RED)).toBe(
        expected,
      );
      expect(service.findBySeverity).toHaveBeenCalledWith(AlertSeverity.RED);
    });

    it("should return all alerts if no filters are provided", async () => {
      const expected = [{ id: "1" }];
      mockFraudService.findAll.mockResolvedValue(expected);

      expect(await controller.getAlerts()).toBe(expected);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("getStats", () => {
    it("should return stats", async () => {
      const expected = [
        { type: "price_variation", severity: "orange", count: 5 },
      ];
      mockFraudService.getStats.mockResolvedValue(expected);

      expect(await controller.getStats()).toBe(expected);
      expect(service.getStats).toHaveBeenCalled();
    });
  });
});
