import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        RabbitmqModule,
        MetricsModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
