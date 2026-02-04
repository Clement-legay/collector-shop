import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Article]),
        RabbitmqModule,
        MetricsModule,
    ],
    controllers: [ArticlesController],
    providers: [ArticlesService],
    exports: [ArticlesService],
})
export class ArticlesModule { }
