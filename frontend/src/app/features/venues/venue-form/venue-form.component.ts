import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { VenuesService } from '../services/venues.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClubsService } from '../../clubs/services/clubs.service';
import { CompetitionsService } from '../../competitions/services/competitions.service';
import { TerrainWritePayload } from '../../../core/models/terrain.model';
import { Competition } from '../../../core/models/competition.model';
import { Club } from '../../../core/models/club.model';

@Component({
    selector: 'app-venue-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDividerModule,
        PageHeaderComponent,
    ],
    templateUrl: './venue-form.component.html',
    styleUrls: ['./venue-form.component.css'],
})
export class VenueFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly venuesService = inject(VenuesService);
    private readonly auth = inject(AuthService);
    private readonly clubsService = inject(ClubsService);
    private readonly competitionsService = inject(CompetitionsService);
    private readonly snackBar = inject(MatSnackBar);

    readonly form = this.fb.nonNullable.group({
        nom: ['', [Validators.required, Validators.minLength(2)]],
        surface: [''],
        localisation: [''],
        disponible: [true],
        prixParHeure: [0, [Validators.required, Validators.min(0)]],
        image: [''],
        clubId: this.fb.control<number | null>(null),
        competitionIds: this.fb.nonNullable.control<number[]>([]),
    });

    loading = signal(false);
    pageLoading = signal(true);
    editId: string | null = null;
    clubs: Club[] = [];
    competitions: Competition[] = [];
    /** Responsable club : club imposé par le JWT. */
    managerMode = signal(false);

    ngOnInit(): void {
        if (!this.auth.hasRole('ADMIN_FEDERATION') && !this.auth.hasRole('CLUB_MANAGER')) {
            this.snackBar.open('Accès réservé à l’administration ou au responsable de club.', 'Fermer', {
                duration: 4000,
            });
            void this.router.navigate(['/app/venues']);
            return;
        }
        this.managerMode.set(this.auth.hasRole('CLUB_MANAGER') && !this.auth.hasRole('ADMIN_FEDERATION'));

        this.competitionsService.getAll().subscribe((c) => (this.competitions = c));
        if (this.auth.hasRole('ADMIN_FEDERATION')) {
            this.clubsService.getAll().subscribe((c) => (this.clubs = c));
        }

        const id = this.route.snapshot.paramMap.get('id');
        if (!id || id === 'new') {
            this.pageLoading.set(false);
            if (this.managerMode()) {
                const cid = this.auth.currentUser?.clubId;
                this.form.patchValue({ clubId: cid ? Number(cid) : null });
                this.form.get('clubId')?.disable();
            }
            return;
        }
        this.editId = id;
        this.venuesService.getById(id).subscribe({
            next: (t) => {
                if (!t) {
                    this.snackBar.open('Terrain introuvable.', 'Fermer', { duration: 4000 });
                    void this.router.navigate(['/app/venues']);
                    return;
                }
                const admin = this.auth.hasRole('ADMIN_FEDERATION');
                if (!admin && this.auth.hasRole('CLUB_MANAGER')) {
                    const mine = this.auth.currentUser?.clubId;
                    if (!mine || t.clubId !== String(mine)) {
                        this.snackBar.open('Modification non autorisée.', 'Fermer', { duration: 4000 });
                        void this.router.navigate(['/app/venues', id]);
                        return;
                    }
                    this.managerMode.set(true);
                    this.form.get('clubId')?.disable();
                }
                this.form.patchValue({
                    nom: t.nom,
                    surface: t.surface,
                    localisation: t.localisation,
                    disponible: t.disponible,
                    prixParHeure: t.prixParHeure,
                    image: t.image ?? '',
                    clubId: t.clubId ? Number(t.clubId) : null,
                    competitionIds: t.competitionIds.map((x) => Number(x)),
                });
                this.pageLoading.set(false);
            },
            error: () => {
                void this.router.navigate(['/app/venues']);
            },
        });
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const raw = this.form.getRawValue();
        const payload: TerrainWritePayload = {
            nom: raw.nom.trim(),
            surface: raw.surface?.trim() || undefined,
            localisation: raw.localisation?.trim() || undefined,
            disponible: raw.disponible,
            prixParHeure: Number(raw.prixParHeure),
            image: raw.image?.trim() || undefined,
            clubId: raw.clubId ?? null,
            competitionIds: raw.competitionIds ?? [],
        };
        if (this.managerMode()) {
            const cid = this.auth.currentUser?.clubId;
            payload.clubId = cid ? Number(cid) : null;
        }
        this.loading.set(true);
        const done = () => {
            this.loading.set(false);
            this.snackBar.open('Terrain enregistré.', 'Fermer', { duration: 2500 });
        };
        const fail = () => {
            this.loading.set(false);
            this.snackBar.open('Enregistrement impossible.', 'Fermer', { duration: 4000 });
        };
        if (this.editId) {
            this.venuesService.update(this.editId, payload).subscribe({
                next: () => {
                    done();
                    void this.router.navigate(['/app/venues', this.editId]);
                },
                error: fail,
            });
        } else {
            this.venuesService.create(payload).subscribe({
                next: (created) => {
                    done();
                    void this.router.navigate(['/app/venues', created.id]);
                },
                error: fail,
            });
        }
    }

    cancel(): void {
        void this.router.navigate(this.editId ? ['/app/venues', this.editId] : ['/app/venues']);
    }
}
