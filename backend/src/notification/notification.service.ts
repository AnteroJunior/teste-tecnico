import { Injectable } from "@nestjs/common";
import { RabbitmqService } from "../services/rabbitmq/rabbitmq.service";
import { StatusService } from "../services/status/status.service";
import { NotificacaoDto } from "./dto/create-notification.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotificationService {
  constructor(
    private readonly rabbitService: RabbitmqService,
    private readonly statusService: StatusService,
    private readonly configService: ConfigService
  ) {}

  async notificar(body: NotificacaoDto) {
    this.statusService.setStatus(body.mensagemId, "RECEBIDO");

    const queueIn =
      this.configService.get<string>("QUEUE_NOTIFICATION_IN") ??
      "fila.notificacao.entrada.ANTERO";

    await this.rabbitService.sendToQueue(queueIn, body);

    return {
      mensagemId: body.mensagemId,
      status: "Aceito para processamento",
    };
  }

  async getStatus(mensagemId: string) {
    const status = this.statusService.getStatus(mensagemId);
    return { status };
  }
}
