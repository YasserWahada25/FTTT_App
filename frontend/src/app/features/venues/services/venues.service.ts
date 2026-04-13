import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Terrain, TerrainApiResponse, TerrainWritePayload } from '../../../core/models/terrain.model';
import { Reservation } from '../../../core/models/venue.model';

const MOCK_RESERVATIONS: Reservation[] = [
    {
        id: 'res1',
        venueId: 'v1',
        venueName: 'Salle Principale STTT',
        title: 'Entraînement Senior',
        type: 'training',
        startDate: '2025-03-12',
        endDate: '2025-03-12',
        startTime: '18:00',
        endTime: '21:00',
        requestedById: '4',
        requestedByName: 'Khalil Hamdi',
        status: 'approved',
    },
];

@Injectable({ providedIn: 'root' })
export class VenuesService {
    private readonly base = '/api/terrains';

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<Terrain[]> {
        return this.http.get<TerrainApiResponse[]>(this.base).pipe(
            map((rows) => rows.map((r) => this.mapTerrain(r))),
            catchError(() => of([]))
        );
    }

    getById(id: string): Observable<Terrain | undefined> {
        return this.http.get<TerrainApiResponse>(`${this.base}/${encodeURIComponent(id)}`).pipe(
            map((r) => this.mapTerrain(r)),
            catchError(() => of(undefined))
        );
    }

    create(data: TerrainWritePayload): Observable<Terrain> {
        return this.http
            .post<TerrainApiResponse>(this.base, this.toApiBody(data))
            .pipe(map((r) => this.mapTerrain(r)));
    }

    update(id: string, data: TerrainWritePayload): Observable<Terrain> {
        return this.http
            .put<TerrainApiResponse>(`${this.base}/${encodeURIComponent(id)}`, this.toApiBody(data))
            .pipe(map((r) => this.mapTerrain(r)));
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
    }

    /** Réservations : maquette locale (hors terrain-service). */
    getReservations(venueId: string): Observable<Reservation[]> {
        return of(MOCK_RESERVATIONS.filter((r) => r.venueId === venueId));
    }

    createReservation(data: Partial<Reservation>): Observable<Reservation> {
        const r = { ...data, id: Date.now().toString() } as Reservation;
        MOCK_RESERVATIONS.push(r);
        return of(r);
    }

    private mapTerrain(r: TerrainApiResponse): Terrain {
        return {
            id: String(r.id),
            nom: r.nom,
            surface: r.surface ?? '',
            localisation: r.localisation ?? '',
            disponible: r.disponible,
            prixParHeure: r.prixParHeure,
            image: r.image ?? undefined,
            clubId: r.clubId != null ? String(r.clubId) : undefined,
            competitionIds: (r.competitionIds ?? []).map(String),
        };
    }

    private toApiBody(data: TerrainWritePayload): Record<string, unknown> {
        return {
            nom: data.nom,
            surface: data.surface || null,
            localisation: data.localisation || null,
            disponible: data.disponible,
            prixParHeure: data.prixParHeure,
            image: data.image || null,
            clubId: data.clubId ?? null,
            competitionIds: (data.competitionIds ?? []).map((x) => Number(x)),
        };
    }
}
