import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { passwordMatchValidator } from '../../auth/validators/password-match.validator';
import { AdminCreateUserRequest } from '../models/admin-user.model';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Nouveau compte actif"
      subtitle="Creez directement un compte utilisateur actif depuis l espace administration."
      icon="person_add"
      [breadcrumbs]="[
        { label: 'Tableau de Bord', route: '/app/dashboard' },
        { label: 'Utilisateurs', route: '/app/users' },
        { label: 'Nouveau compte actif' }
      ]"
    ></app-page-header>

    <div class="create-user-grid">
      <mat-card class="info-card">
        <span class="eyebrow">Administration federation</span>
        <h2>Creation immediate</h2>
        <p>
          Le compte cree depuis cet ecran est active immediatement. Utilisez plutot les demandes
          staff en attente pour les inscriptions soumises par les clubs et les entraineurs.
        </p>

        <div class="info-points">
          <div class="info-point">
            <mat-icon>verified_user</mat-icon>
            <span>Activation directe apres creation</span>
          </div>
          <div class="info-point">
            <mat-icon>badge</mat-icon>
            <span>Roles disponibles : Joueur, Responsable Club, Entraineur, Arbitre</span>
          </div>
          <div class="info-point">
            <mat-icon>vpn_key</mat-icon>
            <span>Un mot de passe initial est defini par l administrateur</span>
          </div>
        </div>
      </mat-card>

      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-head">
            <div>
              <span class="eyebrow">Compte plateforme</span>
              <h2>Informations du compte</h2>
              <p>Renseignez les informations obligatoires puis choisissez le role du compte.</p>
            </div>
          </div>

          @if (submitError()) {
            <div class="feedback feedback--error">
              <mat-icon>error</mat-icon>
              <span>{{ submitError() }}</span>
            </div>
          }

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nom d utilisateur</mat-label>
              <mat-icon matPrefix>alternate_email</mat-icon>
              <input matInput formControlName="username" placeholder="ex: joueur.club01" />
              @if (hasError('username', 'required')) {
                <mat-error>Le nom d utilisateur est obligatoire.</mat-error>
              }
              @if (hasError('username', 'minlength')) {
                <mat-error>Le nom d utilisateur doit contenir au moins 3 caracteres.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>mail</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="nom@fttt.tn" />
              @if (hasError('email', 'required')) {
                <mat-error>L email est obligatoire.</mat-error>
              }
              @if (hasError('email', 'email')) {
                <mat-error>Veuillez saisir une adresse email valide.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Prenom</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="firstName" placeholder="Prenom" />
              @if (hasError('firstName', 'required')) {
                <mat-error>Le prenom est obligatoire.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <mat-icon matPrefix>badge</mat-icon>
              <input matInput formControlName="lastName" placeholder="Nom" />
              @if (hasError('lastName', 'required')) {
                <mat-error>Le nom est obligatoire.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-icon matPrefix>workspace_premium</mat-icon>
              <mat-select formControlName="role">
                @for (role of roleOptions; track role.value) {
                  <mat-option [value]="role.value">{{ role.label }}</mat-option>
                }
              </mat-select>
              @if (hasError('role', 'required')) {
                <mat-error>Le role est obligatoire.</mat-error>
              }
            </mat-form-field>

            <div class="role-hint-card">
              <span class="role-hint-card__label">Activation</span>
              <strong>{{ selectedRoleLabel() }}</strong>
              <p>Le compte sera cree actif et pourra se connecter des sa creation.</p>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe initial</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput type="password" formControlName="password" placeholder="Au moins 6 caracteres" />
              @if (hasError('password', 'required')) {
                <mat-error>Le mot de passe est obligatoire.</mat-error>
              }
              @if (hasError('password', 'minlength')) {
                <mat-error>Le mot de passe doit contenir au moins 6 caracteres.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirmation du mot de passe</mat-label>
              <mat-icon matPrefix>verified</mat-icon>
              <input matInput type="password" formControlName="confirmPassword" placeholder="Confirmez le mot de passe" />
              @if (hasError('confirmPassword', 'required')) {
                <mat-error>La confirmation du mot de passe est obligatoire.</mat-error>
              }
              @if (form.hasError('passwordMismatch') && isTouched('confirmPassword')) {
                <mat-error>Les mots de passe ne correspondent pas.</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-actions">
            <a mat-stroked-button routerLink="/app/users">
              <mat-icon>arrow_back</mat-icon>
              Retour a la liste
            </a>

            <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
              @if (submitting()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              <span>Creer le compte</span>
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .create-user-grid {
        display: grid;
        grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
        gap: 20px;
      }

      .info-card,
      .form-card {
        border-radius: 20px !important;
        padding: 24px !important;
        border: 1px solid rgba(15, 35, 84, 0.08);
        box-shadow: 0 14px 36px rgba(15, 35, 84, 0.08) !important;
      }

      .info-card {
        align-self: start;
        background: linear-gradient(180deg, #f6f9ff 0%, #ffffff 100%);
      }

      .eyebrow {
        display: inline-flex;
        margin-bottom: 10px;
        color: #1747a6;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .info-card h2,
      .form-head h2 {
        margin: 0;
        color: #13213d;
        font-size: 1.35rem;
        font-weight: 800;
      }

      .info-card p,
      .form-head p {
        margin: 10px 0 0;
        color: #5f6d85;
        line-height: 1.7;
      }

      .info-points {
        display: grid;
        gap: 12px;
        margin-top: 22px;
      }

      .info-point {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(23, 71, 166, 0.05);
        color: #13213d;
        font-weight: 600;
      }

      .info-point mat-icon {
        color: #1747a6;
      }

      .form-head {
        margin-bottom: 18px;
      }

      .feedback {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 14px 16px;
        border-radius: 14px;
        margin-bottom: 18px;
      }

      .feedback--error {
        background: #fff3f0;
        border: 1px solid rgba(198, 40, 40, 0.18);
        color: #b42318;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      mat-form-field {
        width: 100%;
      }

      .role-hint-card {
        display: grid;
        gap: 6px;
        align-content: start;
        min-height: 120px;
        padding: 18px;
        border-radius: 18px;
        background: linear-gradient(180deg, #fbfcff 0%, #f4f7ff 100%);
        border: 1px solid rgba(23, 71, 166, 0.1);
      }

      .role-hint-card__label {
        color: #1747a6;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .role-hint-card strong {
        color: #13213d;
        font-size: 1rem;
      }

      .role-hint-card p {
        margin: 0;
        color: #5f6d85;
        line-height: 1.6;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 24px;
        padding-top: 22px;
        border-top: 1px solid rgba(15, 35, 84, 0.08);
      }

      .form-actions a,
      .form-actions button {
        min-height: 46px;
        border-radius: 12px !important;
        font-weight: 700 !important;
      }

      .form-actions button {
        min-width: 190px;
      }

      .form-actions button .mdc-button__label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      @media (max-width: 1024px) {
        .create-user-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 760px) {
        .form-grid {
          grid-template-columns: 1fr;
        }

        .form-actions {
          flex-direction: column-reverse;
        }

        .form-actions a,
        .form-actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class UserFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly usersService = inject(UsersService);

  readonly submitting = signal(false);
  readonly submitError = signal('');

  readonly roleOptions: Array<{ value: AdminCreateUserRequest['role']; label: string }> = [
    { value: 'PLAYER', label: 'Joueur' },
    { value: 'CLUB_MANAGER', label: 'Responsable Club' },
    { value: 'COACH', label: 'Entraineur' },
    { value: 'REFEREE', label: 'Arbitre' },
  ];

  readonly roleLabels: Record<AdminCreateUserRequest['role'], string> = {
    PLAYER: 'Joueur',
    CLUB_MANAGER: 'Responsable Club',
    COACH: 'Entraineur',
    REFEREE: 'Arbitre',
  };

  readonly form = this.formBuilder.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['PLAYER' as AdminCreateUserRequest['role'], Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator() }
  );

  readonly selectedRoleLabel = computed(
    () => this.roleLabels[this.form.controls.role.value ?? 'PLAYER']
  );

  hasError(
    controlName:
      | 'username'
      | 'email'
      | 'firstName'
      | 'lastName'
      | 'role'
      | 'password'
      | 'confirmPassword',
    errorCode: string
  ): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(errorCode) && (control.touched || control.dirty);
  }

  isTouched(controlName: 'confirmPassword' | 'password'): boolean {
    const control = this.form.get(controlName);
    return !!control && (control.touched || control.dirty);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    const { confirmPassword: _confirmPassword, ...payload } = this.form.getRawValue();

    this.usersService.create(payload as AdminCreateUserRequest).subscribe({
      next: (user) => {
        this.submitting.set(false);
        this.snackBar.open(
          `Le compte ${user.firstName} ${user.lastName} a ete cree et active avec succes.`,
          'Fermer',
          { duration: 4000 }
        );
        this.router.navigate(['/app/users']);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.submitError.set(this.getErrorMessage(error));
      },
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        typeof error.error === 'string'
          ? error.error
          : error.error?.message || error.error?.error || error.message;

      if (backendMessage) {
        return backendMessage;
      }
    }

    return 'Impossible de creer ce compte pour le moment.';
  }
}
