"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MetricsService = class MetricsService {
    constructor() {
        this.registry = new prom_client_1.Registry();
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
        this.fraudAlertsCounter = new prom_client_1.Counter({
            name: "fraud_alerts_total",
            help: "Total number of fraud alerts by type and severity",
            labelNames: ["type", "severity"],
            registers: [this.registry],
        });
        this.eventsProcessedCounter = new prom_client_1.Counter({
            name: "events_processed_total",
            help: "Total number of events processed",
            labelNames: ["event_type"],
            registers: [this.registry],
        });
    }
    incrementFraudAlerts(type, severity) {
        this.fraudAlertsCounter.inc({ type, severity });
    }
    incrementEventsProcessed(eventType) {
        this.eventsProcessedCounter.inc({ event_type: eventType });
    }
    async getMetrics() {
        return this.registry.metrics();
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map