import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
    template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-icon">
          <mat-icon>lock_reset</mat-icon>
        </div>
        <h2>Mot de passe oublié ?</h2>
        <p>Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
        <form [formGroup]="form" class="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Adresse email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="votre@email.tn" />
          </mat-form-field>
          <button mat-flat-button color="primary" class="btn" type="submit">
            <mat-icon>send</mat-icon> Envoyer le lien
          </button>
        </form>
        <a routerLink="/auth/login" class="back-link">
          <mat-icon>arrow_back</mat-icon> Retour à la connexion
        </a>
      </div>
    </div>
  `,
    styles: [`
    .auth-page { width: 100%; display: flex; justify-content: center; align-items: center; padding: 24px; }
    .auth-card { background: white; border-radius: 24px; padding: 40px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .auth-icon { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #1a237e, #1565c0); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    .auth-icon mat-icon { font-size: 36px !important; width: 36px !important; height: 36px !important; color: white; }
    h2 { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
    p { color: #666; font-size: 0.9rem; margin: 0 0 24px; line-height: 1.6; }
    .form { display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .full-width { width: 100%; }
    .btn { height: 48px !important; border-radius: 10px !important; font-weight: 700 !important; gap: 8px; }
    .back-link { display: inline-flex; align-items: center; gap: 4px; margin-top: 20px; color: #1565c0; font-size: 0.875rem; text-decoration: none; }
    .back-link:hover { text-decoration: underline; }
    .back-link mat-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; }
  `]
})
export class ForgotPasswordComponent {
    form: FormGroup;
    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
    }
}
