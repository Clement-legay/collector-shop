export declare class MetricsService {
    private readonly registry;
    private readonly articlesCreatedCounter;
    private readonly articlesUpdatedCounter;
    private readonly priceChangesCounter;
    constructor();
    incrementArticlesCreated(): void;
    incrementArticlesUpdated(): void;
    incrementPriceChanges(): void;
    getMetrics(): Promise<string>;
}
