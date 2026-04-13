import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { Profile } from '../../../core/models/profile.model';

interface ProfileApiResponse {
  id: number;
  userId: string;
  name?: string;
  email?: string;
  clubId?: number;
  phone?: string;
  category?: string;
  bio?: string;
  skills?: string[];
  achievements?: string[];
  publicProfile?: boolean;
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    ranking?: number;
    points?: number;
    wins?: number;
    losses?: number;
    matchesPlayed?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /** Liste des profils (annuaire) — utilisé notamment pour lier joueurs et clubs aux licences. */
  getAll(): Observable<Profile[]> {
    return this.http.get<ProfileApiResponse[]>(`/api/profiles`).pipe(
      map((rows) => rows.map((p) => this.mapProfile(p))),
      catchError(() => of([]))
    );
  }

  getById(id: string): Observable<Profile | undefined> {
    return this.http
      .get<ProfileApiResponse>(`/api/profiles/user/${id}`)
      .pipe(
        map((profile) => this.mapProfile(profile)),
        catchError(() => of(undefined))
      );
  }

  getMyProfile(): Observable<Profile | undefined> {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      return of(undefined);
    }

    return this.getById(currentUser.id);
  }

  update(id: string, data: Partial<Profile>): Observable<Profile> {
    return this.http
      .put<ProfileApiResponse>(`/api/profiles/user/${id}`, {
        bio: data.bio,
        skills: data.skills ?? [],
        achievements: data.achievements ?? [],
        stats: data.stats ?? {},
      })
      .pipe(map((profile) => this.mapProfile(profile)));
  }

  updateVisibility(userId: string, publicProfile: boolean): Observable<Profile> {
    return this.http
      .patch<ProfileApiResponse>(`/api/profiles/user/${userId}/visibility`, { publicProfile })
      .pipe(map((profile) => this.mapProfile(profile)));
  }

  private mapProfile(profile: ProfileApiResponse): Profile {
    return {
      id: String(profile.id),
      userId: profile.userId,
      name: profile.name,
      email: profile.email,
      clubId: profile.clubId,
      phone: profile.phone,
      category: profile.category,
      bio: profile.bio,
      skills: profile.skills ?? [],
      achievements: profile.achievements ?? [],
      publicProfile: profile.publicProfile,
      stats: {
        ranking: profile.stats?.ranking,
        points: profile.stats?.points,
        wins: profile.stats?.wins,
        losses: profile.stats?.losses,
        matchesPlayed: profile.stats?.matchesPlayed,
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
