import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent, PageAction } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { VenuesService } from '../services/venues.service';
import { Terrain } from '../../../core/models/terrain.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-venues-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatTooltipModule,
        PageHeaderComponent,
        StatusBadgeComponent,
    ],
    templateUrl: './venues-list.component.html',
    styleUrls: ['./venues-list.component.css'],
})
export class VenuesListComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly venuesService = inject(VenuesService);
    private readonly auth = inject(AuthService);

    terrains: Terrain[] = [];
    filtered: Terrain[] = [];
    loading = signal(true);
    search = '';
    disponibleFilter = '';

    headerActions: PageAction[] = [];

    ngOnInit(): void {
        if (this.auth.hasRole('ADMIN_FEDERATION') || this.auth.hasRole('CLUB_MANAGER')) {
            this.headerActions = [{ label: 'Nouveau terrain', icon: 'add', action: () => this.goNew() }];
        }
        this.venuesService.getAll().subscribe((t) => {
            this.terrains = t;
            this.filtered = t;
            this.loading.set(false);
        });
    }

    goNew(): void {
        void this.router.navigate(['/app/venues/new']);
    }

    canManage(t: Terrain): boolean {
        if (this.auth.hasRole('ADMIN_FEDERATION')) return true;
        if (this.auth.hasRole('CLUB_MANAGER')) {
            const mine = this.auth.currentUser?.clubId;
            return !!mine && t.clubId === String(mine);
        }
        return false;
    }

    canDelete(): boolean {
        return this.auth.hasRole('ADMIN_FEDERATION') || this.auth.hasRole('CLUB_MANAGER');
    }

    filter(): void {
        this.filtered = this.terrains.filter((v) => {
            const q = `${v.nom} ${v.localisation} ${v.surface}`.toLowerCase();
            const matchSearch = !this.search || q.includes(this.search.toLowerCase());
            const matchDisp =
                !this.disponibleFilter ||
                (this.disponibleFilter === 'yes' && v.disponible) ||
                (this.disponibleFilter === 'no' && !v.disponible);
            return matchSearch && matchDisp;
        });
    }

    statusForBadge(t: Terrain): 'active' | 'inactive' | 'suspended' {
        return t.disponible ? 'active' : 'inactive';
    }

    deleteTerrain(t: Terrain, ev: Event): void {
        ev.preventDefault();
        ev.stopPropagation();
        if (!confirm(`Supprimer le terrain « ${t.nom} » ?`)) return;
        this.venuesService.delete(t.id).subscribe({
            next: () => {
                this.terrains = this.terrains.filter((x) => x.id !== t.id);
                this.filter();
            },
            error: () => alert('Suppression impossible (droits ou serveur).'),
        });
    }
}
