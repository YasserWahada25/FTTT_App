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
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { VenuesService } from '../services/venues.service';
import { Venue } from '../../../core/models/venue.model';

@Component({
    selector: 'app-venues-list',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
        MatSelectModule, MatProgressSpinnerModule, MatDividerModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    templateUrl: './venues-list.component.html',
    styleUrls: ['./venues-list.component.css']
})
export class VenuesListComponent implements OnInit {
    venues: Venue[] = [];
    filtered: Venue[] = [];
    loading = signal(true);
    search = '';
    selectedType = '';

    constructor(private venuesService: VenuesService) { }

    ngOnInit(): void {
        this.venuesService.getAll().subscribe(v => {
            this.venues = v;
            this.filtered = v;
            this.loading.set(false);
        });
    }

    filter(): void {
        this.filtered = this.venues.filter(v =>
            (!this.search || `${v.name} ${v.city} ${v.clubName}`.toLowerCase().includes(this.search.toLowerCase())) &&
            (!this.selectedType || v.type === this.selectedType)
        );
    }

    emptyAction(): void { }
}
