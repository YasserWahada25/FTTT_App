import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthShellComponent } from '../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AuthShellComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);
  readonly checkingSession = signal(true);
  readonly submitting = signal(false);
  readonly hidePassword = signal(true);
  readonly submitted = signal(false);

  private returnUrl: string | null = null;

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');
    this.prepareMessages();

    this.authService
      .getValidAccessToken()
      .pipe(take(1))
      .subscribe((token) => {
        this.checkingSession.set(false);
        if (token) {
          void this.authService.navigateAfterLogin(this.returnUrl);
        }
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  hasError(controlName: 'username' | 'password', errorCode: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(errorCode) && (control.touched || this.submitted());
  }

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.submitting.set(true);
    this.form.disable({ emitEvent: false });
    this.authService
      .loginWithPassword(username, password, this.returnUrl)
      .pipe(
        finalize(() => {
          this.submitting.set(false);
          this.form.enable({ emitEvent: false });
        })
      )
      .subscribe({
        next: (targetUrl) => {
          void this.router.navigateByUrl(targetUrl, { replaceUrl: true });
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message || 'La connexion a echoue.');
        },
      });
  }

  private prepareMessages(): void {
    const registered = this.activatedRoute.snapshot.queryParamMap.get('registered');

    if (registered === 'player') {
      this.infoMessage.set('Compte joueur cree. Vous pouvez vous connecter.');
      return;
    }

    if (registered === 'staff') {
      this.infoMessage.set('Demande staff enregistree. En attente de validation.');
      return;
    }

    if (this.activatedRoute.snapshot.queryParamMap.has('loggedOut')) {
      this.infoMessage.set('Vous etes deconnecte.');
      return;
    }

    if (this.activatedRoute.snapshot.queryParamMap.has('sessionExpired')) {
      this.infoMessage.set('Session expiree. Reconnectez-vous.');
    }
  }
}
