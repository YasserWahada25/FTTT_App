import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type BadgeStatus =
    | 'active' | 'inactive' | 'suspended'
    | 'pending' | 'approved' | 'rejected' | 'expired'
    | 'paid' | 'overdue'
    | 'open' | 'ongoing' | 'finished' | 'cancelled' | 'draft'
    | 'scheduled' | 'in_progress' | 'postponed'
    | 'available' | 'maintenance' | 'closed'
    | 'accepted' | 'male' | 'female';

@Component({
    selector: 'app-status-badge',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <span class="status-badge" [class]="'badge-' + getClass()">
      <mat-icon class="badge-icon">{{ getIcon() }}</mat-icon>
      {{ getLabel() }}
    </span>
  `,
    styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .badge-icon {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
    }
    /* Status Colors */
    .badge-active, .badge-approved, .badge-paid, .badge-available, .badge-accepted, .badge-open {
      background: #e8f5e9; color: #2e7d32;
    }
    .badge-inactive, .badge-expired, .badge-cancelled, .badge-closed, .badge-rejected {
      background: #fce4ec; color: #c62828;
    }
    .badge-pending, .badge-scheduled, .badge-draft {
      background: #fff8e1; color: #f57f17;
    }
    .badge-suspended, .badge-overdue {
      background: #fff3e0; color: #e65100;
    }
    .badge-ongoing, .badge-in_progress {
      background: #e3f2fd; color: #1565c0;
    }
    .badge-finished {
      background: #f3e5f5; color: #6a1b9a;
    }
    .badge-postponed, .badge-maintenance {
      background: #e8eaf6; color: #283593;
    }
    .badge-male {
      background: #e3f2fd; color: #1565c0;
    }
    .badge-female {
      background: #fce4ec; color: #880e4f;
    }
  `]
})
export class StatusBadgeComponent {
    @Input() status: BadgeStatus | string = 'active';
    @Input() customLabel?: string;

    private readonly config: Record<string, { label: string; icon: string }> = {
        active: { label: 'Actif', icon: 'check_circle' },
        inactive: { label: 'Inactif', icon: 'cancel' },
        suspended: { label: 'Suspendu', icon: 'block' },
        pending: { label: 'En attente', icon: 'hourglass_empty' },
        approved: { label: 'Approuvé', icon: 'verified' },
        rejected: { label: 'Refusé', icon: 'cancel' },
        expired: { label: 'Expiré', icon: 'schedule' },
        paid: { label: 'Payé', icon: 'payments' },
        overdue: { label: 'En retard', icon: 'warning' },
        open: { label: 'Ouvert', icon: 'open_in_new' },
        ongoing: { label: 'En cours', icon: 'play_circle' },
        finished: { label: 'Terminé', icon: 'flag' },
        cancelled: { label: 'Annulé', icon: 'cancel' },
        draft: { label: 'Brouillon', icon: 'edit_note' },
        scheduled: { label: 'Planifié', icon: 'event' },
        in_progress: { label: 'En cours', icon: 'play_circle' },
        postponed: { label: 'Reporté', icon: 'update' },
        available: { label: 'Disponible', icon: 'check_circle' },
        maintenance: { label: 'Maintenance', icon: 'build' },
        closed: { label: 'Fermé', icon: 'lock' },
        accepted: { label: 'Accepté', icon: 'verified' },
        male: { label: 'Homme', icon: 'male' },
        female: { label: 'Femme', icon: 'female' },
    };

    getClass(): string {
        return this.status?.toString().replace('_', '_') || 'active';
    }

    getLabel(): string {
        return this.customLabel || this.config[this.status]?.label || this.status;
    }

    getIcon(): string {
        return this.config[this.status]?.icon || 'info';
    }
}
