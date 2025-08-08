import { Component, OnDestroy, OnInit } from '@angular/core';
import { INotification } from '../../shared/interfaces/notification.interface';
import { interval, Subscription } from 'rxjs';
import { NotificacaoService } from './services/notificacao.service';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Card } from '../card/card';

@Component({
  selector: 'app-notificacao-component',
  imports: [CommonModule, ReactiveFormsModule, Card],
  templateUrl: './notificacao-component.html',
  styleUrl: './notificacao-component.scss',
})
export class NotificacaoComponent implements OnInit, OnDestroy {
  notificationForm = new FormGroup({
    conteudoMensagem: new FormControl('', Validators.required),
  });

  notifications: INotification[] = [];
  pollingSub: Subscription | undefined;

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit() {
    // DEFININDO POOLING DE 5 SEGUNDOS PARA ATUALIZAR STATUS DOS CARDS
    this.pollingSub = interval(5000).subscribe(() => {
      this.notifications.forEach((notification) => {
        if (
          notification.status === 'AGUARDANDO_PROCESSAMENTO' ||
          notification.status === 'RECEBIDO'
        ) {
          this.notificacaoService.getStatus(notification.mensagemId).subscribe({
            next: (res) => (notification.status = res.status),
            error: () => {},
          });
        } else {
          return;
        }
      });
    });
  }

  sendNotification() {
    if (!this.notificationForm.valid) {
      return;
    }

    const mensagemId = uuidv4();
    const conteudoMensagem = this.notificationForm.get('conteudoMensagem')
      ?.value as string;

    this.notificacaoService
      .sendNotification(mensagemId, conteudoMensagem)
      .subscribe({
        next: () => {
          this.notifications.push({
            mensagemId,
            conteudoMensagem,
            status: 'AGUARDANDO_PROCESSAMENTO',
          });

          this.notificationForm.reset();
        },
        error: () => {
          console.error('Erro ao enviar notificação');
        },
      });
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }
}
