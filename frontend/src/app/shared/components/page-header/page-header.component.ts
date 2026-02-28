import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

export interface BreadcrumbItem {
    label: string;
    route?: string;
}

export interface PageAction {
    label: string;
    icon?: string;
    color?: 'primary' | 'accent' | 'warn';
    variant?: 'flat' | 'stroked' | 'raised' | 'icon';
    action: () => void;
    roles?: string[];
}

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatDividerModule],
    template: `
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          @if (icon) {
            <div class="header-icon">
              <mat-icon>{{ icon }}</mat-icon>
            </div>
          }
          <div class="header-text">
            <div class="breadcrumbs" *ngIf="breadcrumbs?.length">
              @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
                @if (crumb.route && !last) {
                  <a [routerLink]="crumb.route" class="breadcrumb-link">{{ crumb.label }}</a>
                  <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
                } @else {
                  <span class="breadcrumb-current">{{ crumb.label }}</span>
                }
              }
            </div>
            <h1 class="page-title">{{ title }}</h1>
            @if (subtitle) {
              <p class="page-subtitle">{{ subtitle }}</p>
            }
          </div>
        </div>
        <div class="header-actions" *ngIf="actions?.length">
          @for (action of actions; track action.label) {
            @if (action.variant === 'stroked') {
              <button mat-stroked-button [color]="action.color || 'primary'" (click)="action.action()">
                <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
                {{ action.label }}
              </button>
            } @else {
              <button mat-flat-button [color]="action.color || 'primary'" (click)="action.action()">
                <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
                {{ action.label }}
              </button>
            }
          }
        </div>
      </div>
      <mat-divider></mat-divider>
    </div>
  `,
    styles: [`
    .page-header {
      margin-bottom: 24px;
    }
    .header-content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 16px;
      flex-wrap: wrap;
    }
    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .header-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #1a237e, #1565c0);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(21, 101, 192, 0.3);
    }
    .header-icon mat-icon {
      color: white;
      font-size: 26px !important;
      width: 26px !important;
      height: 26px !important;
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-bottom: 4px;
    }
    .breadcrumb-link {
      font-size: 0.78rem;
      color: #1565c0;
      text-decoration: none;
      font-weight: 500;
    }
    .breadcrumb-link:hover { text-decoration: underline; }
    .breadcrumb-sep {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      color: #9e9e9e;
    }
    .breadcrumb-current {
      font-size: 0.78rem;
      color: #9e9e9e;
    }
    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: #666;
      margin: 4px 0 0;
    }
    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .header-actions button {
      height: 40px;
      border-radius: 10px !important;
      font-weight: 600;
    }
  `]
})
export class PageHeaderComponent {
    @Input() title = '';
    @Input() subtitle?: string;
    @Input() icon?: string;
    @Input() breadcrumbs?: BreadcrumbItem[];
    @Input() actions?: PageAction[];
}
