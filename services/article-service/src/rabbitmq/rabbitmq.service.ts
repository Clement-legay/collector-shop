import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private readonly logger = new Logger(RabbitmqService.name);
    private readonly exchange: string;

    constructor(private readonly configService: ConfigService) {
        this.exchange = this.configService.get<string>('RABBITMQ_EXCHANGE', 'collector.events');
    }

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private async connect() {
        try {
            const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            this.logger.log(`Connected to RabbitMQ, exchange: ${this.exchange}`);
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            setTimeout(() => this.connect(), 5000);
        }
    }

    private async disconnect() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            this.logger.log('Disconnected from RabbitMQ');
        } catch (error) {
            this.logger.error('Error disconnecting from RabbitMQ', error);
        }
    }

    async publish(routingKey: string, message: object): Promise<void> {
        if (!this.channel) {
            this.logger.warn('RabbitMQ channel not available');
            return;
        }

        try {
            const content = Buffer.from(JSON.stringify(message));
            this.channel.publish(this.exchange, routingKey, content, {
                persistent: true,
                contentType: 'application/json',
            });
            this.logger.debug(`Published to ${routingKey}`);
        } catch (error) {
            this.logger.error(`Failed to publish to ${routingKey}`, error);
            throw error;
        }
    }
}
