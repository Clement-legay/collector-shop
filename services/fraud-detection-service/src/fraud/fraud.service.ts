import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  FraudAlert,
  AlertType,
  AlertSeverity,
} from "./entities/fraud-alert.entity";
import { MetricsService } from "../metrics/metrics.service";

import { FraudProfile } from "./entities/fraud-profile.entity";

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);
  private readonly HIGH_RISK_THRESHOLD = 50;

  constructor(
    @InjectRepository(FraudAlert)
    private readonly alertRepository: Repository<FraudAlert>,
    @InjectRepository(FraudProfile)
    private readonly profileRepository: Repository<FraudProfile>,
    private readonly metricsService: MetricsService,
  ) { }

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
    this.metricsService.incrementFraudAlerts(
      alertType,
      severity,
      userId,
      articleId,
      details ? JSON.stringify(details) : undefined,
    );

    this.logger.warn(
      `🚨 FRAUD ALERT [${severity.toUpperCase()}] - ${alertType}: ${JSON.stringify(details)}`,
    );

    // Update User Score if userId is present and preventing infinite loops
    if (userId && alertType !== AlertType.HIGH_RISK_USER) {
      await this.updateUserScore(userId, severity);
    }

    return alert;
  }

  private async updateUserScore(userId: string, severity: AlertSeverity) {
    let profile = await this.profileRepository.findOne({ where: { userId } });

    if (!profile) {
      profile = this.profileRepository.create({ userId, score: 0 });
    }

    let increment = 0;
    switch (severity) {
      case AlertSeverity.ORANGE:
        increment = 10;
        break;
      case AlertSeverity.RED:
        increment = 50; // Immediate flag if Red
        break;
    }

    if (increment > 0) {
      profile.score += increment;
      await this.profileRepository.save(profile);
      this.logger.log(
        `User ${userId} fraud score updated: ${profile.score} (+${increment})`,
      );

      if (profile.score >= this.HIGH_RISK_THRESHOLD) {
        this.logger.warn(
          `🚨 USER ${userId} IS HIGH RISK (Score: ${profile.score})`,
        );
        await this.createAlert(
          AlertType.HIGH_RISK_USER,
          AlertSeverity.RED,
          userId,
          undefined,
          {
            score: profile.score,
            message: "User exceeded fraud score threshold",
          },
        );
      }
    }
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
