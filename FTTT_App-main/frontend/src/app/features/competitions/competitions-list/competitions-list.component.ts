import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CompetitionsService } from '../services/competitions.service';
import { Competition } from '../../../core/models/competition.model';

@Component({
    selector: 'app-competitions-list',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
        MatSelectModule, MatProgressSpinnerModule, MatDividerModule, MatChipsModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    templateUrl: './competitions-list.component.html',
    styleUrls: ['./competitions-list.component.css']
})
export class CompetitionsListComponent implements OnInit {
    competitions: Competition[] = [];
    filtered: Competition[] = [];
    loading = signal(true);
    searchTerm = '';
    selectedStatus = '';

    typeLabels: Record<string, string> = { championship: 'Championnat', cup: 'Coupe', friendly: 'Amical', league: 'Ligue' };
    statusColor: Record<string, string> = { open: '#2e7d32', ongoing: '#1565c0', draft: '#f57f17', finished: '#6a1b9a', cancelled: '#c62828' };

    constructor(private competitionsService: CompetitionsService, private router: Router) { }
    ngOnInit(): void { this.competitionsService.getAll().subscribe(c => { this.competitions = c; this.filtered = c; this.loading.set(false); }); }

    goToNewCompetition(): void {
        this.router.navigate(['/app/competitions/new']);
    }

    applyFilter(): void {
        this.filtered = this.competitions.filter(c =>
            (!this.searchTerm || `${c.name} ${c.location} ${c.category}`.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
            (!this.selectedStatus || c.status === this.selectedStatus)
        );
    }

    emptyAction(): void { }
}
