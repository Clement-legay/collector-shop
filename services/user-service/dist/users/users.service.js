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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
const user_entity_1 = require("./entities/user.entity");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
const metrics_service_1 = require("../metrics/metrics.service");
let UsersService = class UsersService {
    constructor(userRepository, configService, rabbitmqService, metricsService) {
        this.userRepository = userRepository;
        this.configService = configService;
        this.rabbitmqService = rabbitmqService;
        this.metricsService = metricsService;
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException("Email already registered");
        }
        const user = this.userRepository.create({
            email: registerDto.email,
            password: registerDto.password,
            name: registerDto.name,
            role: registerDto.role || user_entity_1.UserRole.BUYER,
        });
        await this.userRepository.save(user);
        const token = this.generateToken(user);
        await this.rabbitmqService.publish("user.registered", {
            eventType: "UserRegistered",
            timestamp: new Date().toISOString(),
            data: {
                userId: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
        this.metricsService.incrementUsersRegistered();
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });
        if (!user || user.password !== loginDto.password) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const token = this.generateToken(user);
        this.metricsService.incrementLogins();
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async findById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async update(id, updateUserDto) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const oldUser = { ...user };
        Object.assign(user, updateUserDto);
        await this.userRepository.save(user);
        await this.rabbitmqService.publish("user.updated", {
            eventType: "UserUpdated",
            timestamp: new Date().toISOString(),
            data: {
                userId: user.id,
                changes: {
                    name: updateUserDto.name !== oldUser.name
                        ? { old: oldUser.name, new: user.name }
                        : undefined,
                    role: updateUserDto.role !== oldUser.role
                        ? { old: oldUser.role, new: user.role }
                        : undefined,
                },
            },
        });
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async findAll() {
        const users = await this.userRepository.find();
        return users.map((user) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    generateToken(user) {
        const secret = this.configService.get("JWT_SECRET", "COLLECTOR_SECRET_KEY");
        const expiresIn = this.configService.get("JWT_EXPIRATION", "24h");
        return jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, secret, { expiresIn });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        rabbitmq_service_1.RabbitmqService,
        metrics_service_1.MetricsService])
], UsersService);
//# sourceMappingURL=users.service.js.map