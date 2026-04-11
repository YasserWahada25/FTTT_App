import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Venue, Reservation } from '../../../core/models/venue.model';

const MOCK_VENUES: Venue[] = [
    { id: 'v1', name: 'Salle Principale STTT', clubId: 'c1', clubName: 'Stade Tunisien TT', type: 'indoor', surface: 'Bois', capacity: 200, tables: 8, address: '5 Rue Bourguiba', city: 'Tunis', status: 'available', amenities: ['WiFi', 'Parking', 'Vestiaires', 'Café'], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 'v2', name: 'Salle B CAST', clubId: 'c2', clubName: 'CA Sportif TT', type: 'indoor', surface: 'Vinyle', capacity: 100, tables: 4, address: '12 Avenue de la Liberté', city: 'Sfax', status: 'available', amenities: ['Parking', 'Vestiaires'], createdAt: '2024-02-01', updatedAt: '2024-02-01' },
    { id: 'v3', name: 'Terrain Extérieur CSTT', clubId: 'c3', clubName: 'Club Sfax TT', type: 'outdoor', surface: 'Béton', capacity: 50, tables: 2, address: '8 Boulevard de l\'Indépendance', city: 'Sfax', status: 'maintenance', amenities: [], createdAt: '2024-03-01', updatedAt: '2024-03-01' },
];

const MOCK_RESERVATIONS: Reservation[] = [
    { id: 'res1', venueId: 'v1', venueName: 'Salle Principale STTT', title: 'Entraînement Senior', type: 'training', startDate: '2025-03-12', endDate: '2025-03-12', startTime: '18:00', endTime: '21:00', requestedById: '4', requestedByName: 'Khalil Hamdi', status: 'approved' },
    { id: 'res2', venueId: 'v1', venueName: 'Salle Principale STTT', title: 'Match Championnat', type: 'match', startDate: '2025-03-15', endDate: '2025-03-15', startTime: '14:00', endTime: '18:00', requestedById: '2', requestedByName: 'Sami Karoui', status: 'pending' },
];

@Injectable({ providedIn: 'root' })
export class VenuesService {
    getAll(): Observable<Venue[]> { return of(MOCK_VENUES).pipe(delay(300)); }
    getById(id: string): Observable<Venue | undefined> { return of(MOCK_VENUES.find(v => v.id === id)).pipe(delay(200)); }
    getByClub(clubId: string): Observable<Venue[]> { return of(MOCK_VENUES.filter(v => v.clubId === clubId)).pipe(delay(200)); }
    create(data: Partial<Venue>): Observable<Venue> {
        const v = { ...data as Venue, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        MOCK_VENUES.push(v); return of(v).pipe(delay(400));
    }
    getReservations(venueId: string): Observable<Reservation[]> { return of(MOCK_RESERVATIONS.filter(r => r.venueId === venueId)).pipe(delay(200)); }
    createReservation(data: Partial<Reservation>): Observable<Reservation> {
        const r = { ...data as Reservation, id: Date.now().toString() };
        MOCK_RESERVATIONS.push(r); return of(r).pipe(delay(400));
    }
}
