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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FraudService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fraud_alert_entity_1 = require("./entities/fraud-alert.entity");
const metrics_service_1 = require("../metrics/metrics.service");
let FraudService = FraudService_1 = class FraudService {
    constructor(alertRepository, metricsService) {
        this.alertRepository = alertRepository;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(FraudService_1.name);
    }
    async createAlert(alertType, severity, userId, articleId, details) {
        const alert = this.alertRepository.create({
            alertType,
            severity,
            userId,
            articleId,
            details,
        });
        await this.alertRepository.save(alert);
        this.metricsService.incrementFraudAlerts(alertType, severity);
        this.logger.warn(`🚨 FRAUD ALERT [${severity.toUpperCase()}] - ${alertType}: ${JSON.stringify(details)}`);
        return alert;
    }
    async findAll() {
        return this.alertRepository.find({
            order: { createdAt: "DESC" },
        });
    }
    async findByType(type) {
        return this.alertRepository.find({
            where: { alertType: type },
            order: { createdAt: "DESC" },
        });
    }
    async findBySeverity(severity) {
        return this.alertRepository.find({
            where: { severity },
            order: { createdAt: "DESC" },
        });
    }
    async getStats() {
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
};
exports.FraudService = FraudService;
exports.FraudService = FraudService = FraudService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fraud_alert_entity_1.FraudAlert)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        metrics_service_1.MetricsService])
], FraudService);
//# sourceMappingURL=fraud.service.js.map