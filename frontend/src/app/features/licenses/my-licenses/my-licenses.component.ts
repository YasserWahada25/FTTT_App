import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LicensesService } from '../services/licenses.service';
import { License } from '../../../core/models/license.model';
import { AuthService } from '../../../core/services/auth.service';
import { PageAction } from '../../../shared/components/page-header/page-header.component';

@Component({
    selector: 'app-my-licenses',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        PageHeaderComponent,
        StatusBadgeComponent,
    ],
    templateUrl: './my-licenses.component.html',
    styleUrls: ['./my-licenses.component.css'],
})
export class MyLicensesComponent implements OnInit {
    licenses: License[] = [];
    loading = signal(true);
    displayedColumns = ['number', 'status', 'category', 'expiry', 'actions'];

    constructor(
        private readonly licensesService: LicensesService,
        private readonly router: Router,
        public readonly authService: AuthService,
        private readonly snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.licensesService.getMyLicenses().subscribe({
            next: (rows) => {
                this.licenses = rows;
                this.loading.set(false);
            },
            error: () => {
                this.snackBar.open('Impossible de charger vos licences.', 'Fermer', { duration: 4000 });
                this.loading.set(false);
            },
        });
    }

    headerActions(): PageAction[] {
        const actions: PageAction[] = [];
        if (this.authService.hasRole(['ADMIN_FEDERATION', 'CLUB_MANAGER', 'PLAYER'])) {
            actions.push({
                label: 'Nouvelle demande',
                icon: 'add',
                action: () => void this.router.navigate(['/app/licenses/new']),
            });
        }
        return actions;
    }
}
