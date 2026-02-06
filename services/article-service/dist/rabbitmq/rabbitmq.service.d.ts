import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
export declare class RabbitmqService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private connection;
    private channel;
    private readonly logger;
    private readonly exchange;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private disconnect;
    publish(routingKey: string, message: object): Promise<void>;
}
