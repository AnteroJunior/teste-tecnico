import { Injectable } from "@nestjs/common";

@Injectable()
export class StatusService {
  private statusMap = new Map<string, string>();

  setStatus(mensagemId: string, status: string) {
    this.statusMap.set(mensagemId, status);
  }

  getStatus(mensagemId: string) {
    return this.statusMap.get(mensagemId);
  }
}
