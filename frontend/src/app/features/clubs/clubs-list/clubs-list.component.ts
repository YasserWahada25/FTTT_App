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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ClubsService } from '../services/clubs.service';
import { Club } from '../../../core/models/club.model';

@Component({
    selector: 'app-clubs-list',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
        MatSelectModule, MatTooltipModule, MatProgressSpinnerModule, MatDividerModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    templateUrl: './clubs-list.component.html',
    styleUrls: ['./clubs-list.component.css']
})
export class ClubsListComponent implements OnInit {
    clubs: Club[] = [];
    filteredClubs: Club[] = [];
    loading = signal(true);
    searchTerm = '';
    selectedStatus = '';

    constructor(private clubsService: ClubsService) { }
    ngOnInit(): void { this.clubsService.getAll().subscribe(c => { this.clubs = c; this.filteredClubs = c; this.loading.set(false); }); }

    applyFilter(): void {
        this.filteredClubs = this.clubs.filter(c =>
            (!this.searchTerm || `${c.name} ${c.city} ${c.code}`.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
            (!this.selectedStatus || c.status === this.selectedStatus)
        );
    }
    clearFilters(): void { this.searchTerm = ''; this.selectedStatus = ''; this.filteredClubs = this.clubs; }

    emptyAction(): void { }
}
