export declare class MetricsService {
    private readonly registry;
    private readonly paymentsInitiatedCounter;
    private readonly paymentsCompletedCounter;
    constructor();
    incrementPaymentsInitiated(): void;
    incrementPaymentsCompleted(): void;
    getMetrics(): Promise<string>;
}
