import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { User, UserRole, LoginRequest, LoginResponse } from '../models/user.model';

const MOCK_USERS: { [email: string]: { password: string; user: User; token: string } } = {
    'admin@fttt.tn': {
        password: 'admin123',
        token: 'mock-token-admin',
        user: {
            id: '1',
            firstName: 'Ahmed',
            lastName: 'Ben Ali',
            email: 'admin@fttt.tn',
            role: 'ADMIN_FEDERATION',
            status: 'active',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
    },
    'manager@club.tn': {
        password: 'manager123',
        token: 'mock-token-manager',
        user: {
            id: '2',
            firstName: 'Sami',
            lastName: 'Karoui',
            email: 'manager@club.tn',
            role: 'CLUB_MANAGER',
            status: 'active',
            clubId: 'c1',
            clubName: 'Stade Tunisien TT',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
    },
    'player@fttt.tn': {
        password: 'player123',
        token: 'mock-token-player',
        user: {
            id: '3',
            firstName: 'Ines',
            lastName: 'Trabelsi',
            email: 'player@fttt.tn',
            role: 'PLAYER',
            status: 'active',
            clubId: 'c1',
            clubName: 'Stade Tunisien TT',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
    },
    'coach@fttt.tn': {
        password: 'coach123',
        token: 'mock-token-coach',
        user: {
            id: '4',
            firstName: 'Khalil',
            lastName: 'Hamdi',
            email: 'coach@fttt.tn',
            role: 'COACH',
            status: 'active',
            clubId: 'c1',
            clubName: 'Stade Tunisien TT',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
    },
    'referee@fttt.tn': {
        password: 'referee123',
        token: 'mock-token-referee',
        user: {
            id: '5',
            firstName: 'Mourad',
            lastName: 'Jebali',
            email: 'referee@fttt.tn',
            role: 'REFEREE',
            status: 'active',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
    },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'fttt_token';
    private readonly USER_KEY = 'fttt_user';

    private _currentUser = new BehaviorSubject<User | null>(null);
    currentUser$ = this._currentUser.asObservable();

    constructor(
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem(this.TOKEN_KEY);
            const userStr = localStorage.getItem(this.USER_KEY);
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr) as User;
                    this._currentUser.next(user);
                } catch {
                    this.clearStorage();
                }
            }
        }
    }

    get currentUser(): User | null {
        return this._currentUser.value;
    }

    get token(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(this.TOKEN_KEY);
        }
        return null;
    }

    get isAuthenticated(): boolean {
        return !!this._currentUser.value && !!this.token;
    }

    hasRole(role: UserRole | UserRole[]): boolean {
        const user = this.currentUser;
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    }

    login(request: LoginRequest): Observable<LoginResponse> {
        const mockEntry = MOCK_USERS[request.email];
        if (mockEntry && mockEntry.password === request.password) {
            const response: LoginResponse = {
                token: mockEntry.token,
                refreshToken: mockEntry.token + '-refresh',
                user: mockEntry.user,
                expiresIn: 3600,
            };
            return of(response).pipe(
                delay(800),
                tap((res) => {
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem(this.TOKEN_KEY, res.token);
                        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
                    }
                    this._currentUser.next(res.user);
                })
            );
        }
        return throwError(() => new Error('Email ou mot de passe incorrect')).pipe(delay(800));
    }

    logout(): void {
        this.clearStorage();
        this._currentUser.next(null);
        this.router.navigate(['/auth/login']);
    }

    private clearStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        }
    }
}
