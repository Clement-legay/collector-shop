"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const articles_module_1 = require("./articles/articles.module");
const rabbitmq_module_1 = require("./rabbitmq/rabbitmq.module");
const metrics_module_1 = require("./metrics/metrics.module");
const article_entity_1 = require("./articles/entities/article.entity");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: "postgres",
                    host: configService.get("DATABASE_HOST", "localhost"),
                    port: configService.get("DATABASE_PORT", 5432),
                    username: configService.get("DATABASE_USER", "collector"),
                    password: configService.get("DATABASE_PASSWORD", "collector_password"),
                    database: configService.get("DATABASE_NAME", "collector"),
                    schema: configService.get("DATABASE_SCHEMA", "articles"),
                    entities: [article_entity_1.Article],
                    synchronize: true,
                    logging: ["error", "warn"],
                }),
            }),
            rabbitmq_module_1.RabbitmqModule,
            metrics_module_1.MetricsModule,
            articles_module_1.ArticlesModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map