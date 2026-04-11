import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: 'primary' | 'accent' | 'warn';
    icon?: string;
    iconColor?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="confirm-dialog">
      <div class="dialog-icon" [style.background]="data.iconColor + '20'">
        <mat-icon [style.color]="data.iconColor || '#f44336'">
          {{ data.icon || 'warning' }}
        </mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="cancel()">
          {{ data.cancelLabel || 'Annuler' }}
        </button>
        <button mat-flat-button [color]="data.confirmColor || 'warn'" (click)="confirm()">
          {{ data.confirmLabel || 'Confirmer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .confirm-dialog {
      padding: 8px 0;
      text-align: center;
    }
    .dialog-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .dialog-icon mat-icon {
      font-size: 36px !important;
      width: 36px !important;
      height: 36px !important;
    }
    h2 {
      font-size: 1.2rem !important;
      font-weight: 700 !important;
      color: #1a1a2e;
    }
    mat-dialog-content p {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    mat-dialog-actions {
      gap: 10px;
      padding: 0 16px 16px !important;
    }
    mat-dialog-actions button {
      border-radius: 8px !important;
      min-width: 100px;
    }
  `]
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) { }

    confirm(): void {
        this.dialogRef.close(true);
    }

    cancel(): void {
        this.dialogRef.close(false);
    }
}
