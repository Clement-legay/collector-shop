export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class Transaction {
    id: string;
    articleId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
}
