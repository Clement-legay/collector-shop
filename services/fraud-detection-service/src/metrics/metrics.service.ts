import { Injectable } from '@nestjs/common';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';
import { AlertType, AlertSeverity } from '../fraud/entities/fraud-alert.entity';

@Injectable()
export class MetricsService {
    private readonly registry: Registry;
    private readonly fraudAlertsCounter: Counter;
    private readonly eventsProcessedCounter: Counter;

    constructor() {
        this.registry = new Registry();
        collectDefaultMetrics({ register: this.registry });

        this.fraudAlertsCounter = new Counter({
            name: 'fraud_alerts_total',
            help: 'Total number of fraud alerts by type and severity',
            labelNames: ['type', 'severity'],
            registers: [this.registry],
        });

        this.eventsProcessedCounter = new Counter({
            name: 'events_processed_total',
            help: 'Total number of events processed',
            labelNames: ['event_type'],
            registers: [this.registry],
        });
    }

    incrementFraudAlerts(type: AlertType, severity: AlertSeverity): void {
        this.fraudAlertsCounter.inc({ type, severity });
    }

    incrementEventsProcessed(eventType: string): void {
        this.eventsProcessedCounter.inc({ event_type: eventType });
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
