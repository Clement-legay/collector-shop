import { FraudService } from "./fraud.service";
import { AlertType, AlertSeverity } from "./entities/fraud-alert.entity";
export declare class FraudController {
    private readonly fraudService;
    constructor(fraudService: FraudService);
    getAlerts(type?: AlertType, severity?: AlertSeverity): Promise<import("./entities/fraud-alert.entity").FraudAlert[]>;
    getStats(): Promise<{
        type: string;
        severity: string;
        count: number;
    }[]>;
}
