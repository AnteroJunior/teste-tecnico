import { RabbitmqService } from "./rabbitmq.service";
import * as amqplib from "amqplib";

jest.mock("amqplib");

describe("RabbitmqService", () => {
  let service: RabbitmqService;
  let mockChannel: any;
  let mockConnection: any;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(true),
      prefetch: jest.fn().mockResolvedValue(true),
      sendToQueue: jest.fn().mockReturnValue(true),
      consume: jest.fn().mockImplementation((_, cb) => {
        cb({ content: Buffer.from(JSON.stringify({ test: "data" })) });
      }),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn().mockResolvedValue(true),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(true),
    };

    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

    mockConfigService = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          RABBITMQ_URL: "amqp://localhost",
          RMQ_PREFETCH: "1",
          REQUEUE_ON_ERROR: "false",
        };
        return map[key];
      }),
    } as any;

    service = new RabbitmqService(mockConfigService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve enviar mensagem para a fila com os argumentos corretos", async () => {
    const queue = "fila.teste";
    const message = { foo: "bar" };

    await service.sendToQueue(queue, message);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith(queue, {
      durable: true,
    });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      queue,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  });

  it("deve consumir mensagens da fila e chamar o callback e dar ack", async () => {
    const queue = "fila.teste";
    const callback = jest.fn();

    await service.consume(queue, callback);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith(queue, {
      durable: true,
    });
    expect(mockChannel.consume).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ test: "data" });
    expect(mockChannel.ack).toHaveBeenCalledTimes(1);
  });

  it("deve dar nack com requeue=false quando o callback falhar", async () => {
    mockConfigService.get = jest.fn((key: string) => {
      const map: Record<string, string> = {
        RABBITMQ_URL: "amqp://localhost",
        RMQ_PREFETCH: "1",
        REQUEUE_ON_ERROR: "false",
      };
      return map[key];
    }) as any;

    service = new RabbitmqService(mockConfigService as any);

    const queue = "fila.teste";
    const failing = jest.fn(() => {
      throw new Error("boom");
    });

    await service.consume(queue, failing);

    expect(mockChannel.nack).toHaveBeenCalledWith(
      expect.anything(),
      false,
      false
    );
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });

  it("deve dar nack com requeue=true quando configurado", async () => {
    mockConfigService.get = jest.fn((key: string) => {
      const map: Record<string, string> = {
        RABBITMQ_URL: "amqp://localhost",
        RMQ_PREFETCH: "1",
        REQUEUE_ON_ERROR: "true",
      };
      return map[key];
    }) as any;

    service = new RabbitmqService(mockConfigService as any);

    const queue = "fila.teste";
    const failing = jest.fn(() => {
      throw new Error("boom");
    });

    await service.consume(queue, failing);

    expect(mockChannel.nack).toHaveBeenCalledWith(
      expect.anything(),
      false,
      true
    );
  });

  it("deve fechar conexão e channel no onModuleDestroy", async () => {
    await service.sendToQueue("fila.teste", { foo: "bar" }); // inicializa
    await service.onModuleDestroy();

    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
