import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule, RouterLink,
        MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatDividerModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
    currentUser: User | null = null;

    kpis = [
        { label: 'Clubs Actifs', value: '124', icon: 'sports_tennis', color: '#1565c0', bg: '#e3f2fd', change: '+3', trend: 'up' },
        { label: 'Licences Actives', value: '5,241', icon: 'badge', color: '#2e7d32', bg: '#e8f5e9', change: '+89', trend: 'up' },
        { label: 'Compétitions', value: '18', icon: 'emoji_events', color: '#f57f17', bg: '#fff8e1', change: '4 en cours', trend: 'neutral' },
        { label: 'Matchs ce mois', value: '342', icon: 'sports', color: '#6a1b9a', bg: '#f3e5f5', change: '+28', trend: 'up' },
        { label: 'Demandes Licences', value: '37', icon: 'pending_actions', color: '#c62828', bg: '#fce4ec', change: '37 en attente', trend: 'alert' },
        { label: 'Terrains', value: '56', icon: 'stadium', color: '#00695c', bg: '#e0f2f1', change: '51 disponibles', trend: 'neutral' },
    ];

    recentMatches = [
        { home: 'A. Hamdi', away: 'M. Trabelsi', score: '3-1', competition: 'Championnat National', date: '2025-03-10', status: 'finished' },
        { home: 'S. Ben Ali', away: 'K. Jebali', score: '2-3', competition: 'Coupe de Tunisie', date: '2025-03-09', status: 'finished' },
        { home: 'R. Karoui', away: 'T. Saad', score: '-', competition: 'Championnat Régional', date: '2025-03-12', status: 'scheduled' },
        { home: 'N. Hmidi', away: 'F. Turki', score: '-', competition: 'Championnat National', date: '2025-03-13', status: 'scheduled' },
    ];

    upcomingCompetitions = [
        { name: 'Championnat National 2025', date: '2025-03-20', status: 'open', participants: 48, max: 64 },
        { name: 'Coupe de Tunisie', date: '2025-04-05', status: 'open', participants: 28, max: 32 },
        { name: 'Championnat des Jeunes', date: '2025-04-15', status: 'draft', participants: 12, max: 40 },
    ];

    licenseStats = [
        { label: 'Actives', value: 5241, color: '#2e7d32' },
        { label: 'En attente', value: 37, color: '#f57f17' },
        { label: 'Expirées', value: 312, color: '#c62828' },
    ];

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUser;
    }

    getGreeting(): string {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }

    /** Profil lié à un club (données session : claim / profil métier). */
    hasClubAffiliation(): boolean {
        const u = this.currentUser;
        return !!(u?.clubId || (u?.clubName && u.clubName.trim().length > 0));
    }

    clubAffiliationName(): string {
        const u = this.currentUser;
        const name = u?.clubName?.trim();
        if (name) return name;
        if (u?.clubId) return `Club #${u.clubId}`;
        return '';
    }

    clubAffiliationHint(): string {
        const u = this.currentUser;
        const role = u?.role;
        if (role === 'CLUB_MANAGER') {
            return 'Vous gérez ce club sur la plateforme.';
        }
        if (role === 'COACH') {
            return 'Votre compte entraîneur est rattaché à cet effectif.';
        }
        if (role === 'PLAYER') {
            return 'Votre compte joueur est rattaché à ce club.';
        }
        return 'Votre compte est associé à ce club.';
    }

    /** Identifiant club pour le lien « Voir le club » (évite les assertions dans le template). */
    clubDetailPath(): string | null {
        const id = this.currentUser?.clubId;
        if (id === undefined || id === null || id === '') {
            return null;
        }
        return String(id);
    }
}
