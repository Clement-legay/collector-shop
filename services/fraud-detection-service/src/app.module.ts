import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudModule } from './fraud/fraud.module';
import { ConsumersModule } from './consumers/consumers.module';
import { MetricsModule } from './metrics/metrics.module';
import { FraudAlert } from './fraud/entities/fraud-alert.entity';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DATABASE_HOST', 'localhost'),
                port: configService.get('DATABASE_PORT', 5432),
                username: configService.get('DATABASE_USER', 'collector'),
                password: configService.get('DATABASE_PASSWORD', 'collector_password'),
                database: configService.get('DATABASE_NAME', 'collector'),
                schema: configService.get('DATABASE_SCHEMA', 'fraud'),
                entities: [FraudAlert],
                synchronize: true,
                logging: ['error', 'warn'],
            }),
        }),
        MetricsModule,
        FraudModule,
        ConsumersModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }
