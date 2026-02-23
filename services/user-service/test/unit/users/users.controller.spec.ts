import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "../../../src/users/users.controller";
import { UsersService } from "../../../src/users/users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    register: jest.fn(),
    login: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    ban: jest.fn(),
    unban: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should call register on the service", async () => {
      const dto = { email: "test@test.com", password: "p", name: "n" };
      mockUsersService.register.mockResolvedValue({ user: dto, token: "t" });
      const result = await controller.register(dto);
      expect(result).toEqual({ user: dto, token: "t" });
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe("login", () => {
    it("should call login on the service", async () => {
      const dto = { email: "test@test.com", password: "p" };
      mockUsersService.login.mockResolvedValue({ user: dto, token: "t" });
      const result = await controller.login(dto);
      expect(result).toEqual({ user: dto, token: "t" });
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });

  describe("findAll", () => {
    it("should return users array", async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should call update on the service", async () => {
      const mockUser = { id: "1", email: "updated@test.com" };
      mockUsersService.update.mockResolvedValue(mockUser);
      const dto = { name: "Updated" };

      const result = await controller.update("1", dto);
      expect(result).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith("1", dto);
    });
  });

  describe("findById", () => {
    it("should return a user", async () => {
      const mockUser = { id: "1", email: "test@test.com", name: "Test User" };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne("1");
      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith("1");
    });
  });

  describe("ban / unban", () => {
    it("should call ban on the service", async () => {
      const mockUser = { id: "1", isActive: false };
      mockUsersService.ban.mockResolvedValue(mockUser);

      const result = await controller.ban("1");
      expect(result).toEqual(mockUser);
      expect(service.ban).toHaveBeenCalledWith("1");
    });

    it("should call unban on the service", async () => {
      const mockUser = { id: "1", isActive: true };
      mockUsersService.unban.mockResolvedValue(mockUser);

      const result = await controller.unban("1");
      expect(result).toEqual(mockUser);
      expect(service.unban).toHaveBeenCalledWith("1");
    });
  });
});
