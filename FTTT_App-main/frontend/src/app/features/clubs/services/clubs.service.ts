import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Club } from '../../../core/models/club.model';

const MOCK_CLUBS: Club[] = [
    { id: 'c1', name: 'Esperance Sprotive TT', code: 'STTT', address: '5 Rue Bourguiba', city: 'Tunis', region: 'Grand Tunis', phone: '+216 71 111 222', email: 'sttt@clubs.tn', foundedYear: 1985, status: 'active', managerId: '2', managerName: 'Maher Kanzari', membersCount: 42, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'c2', name: 'Gouafel Gafsa TT', code: 'CAST', address: '12 Avenue de la Liberté', city: 'Gafsa', region: 'Gafsa', phone: '+216 74 222 333', email: 'cast@clubs.tn', foundedYear: 1990, status: 'active', managerId: '7', managerName: 'Mohamed Mhamdi', membersCount: 28, createdAt: '2024-02-01', updatedAt: '2024-02-01' },
    { id: 'c3', name: 'Club Sfax TT', code: 'CSTT', address: '8 Boulevard de l\'Indépendance', city: 'Sfax', region: 'Sfax', phone: '+216 74 333 444', email: 'cstt@clubs.tn', foundedYear: 2001, status: 'active', managerId: '8', managerName: 'Nour Bahrini', membersCount: 35, createdAt: '2024-03-01', updatedAt: '2024-03-01' },
    { id: 'c4', name: 'ES Sousse TT', code: 'ESST', address: '3 Rue Farhat Hached', city: 'Sousse', region: 'Sahel', phone: '+216 73 444 555', email: 'esst@clubs.tn', foundedYear: 1978, status: 'active', managerId: '4', managerName: 'Khalil Hamdi', membersCount: 55, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 'c5', name: 'Club Bizerte TT', code: 'CBTT', address: '1 Avenue de la République', city: 'Bizerte', region: 'Nord', phone: '+216 72 555 666', email: 'cbtt@clubs.tn', foundedYear: 1995, status: 'inactive', managerId: '3', managerName: 'Ines Trabelsi', membersCount: 18, createdAt: '2024-04-01', updatedAt: '2024-04-01' },
];

@Injectable({ providedIn: 'root' })
export class ClubsService {
    getAll(): Observable<Club[]> { return of(MOCK_CLUBS).pipe(delay(300)); }
    getById(id: string): Observable<Club | undefined> { return of(MOCK_CLUBS.find(c => c.id === id)).pipe(delay(200)); }
    create(data: Partial<Club>): Observable<Club> {
        const c = { ...data as Club, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        MOCK_CLUBS.push(c); return of(c).pipe(delay(400));
    }
    update(id: string, data: Partial<Club>): Observable<Club> {
        const idx = MOCK_CLUBS.findIndex(c => c.id === id);
        if (idx >= 0) MOCK_CLUBS[idx] = { ...MOCK_CLUBS[idx], ...data };
        return of(MOCK_CLUBS[idx]).pipe(delay(400));
    }
    delete(id: string): Observable<void> {
        const idx = MOCK_CLUBS.findIndex(c => c.id === id);
        if (idx >= 0) MOCK_CLUBS.splice(idx, 1);
        return of(undefined).pipe(delay(300));
    }
}
