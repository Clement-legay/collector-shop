import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsController } from "../../../src/payments/payments.controller";
import { PaymentsService } from "../../../src/payments/payments.service";

describe("PaymentsController", () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    initiatePayment: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUser: jest.fn(),
    findSalesBySeller: jest.fn(),
    validateTransaction: jest.fn(),
    completePayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("initiatePayment", () => {
    it("should initiate a payment", async () => {
      const dto = { articleId: "1", buyerId: "2", amount: 100 };
      const expected = { id: "txn-1", ...dto };
      mockPaymentsService.initiatePayment.mockResolvedValue(expected);

      expect(await controller.initiatePayment(dto)).toBe(expected);
      expect(service.initiatePayment).toHaveBeenCalledWith(dto);
    });
  });

  describe("validate", () => {
    it("should validate a transaction", async () => {
      const expected = { id: "1", status: "COMPLETED" };
      mockPaymentsService.validateTransaction.mockResolvedValue(expected);

      expect(await controller.validate("1", true)).toBe(expected);
      expect(service.validateTransaction).toHaveBeenCalledWith("1", true);
    });
  });

  describe("Queries and Complete", () => {
    it("findAll", async () => {
      mockPaymentsService.findAll.mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
    });

    it("findOne", async () => {
      mockPaymentsService.findOne.mockResolvedValue({ id: "1" });
      expect(await controller.findOne("1")).toEqual({ id: "1" });
    });

    it("findByUser", async () => {
      mockPaymentsService.findByUser.mockResolvedValue([]);
      expect(await controller.findByUser("user1")).toEqual([]);
    });

    it("findBySeller", async () => {
      mockPaymentsService.findSalesBySeller.mockResolvedValue([]);
      expect(await controller.findBySeller("seller1")).toEqual([]);
    });

    it("completePayment", async () => {
      mockPaymentsService.completePayment.mockResolvedValue({ id: "1" });
      expect(await controller.completePayment("1")).toEqual({ id: "1" });
    });
  });
});
