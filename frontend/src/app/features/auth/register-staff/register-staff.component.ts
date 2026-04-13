import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { STAFF_ROLES, StaffRegisterRequest, StaffRequestedRole } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuthShellComponent } from '../components/auth-shell/auth-shell.component';
import { passwordMatchValidator } from '../validators/password-match.validator';

const STAFF_ROLE_LABELS: Record<StaffRequestedRole, string> = {
  CLUB_MANAGER: 'Club Manager',
  COACH: 'Coach',
  REFEREE: 'Referee',
};

@Component({
  selector: 'app-register-staff',
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
    MatSelectModule,
    AuthShellComponent,
  ],
  templateUrl: './register-staff.component.html',
  styleUrls: ['./register-staff.component.css'],
})
export class RegisterStaffComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly staffRoles = STAFF_ROLES.map((role) => ({
    label: STAFF_ROLE_LABELS[role],
    value: role,
  }));

  readonly form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      requestedRole: ['COACH' as StaffRequestedRole, [Validators.required]],
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
    const request = payload as StaffRegisterRequest;

    this.loading.set(true);
    this.authService
      .registerStaff(request)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            'Votre demande de compte a ete creee et reste en attente de validation par l administrateur.'
          );
          this.form.disable();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message || 'La creation de la demande staff a echoue.');
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
