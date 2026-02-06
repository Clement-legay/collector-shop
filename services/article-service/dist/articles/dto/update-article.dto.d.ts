import { ArticleStatus } from "../entities/article.entity";
export declare class UpdateArticleDto {
    title?: string;
    description?: string;
    price?: number;
    photos?: string[];
    status?: ArticleStatus;
}
