import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity";
import { RegisterDto, LoginDto, UpdateUserDto } from "./dto";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { MetricsService } from "../metrics/metrics.service";
export declare class UsersService {
    private readonly userRepository;
    private readonly configService;
    private readonly rabbitmqService;
    private readonly metricsService;
    constructor(userRepository: Repository<User>, configService: ConfigService, rabbitmqService: RabbitmqService, metricsService: MetricsService);
    register(registerDto: RegisterDto): Promise<{
        user: User;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: User;
        token: string;
    }>;
    findById(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    private generateToken;
}
