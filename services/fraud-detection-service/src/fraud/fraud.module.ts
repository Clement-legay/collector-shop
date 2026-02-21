import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FraudController } from "./fraud.controller";
import { FraudService } from "./fraud.service";
import { FraudAlert } from "./entities/fraud-alert.entity";
import { FraudProfile } from "./entities/fraud-profile.entity";
import { PurchaseEvent } from "./entities/purchase-event.entity";
import { MetricsModule } from "../metrics/metrics.module";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([FraudAlert, FraudProfile, PurchaseEvent]),
    MetricsModule,
  ],
  controllers: [FraudController],
  providers: [FraudService],
  exports: [FraudService],
})
export class FraudModule {}
