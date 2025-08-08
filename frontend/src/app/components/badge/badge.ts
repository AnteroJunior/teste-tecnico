import { Component, Input } from '@angular/core';
import { INotification } from '../../shared/interfaces/notification.interface';

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  @Input() notification!: INotification;

  getBadgeClass(status: string): string {
    switch (status) {
      case 'PROCESSADO_SUCESSO':
        return 'status-badge status-badge-success';
      case 'AGUARDANDO_PROCESSAMENTO':
      case 'RECEBIDO':
        return 'status-badge status-badge-waiting';
      case 'FALHA_PROCESSAMENTO':
        return 'status-badge status-badge-failure';
      default:
        return 'status-badge';
    }
  }
}
