import { Test, TestingModule } from "@nestjs/testing";
import { ArticlesController } from "../../../src/articles/articles.controller";
import { ArticlesService } from "../../../src/articles/articles.service";
import { ArticleStatus } from "../../../src/articles/entities/article.entity";

describe("ArticlesController", () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockArticlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updatePrice: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of articles", async () => {
      const result = [{ id: "1", title: "Test Article", price: 100 }];
      mockArticlesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll({})).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe("create", () => {
    it("should create an article", async () => {
      const dto = {
        title: "New",
        description: "Desc",
        price: 50,
        sellerId: "123",
      };
      const expected = { id: "2", ...dto, status: ArticleStatus.PUBLISHED };
      mockArticlesService.create.mockResolvedValue(expected);

      expect(await controller.create(dto)).toBe(expected);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("updateStatus", () => {
    it("should update the status", async () => {
      const expected = { id: "1", status: ArticleStatus.SOLD };
      mockArticlesService.updateStatus.mockResolvedValue(expected);

      expect(await controller.updateStatus("1", ArticleStatus.SOLD)).toBe(
        expected,
      );
      expect(service.updateStatus).toHaveBeenCalledWith(
        "1",
        ArticleStatus.SOLD,
      );
    });
  });
});
