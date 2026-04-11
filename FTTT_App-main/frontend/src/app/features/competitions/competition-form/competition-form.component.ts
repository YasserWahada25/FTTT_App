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

    types = [
        { value: 'championship', label: 'Championnat' },
        { value: 'cup', label: 'Coupe' },
        { value: 'league', label: 'Ligue' },
        { value: 'friendly', label: 'Amical / Tournoi' }
    ];

    categories = ['Toutes catégories', 'Senior Hommes', 'Senior Dames', 'Junior', 'Cadet', 'Minime'];

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
            rules: ['']
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

        const newCompetition = {
            name: formValue.name,
            type: formValue.type,
            category: formValue.category,
            status: 'draft' as const, // Start as draft
            startDate: formValue.startDate.toISOString().split('T')[0],
            endDate: formValue.endDate.toISOString().split('T')[0],
            registrationDeadline: formValue.registrationDeadline.toISOString().split('T')[0],
            location: formValue.location,
            maxParticipants: formValue.maxParticipants,
            currentParticipants: 0,
            description: formValue.description,
            rules: formValue.rules,
            prize: formValue.prize,
            organizerId: currentUser?.id || 'admin',
            organizerName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'FTTT Admin'
        };

        this.competitionsService.create(newCompetition).subscribe({
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
}
