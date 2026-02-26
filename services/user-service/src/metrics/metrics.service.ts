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
  private readonly usersRegisteredCounter: Counter;
  private readonly loginsCounter: Counter;
  private readonly requestDurationHistogram: Histogram;

  constructor() {
    this.registry = new Registry();

    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Custom counters
    this.usersRegisteredCounter = new Counter({
      name: "users_registered_total",
      help: "Total number of users registered",
      labelNames: ["email"],
      registers: [this.registry],
    });

    this.loginsCounter = new Counter({
      name: "logins_total",
      help: "Total number of user logins",
      labelNames: ["email"],
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

  incrementUsersRegistered(email: string): void {
    this.usersRegisteredCounter.inc({ email });
  }

  incrementLogins(email: string): void {
    this.loginsCounter.inc({ email });
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

  getContentType(): string {
    return this.registry.contentType;
  }
}
