import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICreateNotification } from '../../../shared/interfaces/create-notification.interface';
import { INotificationStatus } from '../../../shared/interfaces/notification-status.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendNotification(mensagemId: string, conteudoMensagem: string): Observable<ICreateNotification> {
    return this.http.post<ICreateNotification>(`${this.baseUrl}/notificar`, { mensagemId, conteudoMensagem });
  }

  getStatus(mensagemId: string): Observable<INotificationStatus> {
    return this.http.get<INotificationStatus>(`${this.baseUrl}/notificar/status/${mensagemId}`);
  }
}
