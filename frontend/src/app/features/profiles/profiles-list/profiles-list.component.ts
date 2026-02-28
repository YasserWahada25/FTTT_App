import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-profiles-list',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
        MatSelectModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatTooltipModule,
        PageHeaderComponent, StatusBadgeComponent
    ],
    templateUrl: './profiles-list.component.html',
    styleUrls: ['./profiles-list.component.css']
})
export class ProfilesListComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    loading = signal(true);

    // Filters
    searchTerm = '';
    selectedRole = '';
    selectedClub = '';
    selectedCategory = ''; // Not present in base User model, using placeholder logic

    roles = [
        { value: '', label: 'Tous les rôles' },
        { value: 'PLAYER', label: 'Joueur' },
        { value: 'COACH', label: 'Entraîneur' },
        { value: 'REFEREE', label: 'Arbitre' },
        { value: 'CLUB_MANAGER', label: 'Responsable Club' },
        { value: 'ADMIN_FEDERATION', label: 'Admin Fédération' }
    ];

    clubs = [
        { value: '', label: 'Tous les clubs' },
        { value: 'Stade Tunisien TT', label: 'Stade Tunisien TT' },
        { value: 'Esperance Sprotive TT', label: 'Esperance Sportive TT' },
        { value: 'Club Sfax TT', label: 'Club Sfax TT' },
        { value: 'ES Sousse TT', label: 'ES Sousse TT' }
    ];

    categories = [
        { value: '', label: 'Toutes les catégories' },
        { value: 'Senior', label: 'Senior' },
        { value: 'Junior', label: 'Junior' },
        { value: 'Cadet', label: 'Cadet' }
    ];

    roleColors: Record<string, string> = {
        ADMIN_FEDERATION: '#f44336',
        CLUB_MANAGER: '#9c27b0',
        PLAYER: '#4caf50',
        COACH: '#2196f3',
        REFEREE: '#ff9800',
    };

    roleLabels: Record<string, string> = {
        ADMIN_FEDERATION: 'Admin Fédération',
        CLUB_MANAGER: 'Responsable',
        PLAYER: 'Joueur',
        COACH: 'Entraîneur',
        REFEREE: 'Arbitre',
    };

    displayedColumns: string[] = ['avatar', 'name', 'role', 'club', 'category', 'license', 'actions'];

    constructor(private usersService: UsersService) { }

    ngOnInit(): void {
        this.usersService.getAll().subscribe(data => {
            this.users = data;
            this.filteredUsers = data;
            this.loading.set(false);
        });
    }

    getInitials(user: User): string {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    getCategoryPlaceholder(user: User): string {
        // Just a placeholder mock since category isn't on User yet.
        if (user.role === 'PLAYER') return 'Senior';
        return '—';
    }

    getLicenseStatusPlaceholder(user: User): string {
        if (user.role === 'PLAYER' || user.role === 'COACH') return 'active';
        return 'none';
    }

    applyFilter(): void {
        let result = this.users;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(u =>
                u.firstName.toLowerCase().includes(term) ||
                u.lastName.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term)
            );
        }

        if (this.selectedRole) {
            result = result.filter(u => u.role === this.selectedRole);
        }

        if (this.selectedClub) {
            result = result.filter(u => u.clubName === this.selectedClub);
        }

        // Category filter is mocked for now
        if (this.selectedCategory) {
            result = result.filter(u => this.getCategoryPlaceholder(u) === this.selectedCategory);
        }

        this.filteredUsers = result;
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedRole = '';
        this.selectedClub = '';
        this.selectedCategory = '';
        this.applyFilter();
    }
}
