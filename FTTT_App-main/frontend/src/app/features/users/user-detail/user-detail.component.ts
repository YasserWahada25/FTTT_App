import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header
      [title]="user() ? user()!.firstName + ' ' + user()!.lastName : 'Detail utilisateur'"
      subtitle="Consultez les informations du compte plateforme."
      icon="account_circle"
      [breadcrumbs]="[
        { label: 'Tableau de Bord', route: '/app/dashboard' },
        { label: 'Utilisateurs', route: '/app/users' },
        { label: user() ? user()!.firstName + ' ' + user()!.lastName : 'Detail' }
      ]"
    ></app-page-header>

    @if (loading()) {
      <mat-card class="state-card">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Chargement des informations du compte...</p>
      </mat-card>
    } @else if (user()) {
      <div class="detail-grid">
        <mat-card class="hero-card">
          <div class="hero-card__avatar">{{ getInitials(user()!) }}</div>

          <div class="hero-card__content">
            <span class="eyebrow">Compte plateforme</span>
            <h2>{{ user()!.firstName }} {{ user()!.lastName }}</h2>
            <p>{{ getRoleLabel(user()!.role) }} · {{ user()!.email }}</p>

            <div class="hero-card__badges">
              <span class="role-chip">{{ getRoleLabel(user()!.role) }}</span>
              <app-status-badge [status]="user()!.status"></app-status-badge>
            </div>
          </div>
        </mat-card>

        <mat-card class="detail-card">
          <div class="detail-card__head">
            <div>
              <span class="eyebrow">Informations</span>
              <h3>Fiche du compte</h3>
            </div>
          </div>

          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-item__label">Nom complet</span>
              <strong>{{ user()!.firstName }} {{ user()!.lastName }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-item__label">Nom d utilisateur</span>
              <strong>{{ user()!.username || '-' }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-item__label">Adresse email</span>
              <strong>{{ user()!.email }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-item__label">Role</span>
              <strong>{{ getRoleLabel(user()!.role) }}</strong>
            </div>

            <div class="detail-item">
              <span class="detail-item__label">Statut</span>
              <app-status-badge [status]="user()!.status"></app-status-badge>
            </div>

            <div class="detail-item">
              <span class="detail-item__label">Date de creation</span>
              <strong>{{ user()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}</strong>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="detail-card__actions">
            <a mat-stroked-button routerLink="/app/users">
              <mat-icon>arrow_back</mat-icon>
              Retour a la liste
            </a>
          </div>
        </mat-card>
      </div>
    } @else {
      <mat-card class="state-card">
        <mat-icon>person_off</mat-icon>
        <p>Compte introuvable.</p>
        <a mat-stroked-button routerLink="/app/users">Retour a la liste</a>
      </mat-card>
    }
  `,
  styles: [
    `
      .detail-grid {
        display: grid;
        gap: 20px;
      }

      .hero-card,
      .detail-card,
      .state-card {
        border-radius: 20px !important;
        border: 1px solid rgba(15, 35, 84, 0.08);
        box-shadow: 0 14px 34px rgba(15, 35, 84, 0.08) !important;
      }

      .hero-card {
        display: flex;
        gap: 20px;
        align-items: center;
        padding: 24px !important;
        background: linear-gradient(135deg, #13357f 0%, #1d5fd0 100%);
        color: #ffffff;
      }

      .hero-card__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 84px;
        height: 84px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.16);
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }

      .hero-card__content h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
      }

      .hero-card__content p {
        margin: 8px 0 0;
        color: rgba(255, 255, 255, 0.82);
      }

      .hero-card__badges {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 16px;
      }

      .eyebrow {
        display: inline-flex;
        margin-bottom: 10px;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .hero-card .eyebrow {
        color: rgba(255, 255, 255, 0.75);
      }

      .detail-card {
        padding: 24px !important;
      }

      .detail-card .eyebrow {
        color: #1747a6;
      }

      .detail-card__head h3 {
        margin: 0;
        color: #13213d;
        font-size: 1.25rem;
        font-weight: 800;
      }

      .detail-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin: 22px 0;
      }

      .detail-item {
        display: grid;
        gap: 6px;
        min-height: 86px;
        padding: 16px 18px;
        border-radius: 16px;
        background: #f8faff;
        border: 1px solid rgba(23, 71, 166, 0.08);
      }

      .detail-item__label {
        color: #5f6d85;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .detail-item strong {
        color: #13213d;
        font-size: 1rem;
      }

      .detail-card__actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .detail-card__actions a {
        min-height: 44px;
        border-radius: 12px !important;
        font-weight: 700 !important;
      }

      .role-chip {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        color: #ffffff;
        font-size: 0.76rem;
        font-weight: 700;
      }

      .state-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding: 56px 24px !important;
        color: #5f6d85;
        text-align: center;
      }

      .state-card mat-icon {
        color: #8ea0bf;
        font-size: 40px !important;
        width: 40px !important;
        height: 40px !important;
      }

      @media (max-width: 760px) {
        .hero-card {
          flex-direction: column;
          align-items: flex-start;
        }

        .detail-list {
          grid-template-columns: 1fr;
        }

        .detail-card__actions a {
          width: 100%;
        }
      }
    `,
  ],
})
export class UserDetailComponent implements OnInit {
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);

  readonly roleLabels: Record<string, string> = {
    ADMIN_FEDERATION: 'Admin Federation',
    CLUB_MANAGER: 'Responsable Club',
    COACH: 'Entraineur',
    PLAYER: 'Joueur',
    REFEREE: 'Arbitre',
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      return;
    }

    this.usersService.getById(id).subscribe({
      next: (user) => {
        this.user.set(user ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Impossible de charger ce compte.', 'Fermer', {
          duration: 4000,
        });
        this.user.set(null);
        this.loading.set(false);
      },
    });
  }

  getInitials(user: User): string {
    const first = user.firstName?.[0] ?? 'U';
    const last = user.lastName?.[0] ?? 'S';
    return `${first}${last}`.toUpperCase();
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] ?? role;
  }
}
