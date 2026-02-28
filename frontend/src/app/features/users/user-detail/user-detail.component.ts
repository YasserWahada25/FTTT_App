import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { UsersService } from '../services/users.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-user-detail',
    standalone: true,
    imports: [
        CommonModule, RouterLink,
        MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatChipsModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    template: `
    <app-page-header
      [title]="user ? (user.firstName + ' ' + user.lastName) : 'Chargement...'"
      subtitle="Détails de l'utilisateur"
      icon="account_circle"
      [breadcrumbs]="[{label:'Tableau de Bord', route:'/app/dashboard'},{label:'Utilisateurs', route:'/app/users'},{label:'Détails'}]"
      [actions]="user ? [{label:'Modifier', icon:'edit', action: editUser.bind(this)}] : []"
    ></app-page-header>

    @if (user) {
      <div class="detail-grid">
        <mat-card class="info-card">
          <div class="profile-header">
            <div class="profile-avatar">{{ getInitials(user) }}</div>
            <div class="profile-info">
              <h2>{{ user.firstName }} {{ user.lastName }}</h2>
              <p>{{ user.email }}</p>
              <div class="profile-badges">
                <span class="role-badge">{{ roleLabels[user.role] }}</span>
                <app-status-badge [status]="user.status"></app-status-badge>
              </div>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="info-rows">
            <div class="info-row"><mat-icon>phone</mat-icon><span>{{ user.phone || 'Non renseigné' }}</span></div>
            <div class="info-row"><mat-icon>sports_tennis</mat-icon><span>{{ user.clubName || 'Aucun club' }}</span></div>
            <div class="info-row"><mat-icon>calendar_today</mat-icon><span>Créé le {{ user.createdAt | date:'dd/MM/yyyy' }}</span></div>
          </div>
          <div class="card-actions">
            <a mat-stroked-button routerLink="/app/users">
              <mat-icon>arrow_back</mat-icon> Retour à la liste
            </a>
            <a mat-flat-button color="primary" [routerLink]="['/app/users', user.id, 'edit']">
              <mat-icon>edit</mat-icon> Modifier
            </a>
          </div>
        </mat-card>
      </div>
    }
  `,
    styles: [`
    .detail-grid { display: grid; gap: 20px; }
    .info-card { border-radius: 16px !important; padding: 24px !important; }
    .profile-header { display: flex; gap: 20px; align-items: center; margin-bottom: 20px; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1a237e, #1565c0); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; flex-shrink: 0; }
    .profile-info h2 { margin: 0 0 4px; font-size: 1.3rem; font-weight: 700; color: #1a1a2e; }
    .profile-info p { margin: 0 0 8px; color: #666; font-size: 0.9rem; }
    .profile-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .role-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #e3f2fd; color: #1565c0; }
    .info-rows { display: flex; flex-direction: column; gap: 14px; padding: 16px 0; }
    .info-row { display: flex; align-items: center; gap: 12px; color: #444; font-size: 0.9rem; }
    .info-row mat-icon { color: #1565c0; }
    .card-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; }
    .card-actions button, .card-actions a { border-radius: 10px !important; }
  `]
})
export class UserDetailComponent implements OnInit {
    user: User | null = null;

    roleLabels: Record<string, string> = {
        ADMIN_FEDERATION: 'Admin Fédération',
        CLUB_MANAGER: 'Responsable Club',
        COACH: 'Entraîneur',
        PLAYER: 'Joueur',
        REFEREE: 'Arbitre',
    };

    constructor(private route: ActivatedRoute, private usersService: UsersService) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.usersService.getById(id).subscribe(u => this.user = u || null);
    }

    getInitials(user: User): string {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    editUser(): void { }
}
