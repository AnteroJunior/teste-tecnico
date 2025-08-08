import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { RabbitmqService } from "src/services/rabbitmq/rabbitmq.service";
import { StatusService } from "src/services/status/status.service";

@Module({
  providers: [NotificationService, RabbitmqService, StatusService],
  controllers: [NotificationController],
  exports: [RabbitmqService, StatusService],
})
export class NotificationModule {}
