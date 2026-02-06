import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
export interface Article {
    id: string;
    title: string;
    price: number;
    sellerId: string;
    status: string;
}
export declare class ArticleClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getArticle(articleId: string): Promise<Article | null>;
    updateArticleStatus(articleId: string, status: string): Promise<boolean>;
}
