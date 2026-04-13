import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    Club,
    ClubApiResponse,
    ClubMember,
    ClubMemberApiResponse,
    ClubWritePayload,
} from '../../../core/models/club.model';
import { TerrainDTO } from './terrain.dto';

@Injectable({ providedIn: 'root' })
export class ClubsService {
    private readonly base = '/api/clubs';

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<Club[]> {
        return this.http.get<ClubApiResponse[]>(this.base).pipe(
            map((rows) => rows.map((r) => this.mapClub(r))),
            catchError(() => of([]))
        );
    }

    /** Clubs dont l'utilisateur courant est membre (club_members), pour affichage profil. */
    getMyMemberClubs(): Observable<Club[]> {
        return this.http.get<ClubApiResponse[]>(`${this.base}/my-memberships`).pipe(
            map((rows) => rows.map((r) => this.mapClub(r))),
            catchError(() => of([]))
        );
    }

    getById(id: string): Observable<Club | undefined> {
        return this.http.get<ClubApiResponse>(`${this.base}/${encodeURIComponent(id)}`).pipe(
            map((r) => this.mapClub(r)),
            catchError(() => of(undefined))
        );
    }

    create(data: ClubWritePayload): Observable<Club> {
        return this.http
            .post<ClubApiResponse>(this.base, data)
            .pipe(map((r) => this.mapClub(r)));
    }

    update(id: string, data: ClubWritePayload): Observable<Club> {
        return this.http
            .put<ClubApiResponse>(`${this.base}/${encodeURIComponent(id)}`, data)
            .pipe(map((r) => this.mapClub(r)));
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
    }

    getMembers(clubId: string): Observable<ClubMember[]> {
        return this.http
            .get<ClubMemberApiResponse[]>(`${this.base}/${encodeURIComponent(clubId)}/members`)
            .pipe(
                map((rows) =>
                    rows.map((m) => ({
                        id: String(m.id),
                        playerUserId: m.playerUserId,
                        joinedAt: m.joinedAt ?? undefined,
                    }))
                ),
                catchError(() => of([]))
            );
    }

    addMember(clubId: string, playerUserId: string): Observable<ClubMember> {
        return this.http
            .post<ClubMemberApiResponse>(`${this.base}/${encodeURIComponent(clubId)}/members`, {
                playerUserId,
            })
            .pipe(
                map((m) => ({
                    id: String(m.id),
                    playerUserId: m.playerUserId,
                    joinedAt: m.joinedAt ?? undefined,
                }))
            );
    }

    removeMember(clubId: string, playerUserId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.base}/${encodeURIComponent(clubId)}/members/${encodeURIComponent(playerUserId)}`
        );
    }

    getTerrainsDisponibles(clubId: string): Observable<TerrainDTO[]> {
        return this.http
            .get<TerrainDTO[]>(
                `${this.base}/${encodeURIComponent(clubId)}/terrains-disponibles`
            )
            .pipe(catchError(() => of([])));
    }

    private mapClub(r: ClubApiResponse): Club {
        return {
            id: String(r.id),
            name: r.name,
            code: r.code,
            logo: r.logo ?? undefined,
            address: r.address ?? '',
            city: r.city ?? '',
            region: r.region ?? '',
            phone: r.phone ?? '',
            email: r.email ?? '',
            website: r.website ?? undefined,
            foundedYear: r.foundedYear,
            status: r.status,
            managerUserId: r.managerUserId ?? undefined,
            membersCount: r.membersCount ?? 0,
            createdAt: r.createdAt ?? undefined,
            updatedAt: r.updatedAt ?? undefined,
        };
    }
}
