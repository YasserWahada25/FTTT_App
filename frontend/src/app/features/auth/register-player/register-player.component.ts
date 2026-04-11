import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PlayerRegisterRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuthShellComponent } from '../components/auth-shell/auth-shell.component';
import { passwordMatchValidator } from '../validators/password-match.validator';

@Component({
  selector: 'app-register-player',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AuthShellComponent,
  ],
  templateUrl: './register-player.component.html',
  styleUrls: ['./register-player.component.css'],
})
export class RegisterPlayerComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator() }
  );

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const { confirmPassword: _confirmPassword, ...payload } = this.form.getRawValue();
    const request = payload as PlayerRegisterRequest;

    this.loading.set(true);
    this.authService
      .registerPlayer(request)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => {
          this.successMessage.set(message);
          this.form.disable();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message || 'L inscription player a echoue.');
        },
      });
  }

  hasError(controlName: keyof typeof this.form.controls, errorCode?: string): boolean {
    const control = this.form.controls[controlName];
    const shouldDisplay = this.submitted() || control.touched;
    return shouldDisplay && (errorCode ? control.hasError(errorCode) : control.invalid);
  }

  hasPasswordMismatch(): boolean {
    return (this.submitted() || this.form.controls.confirmPassword.touched) && this.form.hasError('passwordMismatch');
  }
}
