import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { VenuesService } from '../services/venues.service';
import { CompetitionsService } from '../../competitions/services/competitions.service';
import { AuthService } from '../../../core/services/auth.service';
import { Terrain } from '../../../core/models/terrain.model';
@Component({
    selector: 'app-venue-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        PageHeaderComponent,
        StatusBadgeComponent,
    ],
    templateUrl: './venue-detail.component.html',
    styleUrls: ['./venue-detail.component.css'],
})
export class VenueDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly venuesService = inject(VenuesService);
    private readonly competitionsService = inject(CompetitionsService);
    readonly auth = inject(AuthService);

    terrain: Terrain | undefined;
    competitionLabels = new Map<string, string>();
    loading = signal(true);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            void this.router.navigate(['/app/venues']);
            return;
        }
        this.competitionsService.getAll().subscribe((comps) => {
            for (const c of comps) {
                this.competitionLabels.set(String(c.id), c.name);
            }
        });
        this.venuesService.getById(id).subscribe({
            next: (t) => {
                if (!t) {
                    void this.router.navigate(['/app/venues']);
                    return;
                }
                this.terrain = t;
                this.loading.set(false);
            },
            error: () => void this.router.navigate(['/app/venues']),
        });
    }

    canEdit(): boolean {
        if (!this.terrain) return false;
        if (this.auth.hasRole('ADMIN_FEDERATION')) return true;
        if (this.auth.hasRole('CLUB_MANAGER')) {
            const mine = this.auth.currentUser?.clubId;
            return !!mine && this.terrain.clubId === String(mine);
        }
        return false;
    }

    canDelete(): boolean {
        return this.canEdit();
    }

    statusForBadge(): 'active' | 'inactive' {
        return this.terrain?.disponible ? 'active' : 'inactive';
    }

    deleteTerrain(): void {
        if (!this.terrain || !confirm('Supprimer ce terrain ?')) return;
        this.venuesService.delete(this.terrain.id).subscribe({
            next: () => void this.router.navigate(['/app/venues']),
            error: () => alert('Suppression impossible.'),
        });
    }

    competitionName(id: string): string {
        return this.competitionLabels.get(id) || `Compétition #${id}`;
    }
}
