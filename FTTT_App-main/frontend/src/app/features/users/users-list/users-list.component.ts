import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PendingUserRequest } from '../models/admin-user.model';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  pendingRequests: PendingUserRequest[] = [];

  readonly loading = signal(true);
  readonly processingRequestIds = signal<number[]>([]);

  searchTerm = '';
  selectedRole = '';
  selectedStatus = 'active';

  readonly userColumns = ['avatar', 'name', 'username', 'email', 'role', 'status', 'createdAt', 'actions'];
  readonly pendingColumns = ['username', 'email', 'requestedRole', 'status', 'actions'];

  readonly roles = [
    { value: '', label: 'Tous les roles' },
    { value: 'ADMIN_FEDERATION', label: 'Admin Federation' },
    { value: 'CLUB_MANAGER', label: 'Responsable Club' },
    { value: 'COACH', label: 'Entraineur' },
    { value: 'PLAYER', label: 'Joueur' },
    { value: 'REFEREE', label: 'Arbitre' },
  ];

  readonly statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
  ];

  readonly roleColors: Record<string, string> = {
    ADMIN_FEDERATION: '#d32f2f',
    CLUB_MANAGER: '#8e24aa',
    COACH: '#1976d2',
    PLAYER: '#2e7d32',
    REFEREE: '#ef6c00',
  };

  readonly roleLabels: Record<string, string> = {
    ADMIN_FEDERATION: 'Admin Federation',
    CLUB_MANAGER: 'Responsable Club',
    COACH: 'Entraineur',
    PLAYER: 'Joueur',
    REFEREE: 'Arbitre',
  };

  constructor(
    private readonly usersService: UsersService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get activeUsersCount(): number {
    return this.users.filter((user) => user.status === 'active').length;
  }

  get inactiveUsersCount(): number {
    return this.users.filter((user) => user.status === 'inactive').length;
  }

  get pendingRequestsCount(): number {
    return this.pendingRequests.length;
  }

  loadData(): void {
    this.loading.set(true);

    forkJoin({
      users: this.usersService.getAll('all'),
      pendingRequests: this.usersService.getPendingRequests(),
    }).subscribe({
      next: ({ users, pendingRequests }) => {
        this.users = users;
        this.pendingRequests = pendingRequests;
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Impossible de charger la gestion des utilisateurs.', 'Fermer', {
          duration: 4000,
        });
        this.loading.set(false);
      },
    });
  }

  applyFilter(): void {
    this.filteredUsers = this.users.filter((user) => {
      const query = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        `${user.firstName} ${user.lastName} ${user.username ?? ''} ${user.email}`
          .toLowerCase()
          .includes(query);
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || user.status === this.selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = 'active';
    this.applyFilter();
  }

  openCreateUser(): void {
    this.router.navigate(['/app/users/new']);
  }

  openDetails(user: User): void {
    this.router.navigate(['/app/users', user.id]);
  }

  approveRequest(request: PendingUserRequest): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Approuver la demande',
        message: `Activer le compte ${request.username} avec le role ${this.getRoleLabel(
          request.requestedRole
        )} ?`,
        confirmLabel: 'Approuver',
        cancelLabel: 'Annuler',
        confirmColor: 'primary',
        icon: 'check_circle',
        iconColor: '#2e7d32',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.setRequestProcessing(request.id, true);
      this.usersService.approveRequest(request.id).subscribe({
        next: () => {
          this.snackBar.open('La demande a ete approuvee avec succes.', 'Fermer', {
            duration: 3000,
          });
          this.setRequestProcessing(request.id, false);
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Impossible d approuver cette demande.', 'Fermer', {
            duration: 4000,
          });
          this.setRequestProcessing(request.id, false);
        },
      });
    });
  }

  rejectRequest(request: PendingUserRequest): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Refuser la demande',
        message: `Refuser la demande du compte ${request.username} ?`,
        confirmLabel: 'Refuser',
        cancelLabel: 'Annuler',
        confirmColor: 'warn',
        icon: 'cancel',
        iconColor: '#c62828',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.setRequestProcessing(request.id, true);
      this.usersService.rejectRequest(request.id).subscribe({
        next: () => {
          this.snackBar.open('La demande a ete refusee.', 'Fermer', {
            duration: 3000,
          });
          this.setRequestProcessing(request.id, false);
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Impossible de refuser cette demande.', 'Fermer', {
            duration: 4000,
          });
          this.setRequestProcessing(request.id, false);
        },
      });
    });
  }

  isRequestProcessing(id: number): boolean {
    return this.processingRequestIds().includes(id);
  }

  getInitials(user: User): string {
    const first = user.firstName?.[0] ?? 'U';
    const last = user.lastName?.[0] ?? 'S';
    return `${first}${last}`.toUpperCase();
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] ?? role;
  }

  private setRequestProcessing(id: number, processing: boolean): void {
    if (processing) {
      this.processingRequestIds.set([...this.processingRequestIds(), id]);
      return;
    }

    this.processingRequestIds.set(this.processingRequestIds().filter((requestId) => requestId !== id));
  }
}
