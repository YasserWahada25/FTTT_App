import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageAction, PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LicensesService } from '../services/licenses.service';
import { License } from '../../../core/models/license.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-licenses-list',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatProgressSpinnerModule, MatMenuModule,
        MatSnackBarModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    templateUrl: './licenses-list.component.html',
    styleUrls: ['./licenses-list.component.css']
})
export class LicensesListComponent implements OnInit {
    licenses: License[] = [];
    filtered: License[] = [];
    loading = signal(true);
    searchTerm = '';
    selectedStatus = '';
    cols = ['number', 'player', 'club', 'category', 'status', 'payment', 'expiry', 'actions'];

    constructor(
        private licensesService: LicensesService,
        private router: Router,
        public authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    get canApprove(): boolean {
        return this.authService.hasRole('ADMIN_FEDERATION');
    }

    get canCreateDemand(): boolean {
        return this.authService.hasRole(['ADMIN_FEDERATION', 'CLUB_MANAGER', 'PLAYER']);
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.licensesService.getAll().subscribe({
            next: (l) => {
                this.licenses = l;
                this.filtered = l;
                this.loading.set(false);
            },
            error: () => {
                this.snackBar.open('Impossible de charger les licences.', 'Fermer', { duration: 4000 });
                this.loading.set(false);
            },
        });
    }

    applyFilter(): void {
        this.filtered = this.licenses.filter(l =>
            (!this.searchTerm || `${l.playerName} ${l.clubName} ${l.licenseNumber}`.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
            (!this.selectedStatus || l.status === this.selectedStatus)
        );
    }

    getCount(status: string): number { return this.licenses.filter(l => l.status === status).length; }

    approve(id: string): void {
        this.licensesService.approve(id).subscribe({
            next: () => this.load(),
            error: () => this.snackBar.open('Approbation impossible.', 'Fermer', { duration: 4000 }),
        });
    }

    reject(id: string): void {
        this.licensesService.reject(id, 'Refus administratif').subscribe({
            next: () => this.load(),
            error: () => this.snackBar.open('Refus impossible.', 'Fermer', { duration: 4000 }),
        });
    }

    goToNewLicense(): void {
        void this.router.navigate(['/app/licenses/new']);
    }

    emptyAction(): void { }

    headerActions(): PageAction[] {
        const actions: PageAction[] = [
            { label: 'Exporter', icon: 'download', variant: 'stroked', action: () => this.emptyAction() },
        ];
        if (this.canCreateDemand) {
            actions.push({ label: 'Nouvelle Demande', icon: 'add', action: () => this.goToNewLicense() });
        }
        return actions;
    }
}
