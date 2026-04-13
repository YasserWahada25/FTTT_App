import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_SELECT_SCROLL_STRATEGY, MatSelectModule } from '@angular/material/select';
import { User, UserRole } from '../../../core/models/user.model';

/** Stratégie overlay pour mat-select dans une modale (recalcul de position / scroll du contenu). */
export function addMemberSelectScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

export interface AddMemberDialogData {
    players: User[];
    existingIds: Set<string>;
}

export interface AddMemberDialogResult {
    playerUserId: string;
}

@Component({
    selector: 'app-add-member-dialog',
    standalone: true,
    providers: [
        {
            provide: MAT_SELECT_SCROLL_STRATEGY,
            deps: [Overlay],
            useFactory: addMemberSelectScrollStrategyFactory,
        },
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ScrollingModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
    ],
    template: `
        <h2 mat-dialog-title>Associer un membre</h2>
        <mat-dialog-content>
            <div class="add-member-dialog-body" cdkScrollable>
                <mat-form-field appearance="outline" class="full">
                    <mat-label>Joueur ou entraîneur</mat-label>
                    <mat-select
                        [formControl]="ctrl"
                        required
                        panelClass="add-member-select-panel"
                        [disableOptionCentering]="true"
                    >
                        @for (p of selectable; track p.id) {
                        <mat-option [value]="p.id">{{ p.firstName }} {{ p.lastName }} — {{ roleHint(p) }} ({{ p.email }})</mat-option>
                        }
                    </mat-select>
                </mat-form-field>
                @if (selectable.length === 0) {
                <p class="hint">Aucun compte joueur / entraîneur actif disponible, ou tous sont déjà associés.</p>
                }
            </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Annuler</button>
            <button mat-flat-button color="primary" [disabled]="ctrl.invalid || selectable.length === 0" (click)="ok()">
                Ajouter
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            .full {
                width: 100%;
                margin-top: 8px;
            }
            .hint {
                color: rgba(0, 0, 0, 0.6);
                font-size: 14px;
            }
            .add-member-dialog-body {
                max-height: min(60vh, 360px);
                overflow: auto;
            }
        `,
    ],
})
export class AddMemberDialogComponent {
    private readonly fb = inject(FormBuilder);
    readonly selectable: User[];
    readonly ctrl = this.fb.nonNullable.control<string>('', Validators.required);

    constructor(
        private readonly ref: MatDialogRef<AddMemberDialogComponent, AddMemberDialogResult>,
        @Inject(MAT_DIALOG_DATA) data: AddMemberDialogData
    ) {
        this.selectable = data.players.filter((p) => !data.existingIds.has(p.id));
    }

    ok(): void {
        if (this.ctrl.invalid) return;
        this.ref.close({ playerUserId: this.ctrl.value });
    }

    roleHint(p: User): string {
        const roles: UserRole[] = p.roles?.length ? p.roles : [p.role];
        if (roles.includes('COACH')) return 'Entraîneur';
        if (roles.includes('PLAYER')) return 'Joueur';
        return 'Membre';
    }
}
