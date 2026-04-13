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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CompetitionsService } from '../services/competitions.service';
import { AuthService } from '../../../core/services/auth.service';
import { CompetitionWritePayload } from '../../../core/models/competition.model';

@Component({
    selector: 'app-competition-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
        MatSelectModule, MatDatepickerModule, MatNativeDateModule,
        MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule,
        PageHeaderComponent
    ],
    templateUrl: './competition-form.component.html',
    styleUrls: ['./competition-form.component.css']
})
export class CompetitionFormComponent implements OnInit {
    competitionForm: FormGroup;
    loading = signal(false);

    types: { value: 'championship' | 'cup' | 'friendly' | 'league'; label: string }[] = [
        { value: 'championship', label: 'Championnat' },
        { value: 'cup', label: 'Coupe' },
        { value: 'league', label: 'Ligue / Tournoi' },
        { value: 'friendly', label: 'Amical' },
    ];

    categories = ['Toutes catégories', 'Senior Hommes', 'Senior Dames', 'Junior', 'Cadet', 'Minime'];

    audienceRoles = [
        { value: 'PLAYER', label: 'Joueurs' },
        { value: 'COACH', label: 'Entraîneurs' },
        { value: 'REFEREE', label: 'Arbitres' },
        { value: 'CLUB_MANAGER', label: 'Responsables club' },
        { value: 'ADMIN_FEDERATION', label: 'Admin fédération' },
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private competitionsService: CompetitionsService,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {
        this.competitionForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(5)]],
            type: ['', Validators.required],
            category: ['', Validators.required],
            location: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            registrationDeadline: ['', Validators.required],
            maxParticipants: [32, [Validators.required, Validators.min(2), Validators.max(256)]],
            prize: [''],
            description: [''],
            rules: [''],
            targetRoles: this.fb.nonNullable.control<string[]>([]),
        });
    }

    ngOnInit(): void { }

    onSubmit(): void {
        if (this.competitionForm.invalid) {
            this.snackBar.open('Veuillez remplir correctement tous les champs obligatoires.', 'Fermer', { duration: 3000 });
            return;
        }

        this.loading.set(true);
        const formValue = this.competitionForm.getRawValue();
        const currentUser = this.authService.currentUser;

        const payload: CompetitionWritePayload = {
            name: formValue.name,
            category: CompetitionsService.uiFormatToCategory(formValue.type),
            sportCategoryLabel: formValue.category,
            location: formValue.location,
            startDate: this.toLocalDateTimeStart(formValue.startDate),
            endDate: this.toLocalDateTimeEndOfDay(formValue.endDate),
            registrationDeadline: this.toLocalDateTimeEndOfDay(formValue.registrationDeadline),
            maxParticipants: formValue.maxParticipants,
            currentParticipants: 0,
            description: formValue.description || undefined,
            rules: formValue.rules || undefined,
            prize: formValue.prize || undefined,
            organizerName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'FTTT Admin',
            published: false,
            targetRoles: formValue.targetRoles?.length ? formValue.targetRoles : [],
        };

        this.competitionsService.create(payload).subscribe({
            next: () => {
                this.snackBar.open('Compétition créée avec succès (Brouillon).', 'Fermer', { duration: 3000, panelClass: ['success-snackbar'] });
                this.loading.set(false);
                this.router.navigate(['/app/competitions']);
            },
            error: () => {
                this.snackBar.open('Erreur lors de la création de la compétition.', 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
                this.loading.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/app/competitions']);
    }

    /** Évite le décalage UTC des `Date` à minuit local (datepicker Material). */
    private toLocalDateTimeStart(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}T00:00:00`;
    }

    private toLocalDateTimeEndOfDay(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}T23:59:59`;
    }
}
