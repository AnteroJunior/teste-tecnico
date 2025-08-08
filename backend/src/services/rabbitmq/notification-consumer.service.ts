import { Injectable, OnModuleInit } from "@nestjs/common";
import { StatusService } from "../status/status.service";
import { RabbitmqService } from "./rabbitmq.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotificacaoConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitService: RabbitmqService,
    private readonly statusService: StatusService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    const queueIn =
      this.configService.get<string>("QUEUE_NOTIFICATION_IN") ??
      "fila.notificacao.entrada.ANTERO";
    const queueStatus =
      this.configService.get<string>("QUEUE_NOTIFICATION_STATUS") ??
      "fila.notificacao.status.ANTERO";

    await this.rabbitService.consume(queueIn, async (msg) => {
      await new Promise((res) => setTimeout(res, 1000 + Math.random() * 1000));

      const isFail = Math.floor(Math.random() * 10) + 1 <= 2;
      const status = isFail ? "FALHA_PROCESSAMENTO" : "PROCESSADO_SUCESSO";

      this.statusService.setStatus(msg.mensagemId, status);

      await this.rabbitService.sendToQueue(queueStatus, {
        mensagemId: msg.mensagemId,
        status,
      });
    });
  }
}
