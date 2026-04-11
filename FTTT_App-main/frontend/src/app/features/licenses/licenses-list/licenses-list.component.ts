import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LicensesService } from '../services/licenses.service';
import { License } from '../../../core/models/license.model';

@Component({
    selector: 'app-licenses-list',
    standalone: true,
    imports: [
        CommonModule, RouterLink, FormsModule,
        MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatProgressSpinnerModule, MatMenuModule,
        PageHeaderComponent, StatusBadgeComponent,
    ],
    templateUrl: './licenses-list.component.html',
    styleUrls: ['./licenses-list.component.css']
})
export class LicensesListComponent implements OnInit {
    licenses: License[] = [];
    filtered: License[] = [];
    loading = signal(true);
    searchTerm = '';
    selectedStatus = '';
    cols = ['number', 'player', 'club', 'category', 'status', 'payment', 'expiry', 'actions'];

    constructor(private licensesService: LicensesService, private router: Router) { }
    ngOnInit(): void { this.licensesService.getAll().subscribe(l => { this.licenses = l; this.filtered = l; this.loading.set(false); }); }

    applyFilter(): void {
        this.filtered = this.licenses.filter(l =>
            (!this.searchTerm || `${l.playerName} ${l.clubName} ${l.licenseNumber}`.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
            (!this.selectedStatus || l.status === this.selectedStatus)
        );
    }

    getCount(status: string): number { return this.licenses.filter(l => l.status === status).length; }

    approve(id: string): void { this.licensesService.approve(id).subscribe(() => this.ngOnInit()); }
    reject(id: string): void { this.licensesService.reject(id, 'Refus administratif').subscribe(() => this.ngOnInit()); }

    goToNewLicense(): void {
        this.router.navigate(['/app/licenses/new']);
    }

    emptyAction(): void { }
}
