import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { UsersService } from '../services/users.service';
import { User } from '../../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule,
        MatTooltipModule, MatChipsModule, MatProgressSpinnerModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css'],
})
export class UsersListComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    loading = signal(true);
    searchTerm = '';
    selectedRole = '';
    selectedStatus = '';
    displayedColumns = ['avatar', 'name', 'email', 'role', 'club', 'status', 'createdAt', 'actions'];

    roles = [
        { value: '', label: 'Tous les rôles' },
        { value: 'ADMIN_FEDERATION', label: 'Admin Fédération' },
        { value: 'CLUB_MANAGER', label: 'Responsable Club' },
        { value: 'COACH', label: 'Entraîneur' },
        { value: 'PLAYER', label: 'Joueur' },
        { value: 'REFEREE', label: 'Arbitre' },
    ];

    statuses = [
        { value: '', label: 'Tous les statuts' },
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
        { value: 'suspended', label: 'Suspendu' },
    ];

    roleColors: Record<string, string> = {
        ADMIN_FEDERATION: '#f44336',
        CLUB_MANAGER: '#9c27b0',
        COACH: '#2196f3',
        PLAYER: '#4caf50',
        REFEREE: '#ff9800',
    };

    roleLabels: Record<string, string> = {
        ADMIN_FEDERATION: 'Admin Fédération',
        CLUB_MANAGER: 'Responsable Club',
        COACH: 'Entraîneur',
        PLAYER: 'Joueur',
        REFEREE: 'Arbitre',
    };

    constructor(private usersService: UsersService, private router: Router) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading.set(true);
        this.usersService.getAll().subscribe(users => {
            this.users = users;
            this.filteredUsers = users;
            this.loading.set(false);
        });
    }

    applyFilter(): void {
        this.filteredUsers = this.users.filter(u => {
            const matchSearch = !this.searchTerm ||
                `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchRole = !this.selectedRole || u.role === this.selectedRole;
            const matchStatus = !this.selectedStatus || u.status === this.selectedStatus;
            return matchSearch && matchRole && matchStatus;
        });
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedRole = '';
        this.selectedStatus = '';
        this.filteredUsers = this.users;
    }

    getInitials(user: User): string {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    addUser(): void {
        this.router.navigate(['/app/users/new']);
    }
}
