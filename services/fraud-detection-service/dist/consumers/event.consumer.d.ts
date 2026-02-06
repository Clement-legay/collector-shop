import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FraudService } from "../fraud/fraud.service";
import { MetricsService } from "../metrics/metrics.service";
export declare class EventConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly fraudService;
    private readonly metricsService;
    private connection;
    private channel;
    private readonly logger;
    private readonly purchaseCache;
    private readonly priceOrangeThreshold;
    private readonly priceRedThreshold;
    private readonly purchaseOrangeThreshold;
    private readonly purchaseRedThreshold;
    private readonly purchaseWindowMs;
    constructor(configService: ConfigService, fraudService: FraudService, metricsService: MetricsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private disconnect;
    private handleMessage;
    private handlePriceChanged;
    private handlePurchaseCompleted;
}
