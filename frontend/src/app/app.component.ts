import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header>
      <h1>Sistema de Reservas</h1>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    header { background: #333; color: white; padding: 1rem; text-align: center; }
    main { padding: 1rem; }
  `]
})
export class AppComponent {}
