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

  describe("register", () => {
    it("should throw ConflictException if user exists", async () => {
      mockRepository.findOne.mockResolvedValue({ id: "1" });
      await expect(
        service.register({ email: "test@test.com", password: "p", name: "n" }),
      ).rejects.toThrow("Email already registered");
    });

    it("should create a user, emit event, metrics, and return user without password", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const user = {
        id: "1",
        email: "test@test.com",
        password: "p",
        role: UserRole.BUYER,
        createdAt: new Date(),
      };
      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.register({
        email: "test@test.com",
        password: "p",
        name: "n",
      });

      expect(result.token).toBe("mocked-token");
      expect(result.user).not.toHaveProperty("password");
      expect(mockRabbitmqService.publish).toHaveBeenCalled();
      expect(mockMetricsService.incrementUsersRegistered).toHaveBeenCalled();
    });
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

  describe("findById and findAll", () => {
    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findById("1")).rejects.toThrow("User not found");
    });

    it("findAll should return users without passwords", async () => {
      mockRepository.find.mockResolvedValue([{ id: "1", password: "p" }]);
      const result = await service.findAll();
      expect(result[0]).not.toHaveProperty("password");
    });
  });

  describe("update", () => {
    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update("1", { name: "Test" })).rejects.toThrow(
        "User not found",
      );
    });

    it("should update user and publish event", async () => {
      const user = { id: "1", name: "Old", password: "p", role: UserRole.BUYER };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, name: "New" });

      const result = await service.update("1", { name: "New" });

      expect(result).not.toHaveProperty("password");
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockRabbitmqService.publish).toHaveBeenCalledWith(
        "user.updated",
        expect.anything(),
      );
    });
  });
});
