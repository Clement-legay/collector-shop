import { Injectable } from "@nestjs/common";
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  private readonly paymentsInitiatedCounter: Counter;
  private readonly paymentsCompletedCounter: Counter;
  private readonly requestDurationHistogram: Histogram;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.paymentsInitiatedCounter = new Counter({
      name: "payments_initiated_total",
      help: "Total number of payments initiated",
      registers: [this.registry],
    });

    this.paymentsCompletedCounter = new Counter({
      name: "payments_completed_total",
      help: "Total number of payments completed",
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

  incrementPaymentsInitiated(): void {
    this.paymentsInitiatedCounter.inc();
  }

  incrementPaymentsCompleted(): void {
    this.paymentsCompletedCounter.inc();
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
