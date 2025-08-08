import { Test, TestingModule } from "@nestjs/testing";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificacaoDto } from "./dto/create-notification.dto";

describe("NotificationController", () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotificationService = {
    notificar: jest.fn(),
    getStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("notificar", () => {
    it("deve chamar notificationService.notificar com o body correto e retornar o resultado", async () => {
      const dto: NotificacaoDto = {
        mensagemId: "123",
        conteudoMensagem: "Teste mensagem",
      };

      const retornoMock = {
        mensagemId: dto.mensagemId,
        status: "Aceito para processamento",
      };
      mockNotificationService.notificar.mockResolvedValue(retornoMock);

      const result = await controller.notificar(dto);

      expect(service.notificar).toHaveBeenCalledWith(dto);
      expect(result).toEqual(retornoMock);
    });
  });

  describe("getStatus", () => {
    it("deve chamar notificationService.getStatus com mensagemId e retornar o resultado", async () => {
      const mensagemId = "123";
      const retornoMock = { status: "PROCESSADO_SUCESSO" };
      mockNotificationService.getStatus.mockResolvedValue(retornoMock);

      const result = await controller.getStatus(mensagemId);

      expect(service.getStatus).toHaveBeenCalledWith(mensagemId);
      expect(result).toEqual(retornoMock);
    });
  });
});
