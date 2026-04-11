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
import { User } from '../../../core/models/user.model';
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
        private snackBar: MatSnackBar,
        public authService: AuthService
    ) {
        this.licenseForm = this.fb.group({
            playerId: ['', Validators.required],
            clubId: ['', Validators.required],
            category: ['', Validators.required],
            actionType: ['new', Validators.required], // 'new' or 'renewal'
            medicalCertificate: [null],
            photo: [null],
            notes: ['']
        });
    }

    ngOnInit(): void {
        // Load lists for dropdowns
        this.usersService.getAll().subscribe(users => {
            this.players = users.filter(u => u.role === 'PLAYER');
        });

        this.clubsService.getAll().subscribe(clubs => {
            this.clubs = clubs;
        });

        // If club manager, auto-select club
        if (this.authService.hasRole(['CLUB_MANAGER']) && this.authService.currentUser?.clubId) {
            this.licenseForm.patchValue({ clubId: this.authService.currentUser.clubId });
            this.licenseForm.get('clubId')?.disable();
        }
    }

    get pageTitle(): string {
        return 'Nouvelle Demande de Licence';
    }

    get pageSubtitle(): string {
        return 'Soumettre une demande d\'affiliation ou de renouvellement';
    }

    onSubmit(): void {
        if (this.licenseForm.invalid) {
            this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
            return;
        }

        this.loading.set(true);
        const formValue = this.licenseForm.getRawValue();

        const selectedPlayer = this.players.find(p => p.id === formValue.playerId);
        const selectedClub = this.clubs.find(c => c.id === formValue.clubId);

        const newLicense = {
            licenseNumber: `PENDING-${Math.floor(Math.random() * 10000)}`,
            playerId: formValue.playerId,
            playerName: selectedPlayer ? `${selectedPlayer.firstName} ${selectedPlayer.lastName}` : '',
            clubId: formValue.clubId,
            clubName: selectedClub?.name || '',
            category: formValue.category,
            season: '2024-2025',
            status: 'pending' as const,
            paymentStatus: 'pending' as const,
            amount: formValue.category === 'Senior' ? 50 : 30, // Mock amount Logic
            expiryDate: '2025-08-31',
            requestDate: new Date().toISOString().split('T')[0],
            notes: formValue.notes
        };

        this.licensesService.create(newLicense).subscribe({
            next: () => {
                this.snackBar.open('Demande de licence soumise avec succès.', 'Fermer', { duration: 3000, panelClass: ['success-snackbar'] });
                this.loading.set(false);
                this.router.navigate(['/app/licenses']);
            },
            error: () => {
                this.snackBar.open('Erreur lors de la soumission.', 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
                this.loading.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/app/licenses']);
    }
}
