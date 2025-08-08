import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificacaoService } from './notificacao.service';
import { environment } from '../../../../environments/environment';
import { ICreateNotification } from '../../../shared/interfaces/create-notification.interface';
import { INotificationStatus } from '../../../shared/interfaces/notification-status.interface';
import { HttpClientModule } from '@angular/common/http';

describe('NotificacaoService', () => {
  let service: NotificacaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, HttpClientModule],
    });
    service = TestBed.inject(NotificacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve enviar POST /notificar com o corpo correto', () => {
    const mensagemId = '11111111-1111-1111-1111-111111111111';
    const conteudoMensagem = 'conteudo';

    let responseBody: ICreateNotification | undefined;
    service
      .sendNotification(mensagemId, conteudoMensagem)
      .subscribe((res) => (responseBody = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/notificar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mensagemId, conteudoMensagem });

    const mockResponse: ICreateNotification = {
      mensagemId,
      status: 'Aceito para processamento',
    };
    req.flush(mockResponse);

    expect(responseBody).toEqual(mockResponse);
  });

  it('deve fazer GET /notificar/status/:mensagemId e retornar status', () => {
    const mensagemId = '22222222-2222-2222-2222-222222222222';

    let responseBody: INotificationStatus | undefined;
    service.getStatus(mensagemId).subscribe((res) => (responseBody = res));

    const req = httpMock.expectOne(
      `${environment.apiUrl}/notificar/status/${mensagemId}`
    );
    expect(req.request.method).toBe('GET');

    const mockResponse: INotificationStatus = { status: 'RECEBIDO' };
    req.flush(mockResponse);

    expect(responseBody).toEqual(mockResponse);
  });
});
