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
var RabbitmqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitmqService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
let RabbitmqService = RabbitmqService_1 = class RabbitmqService {
    constructor(configService) {
        this.configService = configService;
        this.connection = null;
        this.channel = null;
        this.logger = new common_1.Logger(RabbitmqService_1.name);
        this.exchange = this.configService.get("RABBITMQ_EXCHANGE", "collector.events");
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            const host = this.configService.get("RABBITMQ_HOST", "localhost");
            const port = this.configService.get("RABBITMQ_AMQP_PORT", 5672);
            const user = this.configService.get("RABBITMQ_USER", "guest");
            const pass = this.configService.get("RABBITMQ_PASS", "guest");
            const url = this.configService.get("RABBITMQ_URL", `amqp://${user}:${pass}@${host}:${port}`);
            this.connection = (await amqp.connect(url));
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.exchange, "topic", {
                durable: true,
            });
            this.logger.log(`Connected to RabbitMQ, exchange: ${this.exchange}`);
        }
        catch (error) {
            this.logger.error("Failed to connect to RabbitMQ", error);
            setTimeout(() => this.connect(), 5000);
        }
    }
    async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.log("Disconnected from RabbitMQ");
        }
        catch (error) {
            this.logger.error("Error disconnecting from RabbitMQ", error);
        }
    }
    async publish(routingKey, message) {
        if (!this.channel) {
            this.logger.warn("RabbitMQ channel not available, message not published");
            return;
        }
        try {
            const content = Buffer.from(JSON.stringify(message));
            this.channel.publish(this.exchange, routingKey, content, {
                persistent: true,
                contentType: "application/json",
            });
            this.logger.debug(`Published message to ${routingKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish message to ${routingKey}`, error);
            throw error;
        }
    }
};
exports.RabbitmqService = RabbitmqService;
exports.RabbitmqService = RabbitmqService = RabbitmqService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RabbitmqService);
//# sourceMappingURL=rabbitmq.service.js.map