import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "../../../src/users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User, UserRole } from "../../../src/users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { RabbitmqService } from "../../../src/rabbitmq/rabbitmq.service";
import { MetricsService } from "../../../src/metrics/metrics.service";
import { UnauthorizedException } from "@nestjs/common";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked-token"),
}));

describe("UsersService", () => {
  let service: UsersService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
  };

  const mockRabbitmqService = {
    publish: jest.fn(),
  };

  const mockMetricsService = {
    incrementUsersRegistered: jest.fn(),
    incrementLogins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RabbitmqService, useValue: mockRabbitmqService },
        { provide: MetricsService, useValue: mockMetricsService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("should throw an UnauthorizedException if user is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: "test@test.com", password: "password" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw an UnauthorizedException if user is banned (isActive: false)", async () => {
      const activeUser = {
        email: "test@test.com",
        password: "password",
        isActive: false,
      };
      mockRepository.findOne.mockResolvedValue(activeUser);
      await expect(
        service.login({ email: "test@test.com", password: "password" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return a user and a token if credentials are valid and user is active", async () => {
      const activeUser = {
        id: "1",
        email: "test@test.com",
        password: "password",
        isActive: true,
        role: UserRole.BUYER,
      };
      mockRepository.findOne.mockResolvedValue(activeUser);

      const result = await service.login({
        email: "test@test.com",
        password: "password",
      });
      expect(result).toHaveProperty("token", "mocked-token");
      expect(result.user).not.toHaveProperty("password");
      expect(mockMetricsService.incrementLogins).toHaveBeenCalled();
    });
  });

  describe("ban", () => {
    it("should set isActive to false and publish a user.banned event", async () => {
      const user = { id: "1", isActive: true };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, isActive: false });

      const result = await service.ban("1");
      expect(result.isActive).toBe(false);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockRabbitmqService.publish).toHaveBeenCalledWith(
        "user.banned",
        expect.objectContaining({
          eventType: "UserBanned",
          data: { userId: "1" },
        }),
      );
    });
  });

  describe("unban", () => {
    it("should set isActive to true and publish a user.unbanned event", async () => {
      const user = { id: "1", isActive: false };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, isActive: true });

      const result = await service.unban("1");
      expect(result.isActive).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockRabbitmqService.publish).toHaveBeenCalledWith(
        "user.unbanned",
        expect.objectContaining({
          eventType: "UserUnbanned",
          data: { userId: "1" },
        }),
      );
    });
  });
});
