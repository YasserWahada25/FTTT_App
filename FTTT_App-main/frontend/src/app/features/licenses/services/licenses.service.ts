import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { License } from '../../../core/models/license.model';

const MOCK_LICENSES: License[] = [
    { id: 'l1', licenseNumber: 'FTTT-2025-00001', playerId: '3', playerName: 'Monica', clubId: 'c1', clubName: 'Stade Tunisien TT', season: '2024-2025', category: 'Senior Dames', status: 'active', requestDate: '2024-09-01', approvalDate: '2024-09-10', expiryDate: '2025-08-31', amount: 150, paymentStatus: 'paid' },
    { id: 'l2', licenseNumber: 'FTTT-2025-00002', playerId: '6', playerName: 'Bella', clubId: 'c2', clubName: 'CA Sportif TT', season: '2024-2025', category: 'Senior Dames', status: 'pending', requestDate: '2024-10-15', expiryDate: '2025-08-31', amount: 150, paymentStatus: 'pending' },
    { id: 'l3', licenseNumber: 'FTTT-2025-00003', playerId: '4', playerName: 'Patrice', clubId: 'c1', clubName: 'Stade Tunisien TT', season: '2024-2025', category: 'Senior Hommes', status: 'active', requestDate: '2024-09-05', approvalDate: '2024-09-12', expiryDate: '2025-08-31', amount: 150, paymentStatus: 'paid' },
    { id: 'l4', licenseNumber: 'FTTT-2024-00010', playerId: '3', playerName: 'Sofia', clubId: 'c1', clubName: 'Stade Tunisien TT', season: '2023-2024', category: 'Senior Dames', status: 'expired', requestDate: '2023-10-01', approvalDate: '2023-10-08', expiryDate: '2024-08-31', amount: 120, paymentStatus: 'paid' },
    { id: 'l5', licenseNumber: 'FTTT-2025-00004', playerId: '8', playerName: 'Karim', clubId: 'c3', clubName: 'Club Sfax TT', season: '2024-2025', category: 'Senior Hommes', status: 'rejected', requestDate: '2024-11-01', expiryDate: '2025-08-31', amount: 150, paymentStatus: 'pending', notes: 'Documents incomplets' },
];

@Injectable({ providedIn: 'root' })
export class LicensesService {
    getAll(): Observable<License[]> { return of(MOCK_LICENSES).pipe(delay(300)); }
    getMyLicenses(playerId: string): Observable<License[]> { return of(MOCK_LICENSES.filter(l => l.playerId === playerId)).pipe(delay(300)); }
    getById(id: string): Observable<License | undefined> { return of(MOCK_LICENSES.find(l => l.id === id)).pipe(delay(200)); }
    create(data: Partial<License>): Observable<License> {
        const l = { ...data as License, id: Date.now().toString(), requestDate: new Date().toISOString() };
        MOCK_LICENSES.push(l); return of(l).pipe(delay(400));
    }
    approve(id: string): Observable<License> {
        const idx = MOCK_LICENSES.findIndex(l => l.id === id);
        if (idx >= 0) MOCK_LICENSES[idx] = { ...MOCK_LICENSES[idx], status: 'approved', approvalDate: new Date().toISOString() };
        return of(MOCK_LICENSES[idx]).pipe(delay(300));
    }
    reject(id: string, notes: string): Observable<License> {
        const idx = MOCK_LICENSES.findIndex(l => l.id === id);
        if (idx >= 0) MOCK_LICENSES[idx] = { ...MOCK_LICENSES[idx], status: 'rejected', notes };
        return of(MOCK_LICENSES[idx]).pipe(delay(300));
    }
}
