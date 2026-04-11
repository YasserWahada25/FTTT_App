import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserRole } from '../../../core/models/user.model';

const MOCK_USERS: User[] = [
    { id: '1', firstName: 'Ahmed', lastName: 'Ben Ali', email: 'admin@fttt.tn', role: 'ADMIN_FEDERATION', status: 'active', createdAt: '2024-01-10', updatedAt: '2024-01-10' },
    { id: '2', firstName: 'Sami', lastName: 'Karoui', email: 'manager@club.tn', role: 'CLUB_MANAGER', status: 'active', clubId: 'c1', clubName: 'Stade Tunisien TT', createdAt: '2024-02-15', updatedAt: '2024-02-15' },
    { id: '3', firstName: 'Ines', lastName: 'Trabelsi', email: 'player@fttt.tn', role: 'PLAYER', status: 'active', clubId: 'c1', clubName: 'Stade Tunisien TT', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
    { id: '4', firstName: 'Khalil', lastName: 'Hamdi', email: 'coach@fttt.tn', role: 'COACH', status: 'active', clubId: 'c1', clubName: 'Stade Tunisien TT', createdAt: '2024-03-05', updatedAt: '2024-03-05' },
    { id: '5', firstName: 'Mourad', lastName: 'Jebali', email: 'referee@fttt.tn', role: 'REFEREE', status: 'active', createdAt: '2024-01-20', updatedAt: '2024-01-20' },
    { id: '6', firstName: 'Sonia', lastName: 'Saad', email: 'sonia@clubs.tn', role: 'PLAYER', status: 'active', clubId: 'c2', clubName: 'CA Sportif TT', createdAt: '2024-04-10', updatedAt: '2024-04-10' },
    { id: '7', firstName: 'Tarek', lastName: 'Mansouri', email: 'tarek@clubs.tn', role: 'CLUB_MANAGER', status: 'inactive', clubId: 'c2', clubName: 'CA Sportif TT', createdAt: '2024-02-20', updatedAt: '2024-02-20' },
    { id: '8', firstName: 'Nour', lastName: 'Bahrini', email: 'nour@clubs.tn', role: 'COACH', status: 'suspended', clubId: 'c3', clubName: 'Club Sfax TT', createdAt: '2024-01-25', updatedAt: '2024-01-25' },
];

@Injectable({ providedIn: 'root' })
export class UsersService {
    private BASE_URL = '/api/users'; // For future REST integration

    getAll(): Observable<User[]> {
        return of(MOCK_USERS).pipe(delay(300));
    }

    getById(id: string): Observable<User | undefined> {
        return of(MOCK_USERS.find(u => u.id === id)).pipe(delay(200));
    }

    create(data: Partial<User>): Observable<User> {
        const newUser: User = {
            ...data as User,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        MOCK_USERS.push(newUser);
        return of(newUser).pipe(delay(400));
    }

    update(id: string, data: Partial<User>): Observable<User> {
        const idx = MOCK_USERS.findIndex(u => u.id === id);
        if (idx >= 0) MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data, updatedAt: new Date().toISOString() };
        return of(MOCK_USERS[idx]).pipe(delay(400));
    }

    delete(id: string): Observable<void> {
        const idx = MOCK_USERS.findIndex(u => u.id === id);
        if (idx >= 0) MOCK_USERS.splice(idx, 1);
        return of(undefined).pipe(delay(300));
    }
}
