import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from './articles/articles.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { MetricsModule } from './metrics/metrics.module';
import { Article } from './articles/entities/article.entity';

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
                schema: configService.get('DATABASE_SCHEMA', 'articles'),
                entities: [Article],
                synchronize: true,
                logging: ['error', 'warn'],
            }),
        }),
        RabbitmqModule,
        MetricsModule,
        ArticlesModule,
    ],
})
export class AppModule { }
