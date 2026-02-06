export declare enum ArticleStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    SOLD = "sold",
    DELETED = "deleted"
}
export declare class Article {
    id: string;
    title: string;
    description: string;
    price: number;
    previousPrice: number;
    sellerId: string;
    photos: string[];
    status: ArticleStatus;
    createdAt: Date;
    updatedAt: Date;
}
