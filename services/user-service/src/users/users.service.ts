import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { User, UserRole } from "./entities/user.entity";
import { RegisterDto, LoginDto, UpdateUserDto } from "./dto";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly metricsService: MetricsService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; token: string }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Create user (plain password for POC)
    const user = this.userRepository.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      role: registerDto.role || UserRole.BUYER,
    });

    await this.userRepository.save(user);

    // Generate JWT
    const token = this.generateToken(user);

    // Emit event
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

    // Increment metrics
    this.metricsService.incrementUsersRegistered();

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account has been banned");
    }

    const token = this.generateToken(user);

    // Increment metrics
    this.metricsService.incrementLogins();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const oldUser = { ...user };
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    // Emit event
    await this.rabbitmqService.publish("user.updated", {
      eventType: "UserUpdated",
      timestamp: new Date().toISOString(),
      data: {
        userId: user.id,
        changes: {
          name:
            updateUserDto.name !== oldUser.name
              ? { old: oldUser.name, new: user.name }
              : undefined,
          role:
            updateUserDto.role !== oldUser.role
              ? { old: oldUser.role, new: user.role }
              : undefined,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async ban(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    await this.userRepository.save(user);

    await this.rabbitmqService.publish("user.banned", {
      eventType: "UserBanned",
      timestamp: new Date().toISOString(),
      data: {
        userId: user.id,
      },
    });

    return user;
  }

  async unban(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = true;
    await this.userRepository.save(user);

    await this.rabbitmqService.publish("user.unbanned", {
      eventType: "UserUnbanned",
      timestamp: new Date().toISOString(),
      data: {
        userId: user.id,
      },
    });

    return user;
  }

  private generateToken(user: User): string {
    const secret = this.configService.get<string>(
      "JWT_SECRET",
      "COLLECTOR_SECRET_KEY",
    );
    const expiresIn = this.configService.get<string>("JWT_EXPIRATION", "24h");

    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn },
    );
  }
}
