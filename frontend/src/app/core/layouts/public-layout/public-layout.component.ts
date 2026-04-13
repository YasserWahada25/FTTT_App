import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="public-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(135deg, #0d1b3e 0%, #1a237e 40%, #1565c0 70%, #0288d1 100%);
    }
  `]
})
export class PublicLayoutComponent { }
