import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MatchesService } from '../services/matches.service';
import { Match } from '../../../core/models/match.model';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule, MatTableModule,
    PageHeaderComponent, StatusBadgeComponent,
  ],
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.css']
})
export class MatchesListComponent implements OnInit {
  matches: Match[] = [];
  filtered: Match[] = [];
  loading = signal(true);
  search = '';
  status = '';
  cols = ['date', 'match', 'score', 'competition', 'round', 'status', 'actions'];

  constructor(private matchesService: MatchesService) { }
  ngOnInit(): void { this.matchesService.getAll().subscribe(m => { this.matches = m; this.filtered = m; this.loading.set(false); }); }
  filter(): void {
    this.filtered = this.matches.filter(m =>
      (!this.search || `${m.homePlayerName} ${m.awayPlayerName} ${m.competitionName}`.toLowerCase().includes(this.search.toLowerCase())) &&
      (!this.status || m.status === this.status)
    );
  }
}
