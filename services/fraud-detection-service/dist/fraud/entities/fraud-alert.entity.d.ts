export declare enum AlertType {
    PRICE_VARIATION = "price_variation",
    SUSPICIOUS_PURCHASES = "suspicious_purchases"
}
export declare enum AlertSeverity {
    GREEN = "green",
    ORANGE = "orange",
    RED = "red"
}
export declare class FraudAlert {
    id: string;
    alertType: AlertType;
    severity: AlertSeverity;
    userId: string;
    articleId: string;
    details: Record<string, any>;
    createdAt: Date;
}
