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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudController = void 0;
const common_1 = require("@nestjs/common");
const fraud_service_1 = require("./fraud.service");
const fraud_alert_entity_1 = require("./entities/fraud-alert.entity");
let FraudController = class FraudController {
    constructor(fraudService) {
        this.fraudService = fraudService;
    }
    async getAlerts(type, severity) {
        if (type) {
            return this.fraudService.findByType(type);
        }
        if (severity) {
            return this.fraudService.findBySeverity(severity);
        }
        return this.fraudService.findAll();
    }
    async getStats() {
        return this.fraudService.getStats();
    }
};
exports.FraudController = FraudController;
__decorate([
    (0, common_1.Get)("alerts"),
    __param(0, (0, common_1.Query)("type")),
    __param(1, (0, common_1.Query)("severity")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FraudController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)("stats"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FraudController.prototype, "getStats", null);
exports.FraudController = FraudController = __decorate([
    (0, common_1.Controller)("fraud"),
    __metadata("design:paramtypes", [fraud_service_1.FraudService])
], FraudController);
//# sourceMappingURL=fraud.controller.js.map