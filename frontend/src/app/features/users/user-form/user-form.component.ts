import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDividerModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      [title]="pageTitle"
      [subtitle]="pageSubtitle"
      icon="person"
      [breadcrumbs]="[{label:'Tableau de Bord', route:'/app/dashboard'},{label:'Utilisateurs', route:'/app/users'},{label: isEdit ? 'Modifier' : 'Nouveau'}]"
    ></app-page-header>

    <mat-card class="form-card">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="firstName" placeholder="Prénom" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="lastName" placeholder="Nom de famille" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput formControlName="email" type="email" placeholder="email@domaine.tn" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <mat-icon matPrefix>phone</mat-icon>
            <input matInput formControlName="phone" placeholder="+216 XX XXX XXX" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rôle</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <mat-select formControlName="role">
              <mat-option value="ADMIN_FEDERATION">Admin Fédération</mat-option>
              <mat-option value="CLUB_MANAGER">Responsable Club</mat-option>
              <mat-option value="COACH">Entraîneur</mat-option>
              <mat-option value="PLAYER">Joueur</mat-option>
              <mat-option value="REFEREE">Arbitre</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Statut</mat-label>
            <mat-icon matPrefix>toggle_on</mat-icon>
            <mat-select formControlName="status">
              <mat-option value="active">Actif</mat-option>
              <mat-option value="inactive">Inactif</mat-option>
              <mat-option value="suspended">Suspendu</mat-option>
            </mat-select>
          </mat-form-field>

          @if (!isEdit) {
            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput formControlName="password" type="password" />
            </mat-form-field>
          }
        </div>

        <mat-divider></mat-divider>

        <div class="form-actions">
          <button mat-stroked-button type="button" routerLink="/app/users">
            <mat-icon>cancel</mat-icon> Annuler
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
            <mat-icon>save</mat-icon>
            {{ isEdit ? 'Mettre à jour' : 'Créer l\'utilisateur' }}
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [`
    .form-card { border-radius: 16px !important; padding: 24px !important; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; }
    .form-actions button { border-radius: 10px !important; height: 44px; min-width: 140px; }
  `]
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = signal(false);

  get pageTitle(): string { return this.isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"; }
  get pageSubtitle(): string { return this.isEdit ? "Mettre à jour les informations" : "Créer un nouveau compte utilisateur"; }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['PLAYER', Validators.required],
      status: ['active', Validators.required],
      password: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.usersService.getById(id).subscribe(user => {
        if (user) this.form.patchValue(user);
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id');
    const action = this.isEdit && id ? this.usersService.update(id, this.form.value) : this.usersService.create(this.form.value);
    action.subscribe(() => {
      this.loading.set(false);
      this.router.navigate(['/app/users']);
    });
  }
}
