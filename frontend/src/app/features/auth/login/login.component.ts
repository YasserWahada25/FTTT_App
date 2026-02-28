import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = signal(false);
    error = signal('');
    hidePassword = signal(true);

    demoAccounts = [
        { role: 'Admin Fédération', email: 'admin@fttt.tn', password: 'admin123', color: '#f44336' },
        { role: 'Responsable Club', email: 'manager@club.tn', password: 'manager123', color: '#9c27b0' },
        { role: 'Joueur', email: 'player@fttt.tn', password: 'player123', color: '#4caf50' },
        { role: 'Entraîneur', email: 'coach@fttt.tn', password: 'coach123', color: '#2196f3' },
        { role: 'Arbitre', email: 'referee@fttt.tn', password: 'referee123', color: '#ff9800' },
    ];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['admin@fttt.tn', [Validators.required, Validators.email]],
            password: ['admin123', [Validators.required, Validators.minLength(6)]],
        });
    }

    ngOnInit(): void {
        // Désactiver la redirection automatique pour forcer l'affichage de la page login
        // if (this.authService.isAuthenticated) {
        //     setTimeout(() => this.router.navigate(['/app/dashboard']), 0);
        // }
    }

    fillDemo(account: { email: string; password: string }): void {
        this.loginForm.patchValue({ email: account.email, password: account.password });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;
        this.loading.set(true);
        this.error.set('');

        const { email, password } = this.loginForm.value;
        this.authService.login({ email, password }).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/app/dashboard']);
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err.message || 'Erreur de connexion');
            },
        });
    }
}
