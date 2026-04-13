import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ClubsService } from '../services/clubs.service';
import { AuthService } from '../../../core/services/auth.service';
import { Club, ClubWritePayload } from '../../../core/models/club.model';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-club-form',
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
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDividerModule,
        PageHeaderComponent,
    ],
    templateUrl: './club-form.component.html',
    styleUrls: ['./club-form.component.css'],
})
export class ClubFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        code: ['', [Validators.required, Validators.maxLength(32)]],
        logo: [''],
        address: [''],
        city: ['', Validators.required],
        region: ['', Validators.required],
        phone: [''],
        email: ['', Validators.email],
        website: [''],
        foundedYear: [new Date().getFullYear(), [Validators.required, Validators.min(1800), Validators.max(2100)]],
        status: this.fb.nonNullable.control<'active' | 'inactive' | 'suspended'>('active'),
        managerUserId: [''],
    });

    loading = signal(false);
    pageLoading = signal(true);
    editId: string | null = null;
    /** Responsable club : champs code / statut / managerUserId en lecture seule. */
    managerRestricted = signal(false);
    private loadedClub: Club | null = null;
    /** Comptes actifs avec rôle responsable de club (liste du select). */
    clubManagers: User[] = [];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly clubsService: ClubsService,
        private readonly usersService: UsersService,
        private readonly auth: AuthService,
        private readonly snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id || id === 'new') {
            this.pageLoading.set(false);
            if (!this.auth.hasRole('ADMIN_FEDERATION')) {
                this.snackBar.open('Création réservée à l’administration.', 'Fermer', { duration: 4000 });
                this.router.navigate(['/app/clubs']);
                return;
            }
            this.loadClubManagersForSelect(null);
            return;
        }
        this.editId = id;
        const admin = this.auth.hasRole('ADMIN_FEDERATION');
        this.managerRestricted.set(!admin && this.auth.hasRole('CLUB_MANAGER'));
        forkJoin({
            club: this.clubsService.getById(id),
            users: this.usersService.getAll('active').pipe(catchError(() => of([] as User[]))),
        }).subscribe({
            next: ({ club, users }) => {
                if (!club) {
                    this.snackBar.open('Club introuvable.', 'Fermer', { duration: 4000 });
                    this.router.navigate(['/app/clubs']);
                    return;
                }
                this.loadedClub = club;
                if (!this.managerRestricted()) {
                    this.loadClubManagersForSelect(club.managerUserId ?? null, users);
                }
                this.form.patchValue({
                    name: club.name,
                    code: club.code,
                    logo: club.logo ?? '',
                    address: club.address,
                    city: club.city,
                    region: club.region,
                    phone: club.phone,
                    email: club.email,
                    website: club.website ?? '',
                    foundedYear: club.foundedYear,
                    status: club.status,
                    managerUserId: club.managerUserId ?? '',
                });
                if (this.managerRestricted()) {
                    this.form.get('code')?.disable();
                    this.form.get('status')?.disable();
                    this.form.get('managerUserId')?.disable();
                }
                this.pageLoading.set(false);
            },
            error: () => {
                this.snackBar.open('Impossible de charger le club.', 'Fermer', { duration: 4000 });
                this.router.navigate(['/app/clubs']);
            },
        });
    }

    /** Construit la liste des responsables pour le select ; `allUsers` évite un 2ᵉ appel HTTP en édition. */
    private loadClubManagersForSelect(currentManagerId: string | null, allUsers?: User[]): void {
        const apply = (users: User[]) => {
            const managers = users.filter(
                (u) => u.role === 'CLUB_MANAGER' || (u.roles?.includes('CLUB_MANAGER') ?? false)
            );
            managers.sort((a, b) =>
                `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'fr')
            );
            if (
                currentManagerId &&
                !managers.some((m) => m.id === currentManagerId)
            ) {
                managers.unshift({
                    id: currentManagerId,
                    username: '',
                    firstName: 'Responsable',
                    lastName: 'enregistré',
                    email: currentManagerId,
                    role: 'CLUB_MANAGER',
                    roles: ['CLUB_MANAGER'],
                    status: 'active',
                    createdAt: '',
                    updatedAt: '',
                });
            }
            this.clubManagers = managers;
        };
        if (allUsers) {
            apply(allUsers);
            return;
        }
        this.usersService.getAll('active').subscribe({
            next: (users) => apply(users),
            error: () => {
                this.clubManagers = [];
            },
        });
    }

    submit(): void {
        if (this.form.invalid) {
            this.snackBar.open('Veuillez corriger le formulaire.', 'Fermer', { duration: 3000 });
            return;
        }
        const raw = this.form.getRawValue();
        const payload: ClubWritePayload = {
            name: raw.name,
            code: raw.code,
            logo: raw.logo || undefined,
            address: raw.address || undefined,
            city: raw.city,
            region: raw.region,
            phone: raw.phone || undefined,
            email: raw.email || undefined,
            website: raw.website || undefined,
            foundedYear: raw.foundedYear,
            status: raw.status,
            managerUserId: raw.managerUserId || undefined,
        };
        if (this.managerRestricted() && this.loadedClub) {
            payload.code = this.loadedClub.code;
            payload.status = this.loadedClub.status;
            payload.managerUserId = this.loadedClub.managerUserId;
        }
        this.loading.set(true);
        const done = () => {
            this.loading.set(false);
            this.snackBar.open('Club enregistré.', 'Fermer', { duration: 2500 });
            if (this.editId) {
                this.router.navigate(['/app/clubs', this.editId]);
            }
        };
        const fail = () => {
            this.loading.set(false);
            this.snackBar.open('Enregistrement impossible (droits ou serveur).', 'Fermer', { duration: 4000 });
        };
        if (this.editId) {
            this.clubsService.update(this.editId, payload).subscribe({ next: done, error: fail });
        } else {
            this.clubsService.create(payload).subscribe({
                next: (c) => {
                    this.loading.set(false);
                    this.snackBar.open('Club créé.', 'Fermer', { duration: 2500 });
                    this.router.navigate(['/app/clubs', c.id]);
                },
                error: fail,
            });
        }
    }

    cancel(): void {
        this.router.navigate(this.editId ? ['/app/clubs', this.editId] : ['/app/clubs']);
    }
}
