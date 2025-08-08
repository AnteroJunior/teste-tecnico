import { Injectable, OnModuleInit } from "@nestjs/common";
import { RabbitmqService } from "./rabbitmq.service";
import { StatusService } from "../status/status.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StatusConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitService: RabbitmqService,
    private readonly statusService: StatusService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    const queueStatus =
      this.configService.get<string>("QUEUE_NOTIFICATION_STATUS") ??
      "fila.notificacao.status.ANTERO";

    await this.rabbitService.consume(
      queueStatus,
      async (msg: { mensagemId: string; status: string }) => {
        if (msg?.mensagemId && msg?.status) {
          this.statusService.setStatus(msg.mensagemId, msg.status);
        }
      }
    );
  }
}
