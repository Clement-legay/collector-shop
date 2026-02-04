import { Injectable } from '@nestjs/common';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
    private readonly registry: Registry;
    private readonly articlesCreatedCounter: Counter;
    private readonly articlesUpdatedCounter: Counter;
    private readonly priceChangesCounter: Counter;

    constructor() {
        this.registry = new Registry();
        collectDefaultMetrics({ register: this.registry });

        this.articlesCreatedCounter = new Counter({
            name: 'articles_created_total',
            help: 'Total number of articles created',
            registers: [this.registry],
        });

        this.articlesUpdatedCounter = new Counter({
            name: 'articles_updated_total',
            help: 'Total number of articles updated',
            registers: [this.registry],
        });

        this.priceChangesCounter = new Counter({
            name: 'price_changes_total',
            help: 'Total number of price changes',
            registers: [this.registry],
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

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
