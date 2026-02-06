import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { Transaction } from "./entities/transaction.entity";
import { ArticleClient } from "../clients/article.client";
import { RabbitmqModule } from "../rabbitmq/rabbitmq.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    HttpModule,
    RabbitmqModule,
    MetricsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ArticleClient],
  exports: [PaymentsService],
})
export class PaymentsModule {}
