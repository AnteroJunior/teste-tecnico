import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Connection, Channel, connect } from "amqplib";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private isConnected = false;
  private initializing: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async init() {
    if (this.isConnected) return;
    if (!this.initializing) {
      this.initializing = (async () => {
        const url =
          this.configService.get<string>("RABBITMQ_URL") ?? "amqp://localhost";
        this.connection = await connect(url);
        this.channel = await this.connection.createChannel();
        const prefetch = Number(
          this.configService.get<string>("RMQ_PREFETCH") ?? 1
        );
        await this.channel.prefetch(prefetch);
        this.isConnected = true;
      })();
    }
    await this.initializing;
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
    this.initializing = null;
  }

  async assertQueue(queue: string) {
    await this.init();
    await this.channel.assertQueue(queue, { durable: true });
  }

  async sendToQueue(queue: string, message: any) {
    await this.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  async consume(
    queue: string,
    callback: (notification: any) => Promise<void> | void
  ) {
    await this.assertQueue(queue);
    this.channel.consume(queue, async (notification) => {
      if (!notification) return;
      const content = JSON.parse(notification.content.toString());
      try {
        await callback(content);
        this.channel.ack(notification);
      } catch (error) {
        const requeue =
          (this.configService.get<string>("REQUEUE_ON_ERROR") ?? "false") ===
          "true";
        this.channel.nack(notification, false, requeue);
      }
    });
  }
}
