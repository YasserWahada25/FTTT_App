import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Competition, CompetitionRegistration } from '../../../core/models/competition.model';

const MOCK_COMPETITIONS: Competition[] = [
    { id: 'comp1', name: 'Championnat National 2025', type: 'championship', category: 'Senior Hommes', status: 'open', startDate: '2025-03-20', endDate: '2025-05-30', registrationDeadline: '2025-03-15', location: 'Tunis', venueName: 'Palais des Sports', maxParticipants: 64, currentParticipants: 48, organizerId: '1', organizerName: 'FTTT Admin', prize: '5000 DT', createdAt: '2024-12-01', updatedAt: '2025-01-01' },
    { id: 'comp2', name: 'Coupe de Tunisie 2025', type: 'cup', category: 'Toutes catégories', status: 'open', startDate: '2025-04-05', endDate: '2025-04-20', registrationDeadline: '2025-03-30', location: 'Sfax', venueName: 'Salle Sportive Sfax', maxParticipants: 32, currentParticipants: 28, organizerId: '1', organizerName: 'FTTT Admin', prize: '3000 DT', createdAt: '2024-12-15', updatedAt: '2025-01-05' },
    { id: 'comp3', name: 'Championnat des Jeunes', type: 'championship', category: 'Juniors', status: 'draft', startDate: '2025-04-15', endDate: '2025-04-22', registrationDeadline: '2025-04-10', location: 'Sousse', maxParticipants: 40, currentParticipants: 12, organizerId: '1', organizerName: 'FTTT Admin', createdAt: '2025-01-01', updatedAt: '2025-01-10' },
    { id: 'comp4', name: 'Ligue Régionale Tunis', type: 'league', category: 'Senior Dames', status: 'ongoing', startDate: '2025-01-15', endDate: '2025-04-30', registrationDeadline: '2025-01-10', location: 'Tunis', maxParticipants: 16, currentParticipants: 16, organizerId: '1', organizerName: 'FTTT Admin', createdAt: '2024-11-01', updatedAt: '2025-01-15' },
];

const MOCK_REGISTRATIONS: CompetitionRegistration[] = [
    { id: 'reg1', competitionId: 'comp1', playerId: '3', playerName: 'Ines Trabelsi', clubId: 'c1', clubName: 'Stade Tunisien TT', registrationDate: '2025-02-15', status: 'accepted' },
    { id: 'reg2', competitionId: 'comp1', playerId: '6', playerName: 'Rania Saad', clubId: 'c2', clubName: 'CA Sportif TT', registrationDate: '2025-02-16', status: 'pending' },
];

@Injectable({ providedIn: 'root' })
export class CompetitionsService {
    getAll(): Observable<Competition[]> { return of(MOCK_COMPETITIONS).pipe(delay(300)); }
    getById(id: string): Observable<Competition | undefined> { return of(MOCK_COMPETITIONS.find(c => c.id === id)).pipe(delay(200)); }
    create(data: Partial<Competition>): Observable<Competition> {
        const c = { ...data as Competition, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        MOCK_COMPETITIONS.push(c); return of(c).pipe(delay(400));
    }
    getRegistrations(competitionId: string): Observable<CompetitionRegistration[]> {
        return of(MOCK_REGISTRATIONS.filter(r => r.competitionId === competitionId)).pipe(delay(200));
    }
    register(competitionId: string, playerId: string): Observable<CompetitionRegistration> {
        const reg: CompetitionRegistration = { id: Date.now().toString(), competitionId, playerId, playerName: 'Player', clubId: 'c1', clubName: 'Club', registrationDate: new Date().toISOString(), status: 'pending' };
        MOCK_REGISTRATIONS.push(reg); return of(reg).pipe(delay(400));
    }
}
