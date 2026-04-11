import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProfilesService } from '../services/profiles.service';
import { AuthService } from '../../../core/services/auth.service';
import { Profile } from '../../../core/models/profile.model';
import { User } from '../../../core/models/user.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
    selector: 'app-my-profile',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule, MatButtonModule, MatIconModule, MatTabsModule,
        MatDividerModule, MatSlideToggleModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
        PageHeaderComponent, StatusBadgeComponent
    ],
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
    profile: Profile | undefined;
    currentUser: User | null = null;
    loading = signal(true);
    isPublic = signal(true);

    constructor(
        private profilesService: ProfilesService,
        private authService: AuthService
    ) {
        this.currentUser = this.authService.currentUser;
    }

    ngOnInit(): void {
        if (this.currentUser) {
            this.profilesService.getById(this.currentUser.id).subscribe(data => {
                this.profile = data;
                this.loading.set(false);
            });
        } else {
            this.loading.set(false);
        }
    }

    getInitials(): string {
        if (!this.currentUser) return '';
        return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
    }

    getRoleLabel(role?: string): string {
        const roles: Record<string, string> = {
            ADMIN_FEDERATION: 'Admin Fédération',
            CLUB_MANAGER: 'Responsable',
            PLAYER: 'Joueur',
            COACH: 'Entraîneur',
            REFEREE: 'Arbitre',
        };
        return role ? roles[role] || role : '';
    }

    getRoleColor(role?: string): string {
        const colors: Record<string, string> = {
            ADMIN_FEDERATION: '#f44336',
            CLUB_MANAGER: '#9c27b0',
            PLAYER: '#4caf50',
            COACH: '#2196f3',
            REFEREE: '#ff9800',
        };
        return role ? colors[role] || '#757575' : '#757575';
    }

    togglePrivacy(): void {
        this.isPublic.set(!this.isPublic());
        // Normally, call an API here to update the privacy setting
    }
}
