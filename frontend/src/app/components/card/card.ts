import { Component, Input } from '@angular/core';
import { INotification } from '../../shared/interfaces/notification.interface';
import { Badge } from '../badge/badge';

@Component({
  selector: 'app-card',
  imports: [Badge],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {
  @Input() notification!: INotification;
}
