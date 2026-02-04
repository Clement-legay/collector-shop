import { Module } from '@nestjs/common';
import { EventConsumer } from './event.consumer';
import { FraudModule } from '../fraud/fraud.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
    imports: [FraudModule, MetricsModule],
    providers: [EventConsumer],
})
export class ConsumersModule { }
