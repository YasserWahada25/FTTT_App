import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProfilesService } from '../services/profiles.service';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { Profile } from '../../../core/models/profile.model';
import { User } from '../../../core/models/user.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
    selector: 'app-profile-detail',
    standalone: true,
    imports: [
        CommonModule, RouterLink,
        MatCardModule, MatButtonModule, MatIconModule,
        MatDividerModule, MatChipsModule, MatProgressSpinnerModule,
        PageHeaderComponent, StatusBadgeComponent
    ],
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.css'],
})
export class ProfileDetailComponent implements OnInit {
    profile: Profile | undefined;
    user: User | undefined;
    loading = signal(true);
    error = signal(false);

    // Visibility logic
    canViewPrivateInfo = signal(false);

    constructor(
        private route: ActivatedRoute,
        private profilesService: ProfilesService,
        private usersService: UsersService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set(true);
            this.loading.set(false);
            return;
        }

        // Check permissions: Admin and Club Manager can see private info
        this.canViewPrivateInfo.set(this.authService.hasRole(['ADMIN_FEDERATION', 'CLUB_MANAGER']));

        // Load user and profile data
        this.usersService.getById(id).subscribe(userData => {
            if (userData) {
                this.user = userData;
                this.profilesService.getById(id).subscribe(profileData => {
                    this.profile = profileData;
                    this.loading.set(false);
                });
            } else {
                this.error.set(true);
                this.loading.set(false);
            }
        });
    }

    getInitials(): string {
        if (!this.user) return '';
        return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
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
}
