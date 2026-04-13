import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, delay, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    Competition,
    CompetitionApiResponse,
    CompetitionRegistration,
    CompetitionWritePayload,
} from '../../../core/models/competition.model';

const MOCK_REGISTRATIONS: CompetitionRegistration[] = [
    {
        id: 'reg1',
        competitionId: '1',
        playerId: '3',
        playerName: 'Ines Trabelsi',
        clubId: 'c1',
        clubName: 'Stade Tunisien TT',
        registrationDate: '2025-02-15',
        status: 'accepted',
    },
    {
        id: 'reg2',
        competitionId: '1',
        playerId: '6',
        playerName: 'Rania Saad',
        clubId: 'c2',
        clubName: 'CA Sportif TT',
        registrationDate: '2025-02-16',
        status: 'pending',
    },
];

@Injectable({ providedIn: 'root' })
export class CompetitionsService {
    private readonly base = '/api/competitions';

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<Competition[]> {
        return this.http.get<CompetitionApiResponse[]>(this.base).pipe(
            map((rows) => rows.map((r) => this.mapApiToCompetition(r))),
            catchError(() => of([]))
        );
    }

    getById(id: string): Observable<Competition | undefined> {
        return this.http.get<CompetitionApiResponse>(`${this.base}/${encodeURIComponent(id)}`).pipe(
            map((r) => this.mapApiToCompetition(r)),
            catchError(() => of(undefined))
        );
    }

    create(data: CompetitionWritePayload): Observable<Competition> {
        return this.http
            .post<CompetitionApiResponse>(this.base, data)
            .pipe(map((r) => this.mapApiToCompetition(r)));
    }

    update(id: string, data: CompetitionWritePayload): Observable<Competition> {
        return this.http
            .put<CompetitionApiResponse>(`${this.base}/${encodeURIComponent(id)}`, data)
            .pipe(map((r) => this.mapApiToCompetition(r)));
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
    }

    publish(id: string): Observable<Competition> {
        return this.http
            .post<CompetitionApiResponse>(`${this.base}/${encodeURIComponent(id)}/publish`, {})
            .pipe(map((r) => this.mapApiToCompetition(r)));
    }

    unpublish(id: string): Observable<Competition> {
        return this.http
            .post<CompetitionApiResponse>(`${this.base}/${encodeURIComponent(id)}/unpublish`, {})
            .pipe(map((r) => this.mapApiToCompetition(r)));
    }

    getRegistrations(competitionId: string): Observable<CompetitionRegistration[]> {
        return of(MOCK_REGISTRATIONS.filter((r) => r.competitionId === competitionId)).pipe(delay(200));
    }

    register(competitionId: string, playerId: string): Observable<CompetitionRegistration> {
        const reg: CompetitionRegistration = {
            id: Date.now().toString(),
            competitionId,
            playerId,
            playerName: 'Player',
            clubId: 'c1',
            clubName: 'Club',
            registrationDate: new Date().toISOString(),
            status: 'pending',
        };
        MOCK_REGISTRATIONS.push(reg);
        return of(reg).pipe(delay(400));
    }

    private mapApiToCompetition(r: CompetitionApiResponse): Competition {
        const categoryApi = r.category;
        const type = this.categoryToUiType(categoryApi);
        const sportLabel = (r.sportCategoryLabel || '').trim();
        const categoryDisplay = sportLabel || this.categoryApiLabel(categoryApi);
        const published = !!r.published;
        const apiStatus = r.status;
        const status = this.deriveUiStatus(published, apiStatus);
        const maxP = r.maxParticipants ?? 0;
        const curP = r.currentParticipants ?? 0;

        return {
            id: String(r.id),
            name: r.name,
            type,
            category: categoryDisplay,
            categoryApi,
            status,
            apiStatus,
            published,
            targetRoles: r.targetRoles ?? [],
            startDate: r.startDate ?? '',
            endDate: r.endDate ?? '',
            registrationDeadline: r.registrationDeadline ?? '',
            location: r.location ?? '',
            maxParticipants: maxP,
            currentParticipants: curP,
            description: r.description ?? undefined,
            rules: r.rules ?? undefined,
            organizerName: r.organizerName ?? '',
            prize: r.prize ?? undefined,
            createdAt: r.createdAt ?? undefined,
        };
    }

    private deriveUiStatus(published: boolean, api: CompetitionApiResponse['status']): Competition['status'] {
        if (!published) {
            return 'draft';
        }
        if (api === 'ONGOING') {
            return 'ongoing';
        }
        if (api === 'FINISHED') {
            return 'finished';
        }
        return 'open';
    }

    private categoryToUiType(c: CompetitionApiResponse['category']): Competition['type'] {
        switch (c) {
            case 'CHAMPIONNAT':
                return 'championship';
            case 'COUPE':
                return 'cup';
            case 'AMICAL':
                return 'friendly';
            case 'TOURNOI':
            default:
                return 'league';
        }
    }

    private categoryApiLabel(c: CompetitionApiResponse['category']): string {
        const labels: Record<CompetitionApiResponse['category'], string> = {
            CHAMPIONNAT: 'Championnat',
            COUPE: 'Coupe',
            AMICAL: 'Amical',
            TOURNOI: 'Tournoi / Ligue',
        };
        return labels[c] ?? c;
    }

    /** Pour le formulaire : valeur UI → enum API. */
    static uiFormatToCategory(
        type: 'championship' | 'cup' | 'friendly' | 'league'
    ): CompetitionApiResponse['category'] {
        switch (type) {
            case 'championship':
                return 'CHAMPIONNAT';
            case 'cup':
                return 'COUPE';
            case 'friendly':
                return 'AMICAL';
            case 'league':
            default:
                return 'TOURNOI';
        }
    }
}
