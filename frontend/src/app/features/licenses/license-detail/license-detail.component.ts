import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LicensesService } from '../services/licenses.service';
import { License, LicenseValidityApiResponse } from '../../../core/models/license.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-license-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        PageHeaderComponent,
        StatusBadgeComponent,
    ],
    templateUrl: './license-detail.component.html',
    styleUrls: ['./license-detail.component.css'],
})
export class LicenseDetailComponent implements OnInit {
    license?: License;
    loading = signal(true);
    verifyInput = '';
    verifyResult?: LicenseValidityApiResponse;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly licensesService: LicensesService,
        public readonly authService: AuthService,
        private readonly snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.loading.set(false);
            return;
        }
        this.licensesService.getById(id).subscribe({
            next: (l) => {
                this.license = l ?? undefined;
                if (l?.licenseNumber) {
                    this.verifyInput = l.licenseNumber;
                }
                this.loading.set(false);
            },
            error: () => {
                this.snackBar.open('Licence introuvable ou accès refusé.', 'Fermer', { duration: 4000 });
                this.loading.set(false);
            },
        });
    }

    get canRenew(): boolean {
        if (!this.license) {
            return false;
        }
        if (!['active', 'expired', 'approved'].includes(this.license.status)) {
            return false;
        }
        if (this.authService.hasRole('ADMIN_FEDERATION')) {
            return true;
        }
        if (this.authService.hasRole('CLUB_MANAGER')) {
            return true;
        }
        const u = this.authService.currentUser;
        return !!u && u.id === this.license.playerId;
    }

    get canVerifyByNumber(): boolean {
        return this.authService.isAuthenticated;
    }

    renew(): void {
        if (!this.license) {
            return;
        }
        this.licensesService.renew(this.license.id, {}).subscribe({
            next: () => {
                this.snackBar.open('Demande de renouvellement enregistrée (en attente fédération).', 'Fermer', {
                    duration: 5000,
                });
                void this.router.navigate(['/app/licenses/my']);
            },
            error: (err) => {
                const msg =
                    typeof err.error === 'string'
                        ? err.error
                        : err.error?.message ?? 'Renouvellement impossible.';
                this.snackBar.open(msg, 'Fermer', { duration: 5000 });
            },
        });
    }

    runVerify(): void {
        const n = this.verifyInput?.trim();
        if (!n) {
            return;
        }
        this.licensesService.verify(n).subscribe({
            next: (r) => (this.verifyResult = r),
            error: () => this.snackBar.open('Vérification impossible.', 'Fermer', { duration: 4000 }),
        });
    }

    goBack(): void {
        if (this.authService.hasRole(['ADMIN_FEDERATION', 'CLUB_MANAGER', 'COACH'])) {
            void this.router.navigate(['/app/licenses']);
        } else {
            void this.router.navigate(['/app/licenses/my']);
        }
    }
}
