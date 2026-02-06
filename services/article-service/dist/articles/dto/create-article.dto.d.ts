import { ArticleStatus } from "../entities/article.entity";
export declare class CreateArticleDto {
    title: string;
    description?: string;
    price: number;
    sellerId: string;
    photos?: string[];
    status?: ArticleStatus;
}
