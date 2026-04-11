import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Profile } from '../../../core/models/profile.model';

const MOCK_PROFILES: Profile[] = [
    { id: '1', userId: '1', bio: 'Administrateur de la FTTT. Passionné de Tennis de Table depuis 20 ans.', skills: ['Management', 'Organisation', 'Arbitrage'], achievements: ['Organisation Championnat 2024'], stats: { ranking: 0, matchesPlayed: 0, wins: 0, losses: 0 } },
    { id: '4', userId: '4', bio: 'Joueur professionnel au Stade Tunisien. Triple champion national.', skills: ['Top spin', 'Service court', 'Vitesse'], achievements: ['Vainqueur Coupe de Tunisie 2023', 'Médaillé Or Jeux Arabes'], stats: { ranking: 2450, matchesPlayed: 50, wins: 42, losses: 8 } },
    { id: '8', userId: '8', bio: 'Jeune espoir du Club Sfax TT.', skills: ['Régularité', 'Revers'], achievements: ['Champion Regional Junior 2024'], stats: { ranking: 2210, matchesPlayed: 50, wins: 38, losses: 12 } },
];

@Injectable({ providedIn: 'root' })
export class ProfilesService {
    getById(id: string): Observable<Profile | undefined> {
        return of(MOCK_PROFILES.find(p => p.id === id || p.userId === id)).pipe(delay(200));
    }
    getMyProfile(): Observable<Profile | undefined> {
        return of(MOCK_PROFILES[0]).pipe(delay(200)); // Mock auth user profile
    }
    update(id: string, data: Partial<Profile>): Observable<Profile> {
        const idx = MOCK_PROFILES.findIndex(p => p.id === id);
        if (idx >= 0) MOCK_PROFILES[idx] = { ...MOCK_PROFILES[idx], ...data };
        return of(MOCK_PROFILES[idx]).pipe(delay(400));
    }
}
