import { Injectable } from '@nestjs/common';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
    private readonly registry: Registry;
    private readonly usersRegisteredCounter: Counter;
    private readonly loginsCounter: Counter;

    constructor() {
        this.registry = new Registry();

        // Collect default metrics (CPU, memory, etc.)
        collectDefaultMetrics({ register: this.registry });

        // Custom counters
        this.usersRegisteredCounter = new Counter({
            name: 'users_registered_total',
            help: 'Total number of users registered',
            registers: [this.registry],
        });

        this.loginsCounter = new Counter({
            name: 'logins_total',
            help: 'Total number of user logins',
            registers: [this.registry],
        });
    }

    incrementUsersRegistered(): void {
        this.usersRegisteredCounter.inc();
    }

    incrementLogins(): void {
        this.loginsCounter.inc();
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    getContentType(): string {
        return this.registry.contentType;
    }
}
