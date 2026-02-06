import { AlertType, AlertSeverity } from "../fraud/entities/fraud-alert.entity";
export declare class MetricsService {
    private readonly registry;
    private readonly fraudAlertsCounter;
    private readonly eventsProcessedCounter;
    constructor();
    incrementFraudAlerts(type: AlertType, severity: AlertSeverity): void;
    incrementEventsProcessed(eventType: string): void;
    getMetrics(): Promise<string>;
}
