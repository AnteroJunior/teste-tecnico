import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacaoComponent } from './components/notificacao-component/notificacao-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificacaoComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'frontend';
}
