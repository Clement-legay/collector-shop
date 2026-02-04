import { Injectable } from '@nestjs/common';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
    private readonly registry: Registry;
    private readonly paymentsInitiatedCounter: Counter;
    private readonly paymentsCompletedCounter: Counter;

    constructor() {
        this.registry = new Registry();
        collectDefaultMetrics({ register: this.registry });

        this.paymentsInitiatedCounter = new Counter({
            name: 'payments_initiated_total',
            help: 'Total number of payments initiated',
            registers: [this.registry],
        });

        this.paymentsCompletedCounter = new Counter({
            name: 'payments_completed_total',
            help: 'Total number of payments completed',
            registers: [this.registry],
        });
    }

    incrementPaymentsInitiated(): void {
        this.paymentsInitiatedCounter.inc();
    }

    incrementPaymentsCompleted(): void {
        this.paymentsCompletedCounter.inc();
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
