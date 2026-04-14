import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LicensesService } from '../services/licenses.service';
import { UsersService } from '../../users/services/users.service';
import { ClubsService } from '../../clubs/services/clubs.service';
import { ProfilesService } from '../../profiles/services/profiles.service';
import { User } from '../../../core/models/user.model';
import { Profile } from '../../../core/models/profile.model';
import { Club } from '../../../core/models/club.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-license-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
        MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule,
        MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule,
        PageHeaderComponent
    ],
    templateUrl: './license-form.component.html',
    styleUrls: ['./license-form.component.css']
})
export class LicenseFormComponent implements OnInit {
    licenseForm: FormGroup;
    loading = signal(false);
    players: User[] = [];
    clubs: Club[] = [];
    categories = ['Minime', 'Cadet', 'Junior', 'Senior', 'Vétéran'];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private licensesService: LicensesService,
        private usersService: UsersService,
        private clubsService: ClubsService,
        private profilesService: ProfilesService,
        private snackBar: MatSnackBar,
        public authService: AuthService
    ) {
        this.licenseForm = this.fb.group({
            playerId: ['', Validators.required],
            clubId: ['', Validators.required],
            category: ['', Validators.required],
            actionType: ['new', Validators.required],
            notes: [''],
        });
    }

    medicalFile = signal<File | null>(null);
    photoFile = signal<File | null>(null);

    get isPlayerSelfService(): boolean {
        return this.authService.hasRole('PLAYER')
            && !this.authService.hasRole('ADMIN_FEDERATION')
            && !this.authService.hasRole('CLUB_MANAGER');
    }

    ngOnInit(): void {
        const u = this.authService.currentUser;

        if (this.isPlayerSelfService && u) {
            this.licenseForm.patchValue({ playerId: u.id });
            this.licenseForm.get('playerId')?.disable();
        } else if (this.authService.hasRole('ADMIN_FEDERATION')) {
            this.usersService.getAll().subscribe({
                next: (users) => {
                    this.players = users.filter((x) => x.role === 'PLAYER');
                },
                error: () => {
                    this.snackBar.open('Impossible de charger les utilisateurs.', 'Fermer', { duration: 4000 });
                },
            });
        } else if (this.authService.hasRole('CLUB_MANAGER')) {
            this.profilesService.getAll().subscribe((profiles) => {
                const cid = u?.clubId;
                this.players = profiles
                    .filter((p) => cid && String(p.clubId ?? '') === String(cid))
                    .map((p) => this.profileToUser(p));
            });
        }

        this.clubsService.getAll().subscribe((clubs) => {
            this.clubs = clubs;
        });

        if (this.authService.hasRole('CLUB_MANAGER') && u?.clubId) {
            this.licenseForm.patchValue({ clubId: u.clubId });
            this.licenseForm.get('clubId')?.disable();
        }
    }

    get pageTitle(): string {
        return 'Nouvelle Demande de Licence';
    }

    get pageSubtitle(): string {
        return 'Soumettre une demande d\'affiliation (validation fédérale requise)';
    }

    onMedicalSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.medicalFile.set(input.files?.[0] ?? null);
    }

    onPhotoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.photoFile.set(input.files?.[0] ?? null);
    }

    onSubmit(): void {
        if (this.licenseForm.invalid) {
            this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
            return;
        }

        const med = this.medicalFile();
        const pic = this.photoFile();
        if (!med || !pic) {
            this.snackBar.open(
                'Le certificat médical et la photo d’identité numérique sont obligatoires.',
                'Fermer',
                { duration: 5000 }
            );
            return;
        }

        this.loading.set(true);
        const formValue = this.licenseForm.getRawValue();

        const selectedPlayer = this.players.find((p) => p.id === formValue.playerId)
            ?? this.authService.currentUser;
        const selectedClub = this.clubs.find((c) => c.id === formValue.clubId);

        if (!selectedPlayer || !formValue.clubId || !selectedClub) {
            this.snackBar.open('Joueur ou club invalide.', 'Fermer', { duration: 3000 });
            this.loading.set(false);
            return;
        }

        const y = new Date().getFullYear();
        const season = `${y}-${y + 1}`;

        this.licensesService
            .createWithDocuments(
                {
                    playerId: formValue.playerId,
                    playerName: `${selectedPlayer.firstName} ${selectedPlayer.lastName}`.trim(),
                    clubId: formValue.clubId,
                    clubName: selectedClub.name,
                    category: formValue.category,
                    season,
                    notes: formValue.notes || undefined,
                },
                med,
                pic
            )
            .subscribe({
                next: () => {
                    this.snackBar.open('Demande de licence soumise avec succès.', 'Fermer', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                    });
                    this.loading.set(false);
                    this.router.navigate(['/app/licenses/my']);
                },
                error: (err) => {
                    const msg =
                        typeof err.error === 'string'
                            ? err.error
                            : err.error?.message ?? 'Erreur lors de la soumission.';
                    this.snackBar.open(msg, 'Fermer', { duration: 5000, panelClass: ['error-snackbar'] });
                    this.loading.set(false);
                },
            });
    }

    goBack(): void {
        const path = this.isPlayerSelfService ? '/app/licenses/my' : '/app/licenses';
        void this.router.navigate([path]);
    }

    private profileToUser(p: Profile): User {
        const name = p.name?.trim() || '';
        const parts = name.split(/\s+/).filter(Boolean);
        return {
            id: p.userId,
            firstName: parts[0] ?? '—',
            lastName: parts.slice(1).join(' ') ?? '',
            email: p.email ?? '',
            role: 'PLAYER',
            status: 'active',
            createdAt: '',
            updatedAt: '',
        };
    }
}
