import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CompetitionsService } from '../services/competitions.service';
import { Competition } from '../../../core/models/competition.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-competition-detail',
    standalone: true,
    imports: [
        CommonModule, RouterLink,
        MatCardModule, MatButtonModule, MatIconModule,
        MatDividerModule, MatChipsModule,         MatProgressBarModule, MatProgressSpinnerModule, MatSnackBarModule,
        PageHeaderComponent, StatusBadgeComponent
    ],
    templateUrl: './competition-detail.component.html',
    styleUrls: ['./competition-detail.component.css']
})
export class CompetitionDetailComponent implements OnInit {
    competition: Competition | undefined;
    loading = signal(true);
    error = signal(false);
    adminBusy = signal(false);

    typeLabels: Record<string, string> = { championship: 'Championnat', cup: 'Coupe', friendly: 'Amical', league: 'Ligue' };
    statusColor: Record<string, string> = { open: '#2e7d32', ongoing: '#1565c0', draft: '#f57f17', finished: '#6a1b9a', cancelled: '#c62828' };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private competitionsService: CompetitionsService,
        public authService: AuthService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.error.set(true);
            this.loading.set(false);
            return;
        }

        this.competitionsService.getById(id).subscribe({
            next: (data) => {
                if (data) {
                    this.competition = data;
                } else {
                    this.error.set(true);
                }
                this.loading.set(false);
            },
            error: () => {
                this.error.set(true);
                this.loading.set(false);
            }
        });
    }

    getFillPercentage(): number {
        if (!this.competition || !this.competition.maxParticipants) return 0;
        return (this.competition.currentParticipants / this.competition.maxParticipants) * 100;
    }

    canManage(): boolean {
        return this.authService.hasRole(['ADMIN_FEDERATION']);
    }

    publish(): void {
        if (!this.competition) return;
        this.adminBusy.set(true);
        this.competitionsService.publish(this.competition.id).subscribe({
            next: (c) => {
                this.competition = c;
                this.snackBar.open('Compétition publiée.', 'Fermer', { duration: 3500 });
                this.adminBusy.set(false);
            },
            error: () => {
                this.snackBar.open('Impossible de publier (droits ou serveur).', 'Fermer', { duration: 4000 });
                this.adminBusy.set(false);
            },
        });
    }

    unpublish(): void {
        if (!this.competition) return;
        this.adminBusy.set(true);
        this.competitionsService.unpublish(this.competition.id).subscribe({
            next: (c) => {
                this.competition = c;
                this.snackBar.open('Compétition repassée en brouillon.', 'Fermer', { duration: 3500 });
                this.adminBusy.set(false);
            },
            error: () => {
                this.snackBar.open('Impossible de dépublier.', 'Fermer', { duration: 4000 });
                this.adminBusy.set(false);
            },
        });
    }

    deleteComp(): void {
        if (!this.competition || !confirm('Supprimer définitivement cette compétition ?')) {
            return;
        }
        this.adminBusy.set(true);
        this.competitionsService.delete(this.competition.id).subscribe({
            next: () => {
                this.snackBar.open('Compétition supprimée.', 'Fermer', { duration: 2500 });
                this.router.navigate(['/app/competitions']);
            },
            error: () => {
                this.snackBar.open('Suppression impossible.', 'Fermer', { duration: 4000 });
                this.adminBusy.set(false);
            },
        });
    }
}
