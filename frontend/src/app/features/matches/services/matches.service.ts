import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Match, Ranking } from '../../../core/models/match.model';

const MOCK_MATCHES: Match[] = [
    { id: 'm1', competitionId: 'comp1', competitionName: 'Championnat National 2025', round: 'Phase de groupes', homePlayerId: '4', homePlayerName: 'Khalil Hamdi', awayPlayerId: '8', awayPlayerName: 'Nour Bahrini', homeClubId: 'c1', homeClubName: 'Stade Tunisien TT', awayClubId: 'c3', awayClubName: 'Club Sfax TT', scheduledDate: '2025-03-10', status: 'finished', homeScore: 3, awayScore: 1, refereeId: '5', refereeName: 'Mourad Jebali' },
    { id: 'm2', competitionId: 'comp1', competitionName: 'Championnat National 2025', round: 'Phase de groupes', homePlayerId: '3', homePlayerName: 'Ines Trabelsi', awayPlayerId: '6', awayPlayerName: 'Rania Saad', homeClubId: 'c1', homeClubName: 'Stade Tunisien TT', awayClubId: 'c2', awayClubName: 'CA Sportif TT', scheduledDate: '2025-03-12', status: 'scheduled', refereeId: '5', refereeName: 'Mourad Jebali' },
    { id: 'm3', competitionId: 'comp2', competitionName: 'Coupe de Tunisie', round: 'Quarts de finale', homePlayerId: '4', homePlayerName: 'Khalil Hamdi', awayPlayerId: '6', awayPlayerName: 'Rania Saad', homeClubId: 'c1', homeClubName: 'Stade Tunisien TT', awayClubId: 'c2', awayClubName: 'CA Sportif TT', scheduledDate: '2025-04-07', status: 'scheduled' },
];

const MOCK_RANKINGS: Ranking[] = [
    { id: 'r1', playerId: '4', playerName: 'Khalil Hamdi', clubId: 'c1', clubName: 'Stade Tunisien TT', category: 'Senior Hommes', position: 1, points: 2450, wins: 42, losses: 8, matchesPlayed: 50, season: '2024-2025', updatedAt: '2025-03-01' },
    { id: 'r2', playerId: '8', playerName: 'Nour Bahrini', clubId: 'c3', clubName: 'Club Sfax TT', category: 'Senior Hommes', position: 2, points: 2210, wins: 38, losses: 12, matchesPlayed: 50, season: '2024-2025', updatedAt: '2025-03-01' },
    { id: 'r3', playerId: '3', playerName: 'Ines Trabelsi', clubId: 'c1', clubName: 'Stade Tunisien TT', category: 'Senior Dames', position: 1, points: 2180, wins: 35, losses: 5, matchesPlayed: 40, season: '2024-2025', updatedAt: '2025-03-01' },
    { id: 'r4', playerId: '6', playerName: 'Rania Saad', clubId: 'c2', clubName: 'CA Sportif TT', category: 'Senior Dames', position: 2, points: 1950, wins: 28, losses: 12, matchesPlayed: 40, season: '2024-2025', updatedAt: '2025-03-01' },
];

@Injectable({ providedIn: 'root' })
export class MatchesService {
    getAll(): Observable<Match[]> { return of(MOCK_MATCHES).pipe(delay(300)); }
    getById(id: string): Observable<Match | undefined> { return of(MOCK_MATCHES.find(m => m.id === id)).pipe(delay(200)); }
    submitResult(id: string, homeScore: number, awayScore: number): Observable<Match> {
        const idx = MOCK_MATCHES.findIndex(m => m.id === id);
        if (idx >= 0) MOCK_MATCHES[idx] = { ...MOCK_MATCHES[idx], homeScore, awayScore, status: 'finished' };
        return of(MOCK_MATCHES[idx]).pipe(delay(400));
    }
}

@Injectable({ providedIn: 'root' })
export class RankingsService {
    getAll(): Observable<Ranking[]> { return of(MOCK_RANKINGS).pipe(delay(300)); }
    getByCategory(category: string): Observable<Ranking[]> { return of(MOCK_RANKINGS.filter(r => r.category === category)).pipe(delay(200)); }
}
