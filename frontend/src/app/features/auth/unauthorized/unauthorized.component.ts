import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatIconModule],
    template: `
    <div class="unauthorized-page">
      <div class="error-card">
        <div class="error-icon">
          <mat-icon>lock</mat-icon>
        </div>
        <h1>Accès Refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <p class="sub">Contactez votre administrateur si vous pensez que c'est une erreur.</p>
        <div class="actions">
          <button mat-flat-button color="primary" routerLink="/app/dashboard">
            <mat-icon>home</mat-icon> Tableau de Bord
          </button>
          <button mat-stroked-button routerLink="/auth/login">
            <mat-icon>login</mat-icon> Se Reconnecter
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .unauthorized-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f2f8;
      padding: 24px;
    }
    .error-card {
      background: white;
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      max-width: 480px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    .error-icon {
      width: 96px; height: 96px;
      border-radius: 50%;
      background: #fce4ec;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
    }
    .error-icon mat-icon {
      font-size: 48px !important; width: 48px !important; height: 48px !important;
      color: #f44336;
    }
    h1 { font-size: 2rem; font-weight: 800; color: #1a1a2e; margin: 0 0 12px; }
    p { color: #555; line-height: 1.6; margin: 0 0 8px; }
    .sub { font-size: 0.85rem; color: #9e9e9e; }
    .actions { display: flex; gap: 12px; justify-content: center; margin-top: 28px; flex-wrap: wrap; }
    .actions button { border-radius: 10px !important; height: 44px; }
  `]
})
export class UnauthorizedComponent { }
