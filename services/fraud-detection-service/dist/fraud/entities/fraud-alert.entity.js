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
exports.FraudAlert = exports.AlertSeverity = exports.AlertType = void 0;
const typeorm_1 = require("typeorm");
var AlertType;
(function (AlertType) {
    AlertType["PRICE_VARIATION"] = "price_variation";
    AlertType["SUSPICIOUS_PURCHASES"] = "suspicious_purchases";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["GREEN"] = "green";
    AlertSeverity["ORANGE"] = "orange";
    AlertSeverity["RED"] = "red";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
let FraudAlert = class FraudAlert {
};
exports.FraudAlert = FraudAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], FraudAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "alert_type",
        type: "enum",
        enum: AlertType,
    }),
    __metadata("design:type", String)
], FraudAlert.prototype, "alertType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AlertSeverity,
    }),
    __metadata("design:type", String)
], FraudAlert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "user_id", type: "uuid", nullable: true }),
    __metadata("design:type", String)
], FraudAlert.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "article_id", type: "uuid", nullable: true }),
    __metadata("design:type", String)
], FraudAlert.prototype, "articleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], FraudAlert.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], FraudAlert.prototype, "createdAt", void 0);
exports.FraudAlert = FraudAlert = __decorate([
    (0, typeorm_1.Entity)("fraud_alerts")
], FraudAlert);
//# sourceMappingURL=fraud-alert.entity.js.map