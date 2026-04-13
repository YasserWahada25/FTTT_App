import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RankingsService } from '../../matches/services/matches.service';
import { Ranking } from '../../../core/models/match.model';

@Component({
  selector: 'app-rankings-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  templateUrl: './rankings-list.component.html',
  styleUrls: ['./rankings-list.component.css']
})
export class RankingsListComponent implements OnInit {
  rankings: Ranking[] = [];
  filtered: Ranking[] = [];
  loading = signal(true);
  categories = ['Senior Hommes', 'Senior Dames', 'Juniors', 'Vétérans'];
  selectedCat = 'Senior Hommes';
  cols = ['position', 'player', 'club', 'points', 'record'];

  constructor(private rankingsService: RankingsService, private route: ActivatedRoute) { }
  ngOnInit(): void {
    const cat = this.route.snapshot.paramMap.get('category');
    if (cat) this.selectedCat = cat;
    this.rankingsService.getAll().subscribe(r => { this.rankings = r; this.filter(); this.loading.set(false); });
  }
  selectCat(cat: string): void { this.selectedCat = cat; this.filter(); }
  filter(): void { this.filtered = this.rankings.filter(r => r.category === this.selectedCat); }
}
