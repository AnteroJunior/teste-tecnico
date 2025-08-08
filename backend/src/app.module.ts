import { Module } from "@nestjs/common";
import { NotificationModule } from "./notification/notification.module";
import { NotificacaoConsumer } from "./services/rabbitmq/notification-consumer.service";
import { StatusConsumer } from "./services/rabbitmq/status-consumer.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NotificationModule],
  controllers: [],
  providers: [NotificacaoConsumer, StatusConsumer],
})
export class AppModule {}
