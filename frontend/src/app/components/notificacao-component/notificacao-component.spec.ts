import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NotificacaoComponent } from './notificacao-component';
import { NotificacaoService } from './services/notificacao.service';
import { of } from 'rxjs';

describe('NotificacaoComponent', () => {
  let component: NotificacaoComponent;
  let fixture: ComponentFixture<NotificacaoComponent>;
  let service: NotificacaoService;

  const mockService: any = {
    sendNotification: jest.fn(),
    getStatus: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacaoComponent],
      providers: [{ provide: NotificacaoService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacaoComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NotificacaoService);
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve gerar mensagemId, enviar POST e adicionar notificação com status AGUARDANDO_PROCESSAMENTO', () => {
    mockService.sendNotification.mockReturnValue(
      of({
        mensagemId: 'ignored',
        status: 'Aceito para processamento',
      })
    );
    component.notificationForm.setValue({ conteudoMensagem: 'msg' });
    component.sendNotification();

    const usedId = (mockService.sendNotification as jest.Mock).mock.calls[0][0];
    expect(typeof usedId).toBe('string');
    expect(usedId.length).toBeGreaterThan(0);
    expect(service.sendNotification).toHaveBeenCalledWith(usedId, 'msg');
    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0]).toEqual({
      mensagemId: usedId,
      conteudoMensagem: 'msg',
      status: 'AGUARDANDO_PROCESSAMENTO',
    });
  });

  it('deve atualizar status durante o polling quando retornar RECEBIDO/PROCESSADO', fakeAsync(() => {
    component.notifications = [
      {
        mensagemId: 'id-1',
        conteudoMensagem: 'a',
        status: 'AGUARDANDO_PROCESSAMENTO',
      },
      {
        mensagemId: 'id-2',
        conteudoMensagem: 'b',
        status: 'PROCESSADO_SUCESSO',
      },
    ];

    mockService.getStatus
      .mockReturnValueOnce(of({ status: 'RECEBIDO' }))
      .mockReturnValueOnce(of({ status: 'PROCESSADO_SUCESSO' }));

      component.ngOnInit();

    tick(5000);

    expect(service.getStatus).toHaveBeenCalledWith('id-1');
    expect(component.notifications[0].status).toBe('RECEBIDO');

    tick(5000);
    expect(component.notifications[0].status).toBe('PROCESSADO_SUCESSO');

    component.ngOnDestroy();
  }));
});
