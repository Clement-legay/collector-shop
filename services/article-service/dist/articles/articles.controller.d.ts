import { ArticlesService } from "./articles.service";
import { CreateArticleDto, UpdateArticleDto, UpdatePriceDto } from "./dto";
import { ArticleStatus } from "./entities/article.entity";
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    create(createArticleDto: CreateArticleDto): Promise<import("./entities/article.entity").Article>;
    findAll(status?: ArticleStatus, sellerId?: string): Promise<import("./entities/article.entity").Article[]>;
    findOne(id: string): Promise<import("./entities/article.entity").Article>;
    update(id: string, updateArticleDto: UpdateArticleDto): Promise<import("./entities/article.entity").Article>;
    updatePrice(id: string, updatePriceDto: UpdatePriceDto): Promise<import("./entities/article.entity").Article>;
    updateStatus(id: string, status: ArticleStatus): Promise<import("./entities/article.entity").Article>;
    remove(id: string): Promise<void>;
}
