import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { User } from '../../../core/models/user.model';
import {
  AdminCreateUserRequest,
  AdminUserApiResponse,
  PendingUserRequest,
  PendingUserRequestApiResponse,
  mapAdminUserResponse,
  mapPendingUserRequestResponse,
} from '../models/admin-user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  getAll(status: 'all' | 'active' | 'inactive' = 'all'): Observable<User[]> {
    const params = new HttpParams().set('status', status);
    return this.http
      .get<AdminUserApiResponse[]>('/api/auth/users', { params })
      .pipe(map((users) => users.map(mapAdminUserResponse)));
  }

  getById(id: string): Observable<User | undefined> {
    return this.getAll('all').pipe(map((users) => users.find((user) => user.id === id)));
  }

  getPendingRequests(): Observable<PendingUserRequest[]> {
    return this.http
      .get<PendingUserRequestApiResponse[]>('/api/auth/requests/pending')
      .pipe(map((requests) => requests.map(mapPendingUserRequestResponse)));
  }

  approveRequest(id: number): Observable<string> {
    return this.http.put(`/api/auth/requests/${id}/approve`, {}, { responseType: 'text' });
  }

  rejectRequest(id: number): Observable<string> {
    return this.http.put(`/api/auth/requests/${id}/reject`, {}, { responseType: 'text' });
  }

  create(data: AdminCreateUserRequest): Observable<User> {
    return this.http
      .post<AdminUserApiResponse>('/api/auth/users', data)
      .pipe(map(mapAdminUserResponse));
  }

  update(): Observable<never> {
    return throwError(() => new Error('La mise a jour d utilisateur n est pas encore disponible.'));
  }

  delete(): Observable<never> {
    return throwError(() => new Error('La suppression d utilisateur n est pas encore disponible.'));
  }
}
