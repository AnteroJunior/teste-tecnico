import { Test, TestingModule } from "@nestjs/testing";
import { StatusService } from "./status.service";

describe("StatusService", () => {
  let service: StatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusService],
    }).compile();

    service = module.get<StatusService>(StatusService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should set status", () => {
    service.setStatus("mensagemId", "status");
    expect(service.getStatus("mensagemId")).toBe("status");
  });

  it("should return undefined when status does not exist", () => {
    expect(service.getStatus("inexistente")).toBeUndefined();
  });

  it("should update existing status", () => {
    service.setStatus("id-1", "RECEBIDO");
    service.setStatus("id-1", "PROCESSADO_SUCESSO");
    expect(service.getStatus("id-1")).toBe("PROCESSADO_SUCESSO");
  });

  it("should keep statuses isolated across different ids", () => {
    service.setStatus("id-a", "RECEBIDO");
    service.setStatus("id-b", "FALHA_PROCESSAMENTO");

    expect(service.getStatus("id-a")).toBe("RECEBIDO");
    expect(service.getStatus("id-b")).toBe("FALHA_PROCESSAMENTO");
  });
});
