import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  PageAction,
  PageHeaderComponent,
} from '../../../shared/components/page-header/page-header.component';
import { ProfilesService } from '../services/profiles.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClubsService } from '../../clubs/services/clubs.service';
import { Profile } from '../../../core/models/profile.model';
import { User } from '../../../core/models/user.model';
import { Club } from '../../../core/models/club.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
})
export class MyProfileComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  profile: Profile | undefined;
  currentUser: User | null = null;
  /** Clubs où le compte est membre (source club-service, pas seulement le JWT). */
  readonly memberClubs = signal<Club[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editing = signal(false);
  readonly isPublic = signal(true);

  readonly form = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20)]],
  });

  constructor(
    private readonly profilesService: ProfilesService,
    private readonly clubsService: ClubsService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {
    this.currentUser = this.authService.currentUser;
  }

  get headerActions(): PageAction[] {
    return this.editing()
      ? [
          { label: 'Annuler', icon: 'close', variant: 'stroked', action: this.cancelEdit.bind(this) },
          { label: 'Enregistrer', icon: 'save', action: this.saveProfile.bind(this) },
        ]
      : [{ label: 'Modifier', icon: 'edit', action: this.startEdit.bind(this) }];
  }

  get displayPhone(): string {
    return this.profile?.phone || this.currentUser?.phone || 'Non renseigne';
  }

  ngOnInit(): void {
    if (!this.currentUser) {
      this.loading.set(false);
      return;
    }

    this.patchForm(this.currentUser);

    this.profilesService.getById(this.currentUser.id).subscribe((data) => {
      this.profile = data;
      this.isPublic.set(data?.publicProfile ?? true);
      this.patchForm(this.currentUser, data);
      this.loading.set(false);
    });

    this.clubsService.getMyMemberClubs().subscribe((clubs) => this.memberClubs.set(clubs));
  }

  /** Affichage club : priorité aux rattachements réels (membres du club). */
  displayAffiliatedClubs(): string {
    const clubs = this.memberClubs();
    if (clubs.length > 0) {
      return clubs.map((c) => c.name).join(', ');
    }
    return this.currentUser?.clubName?.trim() || 'Aucun club affilié';
  }

  startEdit(): void {
    this.editing.set(true);
    this.patchForm(this.currentUser, this.profile);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.patchForm(this.currentUser, this.profile);
  }

  saveProfile(): void {
    if (!this.currentUser) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    this.saving.set(true);

    this.authService
      .updateMyProfile({
        firstName: formValue.firstName?.trim() ?? '',
        lastName: formValue.lastName?.trim() ?? '',
        email: formValue.email?.trim() ?? '',
        phone: formValue.phone?.trim() || null,
      })
      .subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.profile = {
            id: this.profile?.id ?? '',
            userId: updatedUser.id,
            name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
            email: updatedUser.email,
            phone: updatedUser.phone,
            category: updatedUser.role,
            bio: this.profile?.bio,
            skills: this.profile?.skills ?? [],
            achievements: this.profile?.achievements ?? [],
            publicProfile: this.profile?.publicProfile ?? true,
            stats: this.profile?.stats,
            createdAt: this.profile?.createdAt,
            updatedAt: new Date().toISOString(),
          };
          this.patchForm(updatedUser, this.profile);
          this.editing.set(false);
          this.saving.set(false);
          this.snackBar.open('Votre profil a ete mis a jour avec succes.', 'Fermer', {
            duration: 3500,
          });
        },
        error: (error: Error) => {
          this.saving.set(false);
          this.snackBar.open(error.message || 'Impossible de mettre a jour votre profil.', 'Fermer', {
            duration: 4500,
          });
        },
      });
  }

  getInitials(): string {
    if (!this.currentUser) {
      return '';
    }

    return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
  }

  getRoleLabel(role?: string): string {
    const roles: Record<string, string> = {
      ADMIN_FEDERATION: 'Admin Federation',
      CLUB_MANAGER: 'Responsable Club',
      PLAYER: 'Joueur',
      COACH: 'Entraineur',
      REFEREE: 'Arbitre',
    };
    return role ? roles[role] || role : '';
  }

  getRoleColor(role?: string): string {
    const colors: Record<string, string> = {
      ADMIN_FEDERATION: '#f44336',
      CLUB_MANAGER: '#9c27b0',
      PLAYER: '#4caf50',
      COACH: '#2196f3',
      REFEREE: '#ff9800',
    };
    return role ? colors[role] || '#757575' : '#757575';
  }

  togglePrivacy(): void {
    if (!this.currentUser) {
      return;
    }

    const nextVisibility = !this.isPublic();
    this.profilesService.updateVisibility(this.currentUser.id, nextVisibility).subscribe({
      next: (profile) => {
        this.profile = {
          ...this.profile,
          ...profile,
        };
        this.isPublic.set(nextVisibility);
      },
      error: () => {
        this.snackBar.open('Impossible de modifier la visibilite du profil.', 'Fermer', {
          duration: 3500,
        });
      },
    });
  }

  hasError(controlName: 'firstName' | 'lastName' | 'email' | 'phone', errorCode: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }

  private patchForm(user: User | null, profile?: Profile): void {
    this.form.patchValue({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: profile?.phone ?? user?.phone ?? '',
    });
  }
}
