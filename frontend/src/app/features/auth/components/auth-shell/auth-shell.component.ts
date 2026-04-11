import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './auth-shell.component.html',
  styleUrls: ['./auth-shell.component.css'],
})
export class AuthShellComponent {
  @Input() eyebrow = 'Acces securise';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() footer = 'FTTTApp - Federation Tunisienne de Tennis de Table';
  readonly currentYear = new Date().getFullYear();
}
