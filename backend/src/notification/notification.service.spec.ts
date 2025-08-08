import { Test, TestingModule } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { RabbitmqService } from "../services/rabbitmq/rabbitmq.service";
import { StatusService } from "../services/status/status.service";
import { NotificacaoDto } from "./dto/create-notification.dto";
import { ConfigService } from "@nestjs/config";

describe("NotificationService", () => {
  let service: NotificationService;
  let rabbitService: RabbitmqService;
  let statusService: StatusService;
  let configService: ConfigService;

  const mockRabbitmqService = {
    sendToQueue: jest.fn(),
  };

  const mockStatusService = {
    setStatus: jest.fn(),
    getStatus: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation(() => undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: RabbitmqService, useValue: mockRabbitmqService },
        { provide: StatusService, useValue: mockStatusService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    rabbitService = module.get<RabbitmqService>(RabbitmqService);
    statusService = module.get<StatusService>(StatusService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks(); //EVITAR COFLITOS ENTRE TESTES
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("notificar", () => {
    it("deve validar, salvar status e enviar para fila e retornar resposta", async () => {
      const dto: NotificacaoDto = {
        mensagemId: "b329d848-c456-45c5-957e-d0b49f0b9b76",
        conteudoMensagem: "Mensagem teste",
      };

      mockRabbitmqService.sendToQueue.mockResolvedValue(undefined);
      mockStatusService.setStatus.mockImplementation(() => {});

      const result = await service.notificar(dto);

      expect(result).toEqual({
        mensagemId: dto.mensagemId,
        status: "Aceito para processamento",
      });

      expect(statusService.setStatus).toHaveBeenCalledWith(
        dto.mensagemId,
        "RECEBIDO"
      );

      expect(rabbitService.sendToQueue).toHaveBeenCalledWith(
        "fila.notificacao.entrada.ANTERO",
        dto
      );
    });

    it("deve usar fila do ConfigService quando configurada", async () => {
      const dto: NotificacaoDto = {
        mensagemId: "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
        conteudoMensagem: "Msg",
      };

      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === "QUEUE_NOTIFICATION_IN") return "fila.custom.in";
        return undefined;
      });

      await service.notificar(dto);

      expect(rabbitService.sendToQueue).toHaveBeenCalledWith(
        "fila.custom.in",
        dto
      );
    });
  });

  describe("getStatus", () => {
    it("deve retornar status existente", async () => {
      const mensagemId = "uuid-1234";
      const status = "PROCESSADO_SUCESSO";
      mockStatusService.getStatus.mockReturnValue(status);

      const result = await service.getStatus(mensagemId);

      expect(result).toEqual({ status });
      expect(statusService.getStatus).toHaveBeenCalledWith(mensagemId);
    });
  });
});
