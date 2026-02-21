import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventConsumer } from "./event.consumer";
import { FraudModule } from "../fraud/fraud.module";
import { MetricsModule } from "../metrics/metrics.module";
import { PurchaseEvent } from "../fraud/entities/purchase-event.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseEvent]),
    FraudModule,
    MetricsModule,
  ],
  providers: [EventConsumer],
})
export class ConsumersModule {}
