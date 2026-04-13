import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ClubsService } from '../services/clubs.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../users/services/users.service';
import { Club, ClubMember } from '../../../core/models/club.model';
import { User, UserRole } from '../../../core/models/user.model';
import { TerrainDTO } from '../services/terrain.dto';
import {
    AddMemberDialogComponent,
    AddMemberDialogResult,
} from './add-member-dialog.component';

@Component({
    selector: 'app-club-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDialogModule,
        MatTooltipModule,
        MatChipsModule,
        PageHeaderComponent,
        StatusBadgeComponent,
    ],
    templateUrl: './club-detail.component.html',
    styleUrls: ['./club-detail.component.css'],
})
export class ClubDetailComponent implements OnInit {
    club: Club | undefined;
    members: ClubMember[] = [];
    terrains: TerrainDTO[] = [];
    loading = signal(true);
    membersLoading = signal(false);
    displayedColumns = ['member', 'clubLink', 'joinedAt', 'actions'];
    /** Annuaire utilisateurs (id Keycloak → fiche) pour afficher noms / rôles. */
    private readonly userById = new Map<string, User>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly clubsService: ClubsService,
        public readonly auth: AuthService,
        private readonly usersService: UsersService,
        private readonly snackBar: MatSnackBar,
        private readonly dialog: MatDialog
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/app/clubs']);
            return;
        }
        forkJoin({
            club: this.clubsService.getById(id),
            users: this.usersService.getAll('all').pipe(catchError(() => of([] as User[]))),
        }).subscribe({
            next: ({ club, users }) => {
                if (!club) {
                    this.snackBar.open('Club introuvable.', 'Fermer', { duration: 4000 });
                    this.router.navigate(['/app/clubs']);
                    return;
                }
                this.userById.clear();
                for (const u of users) {
                    this.userById.set(u.id, u);
                }
                this.club = club;
                this.loading.set(false);
                this.refreshMembers(id);
                this.clubsService.getTerrainsDisponibles(id).subscribe((t) => (this.terrains = t));
            },
            error: () => {
                this.loading.set(false);
                this.router.navigate(['/app/clubs']);
            },
        });
    }

    refreshMembers(clubId: string): void {
        this.membersLoading.set(true);
        this.clubsService.getMembers(clubId).subscribe({
            next: (m) => {
                this.members = m;
                this.membersLoading.set(false);
            },
            error: () => {
                this.members = [];
                this.membersLoading.set(false);
            },
        });
    }

    canManageMembers(): boolean {
        if (!this.club) return false;
        if (this.auth.hasRole('ADMIN_FEDERATION')) return true;
        return (
            this.auth.hasRole('CLUB_MANAGER') &&
            !!this.auth.currentUser?.clubId &&
            String(this.auth.currentUser.clubId) === this.club.id
        );
    }

    canEditClub(): boolean {
        if (!this.club) return false;
        if (this.auth.hasRole('ADMIN_FEDERATION')) return true;
        return (
            this.auth.hasRole('CLUB_MANAGER') &&
            !!this.auth.currentUser?.clubId &&
            String(this.auth.currentUser.clubId) === this.club.id
        );
    }

    openAddMember(): void {
        if (!this.club) return;
        this.usersService.getAll('active').subscribe((users) => {
            const candidates = users.filter((u) => {
                const roles: UserRole[] = u.roles?.length ? u.roles : [u.role];
                return roles.some((r) => r === 'PLAYER' || r === 'COACH');
            });
            const ref = this.dialog.open(AddMemberDialogComponent, {
                width: '420px',
                data: { players: candidates, existingIds: new Set(this.members.map((m) => m.playerUserId)) },
            });
            ref.afterClosed().subscribe((res: AddMemberDialogResult | undefined) => {
                if (!res?.playerUserId || !this.club) return;
                this.clubsService.addMember(this.club.id, res.playerUserId).subscribe({
                    next: () => {
                        this.snackBar.open('Membre associé au club.', 'Fermer', { duration: 2500 });
                        this.refreshMembers(this.club!.id);
                    },
                    error: () =>
                        this.snackBar.open('Association impossible.', 'Fermer', { duration: 4000 }),
                });
            });
        });
    }

    removeMember(m: ClubMember): void {
        if (!this.club || !confirm('Retirer ce membre du club ?')) return;
        this.clubsService.removeMember(this.club.id, m.playerUserId).subscribe({
            next: () => {
                this.snackBar.open('Membre retiré du club.', 'Fermer', { duration: 2500 });
                this.refreshMembers(this.club!.id);
            },
            error: () => this.snackBar.open('Suppression impossible.', 'Fermer', { duration: 4000 }),
        });
    }

    deleteClub(): void {
        if (!this.club || !this.auth.hasRole('ADMIN_FEDERATION')) return;
        if (!confirm('Supprimer définitivement ce club ?')) return;
        this.clubsService.delete(this.club.id).subscribe({
            next: () => {
                this.snackBar.open('Club supprimé.', 'Fermer', { duration: 2500 });
                this.router.navigate(['/app/clubs']);
            },
            error: () => this.snackBar.open('Suppression impossible.', 'Fermer', { duration: 4000 }),
        });
    }

    private userForMember(m: ClubMember): User | undefined {
        return this.userById.get(m.playerUserId);
    }

    memberDisplayName(m: ClubMember): string {
        const u = this.userForMember(m);
        if (!u) return 'Profil inconnu';
        const name = `${u.firstName} ${u.lastName}`.trim();
        return name || u.email;
    }

    memberEmailLine(m: ClubMember): string {
        return this.userForMember(m)?.email ?? '—';
    }

    memberTechnicalIdHint(m: ClubMember): string {
        return `Identifiant technique (compte) : ${m.playerUserId}`;
    }

    clubAttachmentChipText(m: ClubMember): string {
        const clubName = this.club?.name ?? 'ce club';
        const u = this.userForMember(m);
        const roles: UserRole[] = u ? (u.roles?.length ? u.roles : [u.role]) : [];
        if (roles.includes('PLAYER')) {
            return `Joueur rattaché · ${clubName}`;
        }
        if (roles.includes('COACH')) {
            return `Entraîneur rattaché · ${clubName}`;
        }
        if (u) {
            return `Membre rattaché · ${clubName}`;
        }
        return `Rattaché à ${clubName}`;
    }

    managerDisplayLine(): string {
        if (!this.club?.managerUserId) return '—';
        const u = this.userById.get(this.club.managerUserId);
        if (u) {
            const name = `${u.firstName} ${u.lastName}`.trim();
            return name ? `${name} (${u.email})` : u.email;
        }
        return this.club.managerUserId;
    }
}
