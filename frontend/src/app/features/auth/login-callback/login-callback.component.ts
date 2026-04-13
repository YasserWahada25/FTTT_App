import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-page">
      <div class="callback-card">
        @if (loading()) {
          <div class="callback-loading">
            <mat-spinner diameter="48"></mat-spinner>
            <h2>Connexion en cours</h2>
            <p>Nous verifions votre session et preparons votre espace.</p>
          </div>
        } @else {
          <div class="callback-error">
            <div class="callback-error__icon">
              <mat-icon>error</mat-icon>
            </div>
            <h2>Echec de connexion</h2>
            <p>{{ errorMessage() }}</p>
            <div class="callback-actions">
              <a mat-flat-button color="primary" routerLink="/auth/login">
                <mat-icon>arrow_back</mat-icon>
                Retour a la connexion
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .callback-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background:
          radial-gradient(circle at top center, rgba(15, 78, 167, 0.08), transparent 26%),
          linear-gradient(180deg, #f6f8fc 0%, #eef2f8 100%);
      }

      .callback-card {
        width: 100%;
        max-width: 480px;
        padding: 36px;
        border-radius: 24px;
        background: white;
        box-shadow: 0 20px 48px rgba(10, 26, 59, 0.12);
      }

      .callback-loading,
      .callback-error {
        text-align: center;
      }

      .callback-loading h2,
      .callback-error h2 {
        margin: 18px 0 10px;
        color: #13213d;
        font-size: 1.6rem;
        font-weight: 800;
      }

      .callback-loading p,
      .callback-error p {
        margin: 0;
        color: #5f6d85;
        line-height: 1.7;
      }

      .callback-error__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        border-radius: 22px;
        background: #fdecec;
      }

      .callback-error__icon mat-icon {
        width: 36px !important;
        height: 36px !important;
        font-size: 36px !important;
        color: #d93025;
      }

      .callback-actions {
        margin-top: 24px;
      }

      .callback-actions a {
        height: 46px;
        border-radius: 12px !important;
        font-weight: 700;
      }
    `,
  ],
})
export class LoginCallbackComponent implements OnInit {
  readonly errorMessage = signal('Une erreur est survenue pendant la creation de session.');
  readonly loading = signal(true);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);

    this.authService
      .handleAuthCallback(params)
      .pipe(take(1))
      .subscribe({
        next: (targetUrl) => {
          this.navigateToTarget(targetUrl);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message || 'La connexion a echoue.');
          this.loading.set(false);
        },
      });
  }

  private navigateToTarget(targetUrl: string): void {
    if (window.top && window.top !== window.self) {
      window.top.location.assign(new URL(targetUrl, window.location.origin).toString());
      return;
    }

    void this.router.navigateByUrl(targetUrl, { replaceUrl: true });
  }
}
