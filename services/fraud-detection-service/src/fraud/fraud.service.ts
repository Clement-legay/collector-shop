import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  FraudAlert,
  AlertType,
  AlertSeverity,
} from "./entities/fraud-alert.entity";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(
    @InjectRepository(FraudAlert)
    private readonly alertRepository: Repository<FraudAlert>,
    private readonly metricsService: MetricsService,
  ) {}

  async createAlert(
    alertType: AlertType,
    severity: AlertSeverity,
    userId?: string,
    articleId?: string,
    details?: Record<string, any>,
  ): Promise<FraudAlert> {
    const alert = this.alertRepository.create({
      alertType,
      severity,
      userId,
      articleId,
      details,
    });

    await this.alertRepository.save(alert);

    // Increment Prometheus counter
    this.metricsService.incrementFraudAlerts(alertType, severity);

    this.logger.warn(
      `🚨 FRAUD ALERT [${severity.toUpperCase()}] - ${alertType}: ${JSON.stringify(details)}`,
    );

    return alert;
  }

  async findAll(): Promise<FraudAlert[]> {
    return this.alertRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findByType(type: AlertType): Promise<FraudAlert[]> {
    return this.alertRepository.find({
      where: { alertType: type },
      order: { createdAt: "DESC" },
    });
  }

  async findBySeverity(severity: AlertSeverity): Promise<FraudAlert[]> {
    return this.alertRepository.find({
      where: { severity },
      order: { createdAt: "DESC" },
    });
  }

  async getStats(): Promise<
    { type: string; severity: string; count: number }[]
  > {
    const result = await this.alertRepository
      .createQueryBuilder("alert")
      .select("alert.alertType", "type")
      .addSelect("alert.severity", "severity")
      .addSelect("COUNT(*)", "count")
      .groupBy("alert.alertType")
      .addGroupBy("alert.severity")
      .getRawMany();

    return result;
  }
}
