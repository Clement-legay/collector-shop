import { Injectable } from "@nestjs/common";
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";
import { AlertType, AlertSeverity } from "../fraud/entities/fraud-alert.entity";

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  private readonly fraudAlertsCounter: Counter;
  private readonly eventsProcessedCounter: Counter;
  private readonly requestDurationHistogram: Histogram;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.fraudAlertsCounter = new Counter({
      name: "fraud_alerts_total",
      help: "Total number of fraud alerts by type and severity",
      labelNames: ["type", "severity", "user_id", "article_id", "details"],
      registers: [this.registry],
    });

    this.eventsProcessedCounter = new Counter({
      name: "events_processed_total",
      help: "Total number of events processed",
      labelNames: ["event_type"],
      registers: [this.registry],
    });

    // HTTP Request duration histogram
    this.requestDurationHistogram = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "path", "status"],
      registers: [this.registry],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });
  }

  incrementFraudAlerts(
    type: AlertType,
    severity: AlertSeverity,
    userId?: string,
    articleId?: string,
    details?: string,
  ): void {
    this.fraudAlertsCounter.inc({
      type,
      severity,
      user_id: userId || "unknown",
      article_id: articleId || "unknown",
      details: details || "none",
    });
  }

  incrementEventsProcessed(eventType: string): void {
    this.eventsProcessedCounter.inc({ event_type: eventType });
  }

  recordRequestDuration(
    method: string,
    path: string,
    status: string,
    durationInSeconds: number,
  ): void {
    this.requestDurationHistogram.observe(
      { method, path, status },
      durationInSeconds,
    );
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
