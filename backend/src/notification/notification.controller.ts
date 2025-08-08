import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { NotificacaoDto } from "./dto/create-notification.dto";
import { NotificationService } from "./notification.service";

@Controller("notificar")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async notificar(@Body() body: NotificacaoDto) {
    return this.notificationService.notificar(body);
  }

  @Get("status/:mensagemId")
  async getStatus(@Param("mensagemId") mensagemId: string) {
    return this.notificationService.getStatus(mensagemId);
  }
}
