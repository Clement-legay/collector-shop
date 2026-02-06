import { Repository } from "typeorm";
import { FraudAlert, AlertType, AlertSeverity } from "./entities/fraud-alert.entity";
import { MetricsService } from "../metrics/metrics.service";
export declare class FraudService {
    private readonly alertRepository;
    private readonly metricsService;
    private readonly logger;
    constructor(alertRepository: Repository<FraudAlert>, metricsService: MetricsService);
    createAlert(alertType: AlertType, severity: AlertSeverity, userId?: string, articleId?: string, details?: Record<string, any>): Promise<FraudAlert>;
    findAll(): Promise<FraudAlert[]>;
    findByType(type: AlertType): Promise<FraudAlert[]>;
    findBySeverity(severity: AlertSeverity): Promise<FraudAlert[]>;
    getStats(): Promise<{
        type: string;
        severity: string;
        count: number;
    }[]>;
}
