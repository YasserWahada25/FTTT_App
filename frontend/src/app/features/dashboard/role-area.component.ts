import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type RoleAreaKey = 'player' | 'manager' | 'coach' | 'referee';

interface RoleAreaAction {
  icon: string;
  label: string;
  route: string;
  variant: 'flat' | 'stroked';
}

interface RoleAreaConfig {
  actions: RoleAreaAction[];
  icon: string;
  nextStep: string;
  subtitle: string;
  summary: string;
  title: string;
}

const ROLE_AREA_CONFIG: Record<RoleAreaKey, RoleAreaConfig> = {
  player: {
    title: 'Espace Player',
    subtitle: 'Point d entree joueur en attendant les ecrans metier dedies.',
    icon: 'sports_tennis',
    summary:
      'Votre session est active. Vous pouvez maintenant acceder a votre profil et aux services disponibles.',
    nextStep:
      'Commencez par verifier vos informations personnelles puis explorez vos licences et competitions.',
    actions: [
      { label: 'Mon profil', route: '/app/profile/me', icon: 'account_circle', variant: 'flat' },
      { label: 'Mes licences', route: '/app/licenses/my', icon: 'badge', variant: 'stroked' },
    ],
  },
  manager: {
    title: 'Espace Club Manager',
    subtitle: 'Zone manager prete pour accueillir les fonctionnalites clubs et supervision.',
    icon: 'groups',
    summary:
      'Votre acces manager est reconnu. Vous pouvez maintenant retrouver les espaces de gestion disponibles.',
    nextStep:
      'Commencez par completer votre profil puis accedez aux vues clubs et profils deja presentes.',
    actions: [
      { label: 'Mon profil', route: '/app/profile/me', icon: 'account_circle', variant: 'flat' },
      { label: 'Clubs', route: '/app/clubs', icon: 'sports_tennis', variant: 'stroked' },
    ],
  },
  coach: {
    title: 'Espace Coach',
    subtitle: 'Zone coach propre pour poursuivre l integration sans inventer de logique metier.',
    icon: 'fitness_center',
    summary:
      'Votre espace coach est pret. La redirection se fait automatiquement apres connexion.',
    nextStep:
      'Commencez par votre profil puis utilisez les ecrans competitions et matchs deja disponibles.',
    actions: [
      { label: 'Mon profil', route: '/app/profile/me', icon: 'account_circle', variant: 'flat' },
      { label: 'Competitions', route: '/app/competitions', icon: 'emoji_events', variant: 'stroked' },
    ],
  },
  referee: {
    title: 'Espace Referee',
    subtitle: 'Zone referee prete a recevoir les prochaines fonctionnalites d arbitrage.',
    icon: 'gavel',
    summary:
      'Votre espace referee est accessible et les sections autorisees vous sont maintenant ouvertes.',
    nextStep:
      'Commencez par votre profil puis consultez les ecrans matchs et classements deja accessibles.',
    actions: [
      { label: 'Mon profil', route: '/app/profile/me', icon: 'account_circle', variant: 'flat' },
      { label: 'Matchs', route: '/app/matches', icon: 'sports', variant: 'stroked' },
    ],
  },
};

@Component({
  selector: 'app-role-area',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header [title]="config.title" [subtitle]="config.subtitle" [icon]="config.icon"></app-page-header>

    <div class="role-area-grid">
      <mat-card class="role-area-card role-area-card--hero">
        <div class="role-area-hero">
          <div>
            <div class="role-area-eyebrow">Session active</div>
            <h2>Bienvenue {{ currentUser?.firstName || 'dans votre espace' }}</h2>
            <p>{{ config.summary }}</p>
          </div>

          <app-status-badge status="active" [customLabel]="currentRoleLabel"></app-status-badge>
        </div>

        <div class="role-area-actions">
          @for (action of config.actions; track action.route) {
            @if (action.variant === 'flat') {
              <a mat-flat-button color="primary" [routerLink]="action.route">
                <mat-icon>{{ action.icon }}</mat-icon>
                {{ action.label }}
              </a>
            } @else {
              <a mat-stroked-button [routerLink]="action.route">
                <mat-icon>{{ action.icon }}</mat-icon>
                {{ action.label }}
              </a>
            }
          }
        </div>
      </mat-card>

      <mat-card class="role-area-card">
        <h3>Informations de session</h3>
        <div class="role-area-list">
          <div class="role-area-list__row">
            <span>Utilisateur</span>
            <strong>{{ currentUser?.username || currentUser?.email || '-' }}</strong>
          </div>
          <div class="role-area-list__row">
            <span>Email</span>
            <strong>{{ currentUser?.email || '-' }}</strong>
          </div>
          <div class="role-area-list__row">
            <span>Role actif</span>
            <strong>{{ currentRoleLabel }}</strong>
          </div>
          <div class="role-area-list__row">
            <span>Acces</span>
            <strong>Session active et navigation protegee</strong>
          </div>
        </div>
      </mat-card>

      <mat-card class="role-area-card">
        <h3>Prochaine etape</h3>
        <p>{{ config.nextStep }}</p>
        <a mat-button color="primary" routerLink="/app/profile/me">
          Completer mon profil
          <mat-icon>arrow_forward</mat-icon>
        </a>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .role-area-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 20px;
      }

      .role-area-card {
        padding: 22px;
        border-radius: 18px !important;
        box-shadow: 0 10px 28px rgba(15, 35, 84, 0.08) !important;
      }

      .role-area-card--hero {
        grid-column: 1 / -1;
        background:
          radial-gradient(circle at top right, rgba(15, 78, 167, 0.12), transparent 30%),
          linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      }

      .role-area-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }

      .role-area-eyebrow {
        margin-bottom: 8px;
        color: #0f4ea7;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .role-area-hero h2 {
        margin: 0 0 10px;
        color: #13213d;
        font-size: 1.6rem;
        font-weight: 800;
      }

      .role-area-hero p,
      .role-area-card p {
        margin: 0;
        color: #5f6d85;
        line-height: 1.7;
      }

      .role-area-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 22px;
      }

      .role-area-actions a {
        height: 44px;
        border-radius: 12px !important;
        font-weight: 700;
      }

      .role-area-card h3 {
        margin: 0 0 18px;
        color: #13213d;
        font-size: 1.1rem;
        font-weight: 800;
      }

      .role-area-list {
        display: grid;
        gap: 14px;
      }

      .role-area-list__row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e7edf6;
        color: #5f6d85;
      }

      .role-area-list__row strong {
        color: #13213d;
        text-align: right;
      }

      @media (max-width: 900px) {
        .role-area-grid {
          grid-template-columns: 1fr;
        }

        .role-area-hero {
          flex-direction: column;
        }

        .role-area-list__row {
          flex-direction: column;
        }

        .role-area-list__row strong {
          text-align: left;
        }
      }
    `,
  ],
})
export class RoleAreaComponent implements OnInit {
  config = ROLE_AREA_CONFIG.player;
  currentRoleLabel = 'Utilisateur';
  currentUser: User | null = null;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const area = this.activatedRoute.snapshot.data['area'] as RoleAreaKey | undefined;
    this.config = area ? ROLE_AREA_CONFIG[area] : ROLE_AREA_CONFIG.player;
    this.currentUser = this.authService.currentUser;
    this.currentRoleLabel = this.getRoleLabel(this.currentUser?.role);
  }

  private getRoleLabel(role: string | undefined): string {
    switch (role) {
      case 'PLAYER':
        return 'Player';
      case 'CLUB_MANAGER':
        return 'Club Manager';
      case 'COACH':
        return 'Coach';
      case 'REFEREE':
        return 'Referee';
      default:
        return 'Utilisateur';
    }
  }
}
