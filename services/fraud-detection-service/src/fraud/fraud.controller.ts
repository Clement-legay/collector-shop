import { Controller, Get, Query } from '@nestjs/common';
import { FraudService } from './fraud.service';
import { AlertType, AlertSeverity } from './entities/fraud-alert.entity';

@Controller('fraud')
export class FraudController {
    constructor(private readonly fraudService: FraudService) { }

    @Get('alerts')
    async getAlerts(
        @Query('type') type?: AlertType,
        @Query('severity') severity?: AlertSeverity,
    ) {
        if (type) {
            return this.fraudService.findByType(type);
        }
        if (severity) {
            return this.fraudService.findBySeverity(severity);
        }
        return this.fraudService.findAll();
    }

    @Get('stats')
    async getStats() {
        return this.fraudService.getStats();
    }
}
