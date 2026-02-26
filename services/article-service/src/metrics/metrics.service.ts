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
  private readonly articlesCreatedCounter: Counter;
  private readonly articlesUpdatedCounter: Counter;
  private readonly priceChangesCounter: Counter;
  private readonly requestDurationHistogram: Histogram;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.articlesCreatedCounter = new Counter({
      name: "articles_created_total",
      help: "Total number of articles created",
      registers: [this.registry],
    });

    this.articlesUpdatedCounter = new Counter({
      name: "articles_updated_total",
      help: "Total number of articles updated",
      registers: [this.registry],
    });

    this.priceChangesCounter = new Counter({
      name: "price_changes_total",
      help: "Total number of price changes",
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

  incrementArticlesCreated(): void {
    this.articlesCreatedCounter.inc();
  }

  incrementArticlesUpdated(): void {
    this.articlesUpdatedCounter.inc();
  }

  incrementPriceChanges(): void {
    this.priceChangesCounter.inc();
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
