import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import {
  APP_ROLES,
  CurrentUserResponse,
  AuthTransaction,
  KeycloakTokenResponse,
  PlayerRegisterRequest,
  StaffRegisterRequest,
  UpdateMyProfileRequest,
  UserSession,
} from '../models/auth.model';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authTransactionKey = 'fttt_auth_transaction';
  private readonly sessionKey = 'fttt_session';

  private readonly http: HttpClient;
  private readonly sessionSubject = new BehaviorSubject<UserSession | null>(null);
  private refreshRequest$?: Observable<string | null>;

  readonly session$ = this.sessionSubject.asObservable();
  readonly currentUser$ = this.session$.pipe(map((session) => session?.user ?? null));

  constructor(
    httpBackend: HttpBackend,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
    this.http = new HttpClient(httpBackend);
    this.restoreSession();
  }

  get currentSession(): UserSession | null {
    return this.sessionSubject.value;
  }

  get currentUser(): User | null {
    return this.currentSession?.user ?? null;
  }

  get token(): string | null {
    return this.currentSession?.accessToken ?? null;
  }

  get isAuthenticated(): boolean {
    return !!this.currentSession && !this.isAccessTokenExpired();
  }

  get currentRoles(): UserRole[] {
    const roles = this.currentUser?.roles ?? [];
    return roles.length ? roles : this.currentUser?.role ? [this.currentUser.role] : [];
  }

  registerPlayer(request: PlayerRegisterRequest): Observable<string> {
    return this.http
      .post(`${environment.apiBaseUrl}/api/auth/register/player`, request, {
        responseType: 'text',
      })
      .pipe(
        map((message) => message || 'Votre compte joueur a ete cree avec succes.'),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.mapRegistrationError(error)))
        )
      );
  }

  registerStaff(request: StaffRegisterRequest): Observable<string> {
    return this.http
      .post(`${environment.apiBaseUrl}/api/auth/register/staff`, request, {
        responseType: 'text',
      })
      .pipe(
        map(
          (message) =>
            message ||
            'Votre demande de compte a ete creee et reste en attente de validation par l administrateur.'
        ),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.mapRegistrationError(error)))
        )
      );
  }

  updateMyProfile(request: UpdateMyProfileRequest): Observable<User> {
    return this.getValidAccessToken().pipe(
      switchMap((token) => {
        if (!token) {
          return throwError(() => new Error('Votre session a expire. Veuillez vous reconnecter.'));
        }

        return this.http.put<CurrentUserResponse>(`${environment.apiBaseUrl}/api/auth/me`, request, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }),
        });
      }),
      map((response) => {
        const updatedUser: User = {
          id: response.id,
          username: response.username,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          phone: response.phone ?? undefined,
          role: response.role,
          roles: response.roles,
          status: this.currentUser?.status ?? 'active',
          createdAt: this.currentUser?.createdAt ?? '',
          updatedAt: new Date().toISOString(),
          clubId: this.currentUser?.clubId,
          clubName: this.currentUser?.clubName,
          avatar: this.currentUser?.avatar,
        };

        this.updateStoredUser(updatedUser);
        return updatedUser;
      }),
      catchError((error: HttpErrorResponse | Error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            return throwError(
              () => new Error('Impossible de joindre le service de mise a jour du profil.')
            );
          }

          const backendMessage =
            typeof error.error === 'string'
              ? error.error
              : this.readString(error.error?.message) ??
                this.readString(error.error?.error) ??
                error.message;

          return throwError(
            () => new Error(backendMessage || 'La mise a jour du profil a echoue.')
          );
        }

        return throwError(() => error);
      })
    );
  }

  async createLoginUrl(returnUrl?: string | null): Promise<string> {
    if (!this.isBrowser()) {
      throw new Error('La connexion ne peut pas etre preparee depuis cet environnement.');
    }

    const verifier = this.createRandomString(96);
    const state = this.createRandomString(48);
    const nonce = this.createRandomString(48);
    const transaction: AuthTransaction = {
      nonce,
      returnUrl: returnUrl?.startsWith('/') ? returnUrl : null,
      state,
      verifier,
    };

    sessionStorage.setItem(this.authTransactionKey, JSON.stringify(transaction));

    const codeChallenge = await this.createCodeChallenge(verifier);
    const authorizationUrl = this.createAppUrl(this.getKeycloakEndpoint('/protocol/openid-connect/auth'));

    authorizationUrl.searchParams.set('client_id', environment.keycloak.clientId);
    authorizationUrl.searchParams.set('redirect_uri', this.getRedirectUri());
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', environment.keycloak.scopes.join(' '));
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('nonce', nonce);
    authorizationUrl.searchParams.set('code_challenge', codeChallenge);
    authorizationUrl.searchParams.set('code_challenge_method', 'S256');

    return authorizationUrl.toString();
  }

  async beginLogin(returnUrl?: string | null): Promise<void> {
    if (!this.isBrowser()) {
      return;
    }

    const authorizationUrl = await this.createLoginUrl(returnUrl);
    window.location.assign(authorizationUrl);
  }

  /**
   * Connexion avec identifiants via le token endpoint Keycloak (grant type password).
   * Le client Keycloak doit avoir « Direct access grants » activé pour ce flux.
   */
  loginWithPassword(username: string, password: string, returnUrl?: string | null): Observable<string> {
    const body = new HttpParams({
      fromObject: {
        grant_type: 'password',
        client_id: environment.keycloak.clientId,
        username: username.trim(),
        password,
        scope: environment.keycloak.scopes.join(' '),
      },
    });

    return this.http
      .post<KeycloakTokenResponse>(this.getKeycloakEndpoint('/protocol/openid-connect/token'), body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        map((response) => {
          const session = this.buildSession(response, null);
          this.persistSession(session);
          const targetReturn = returnUrl?.startsWith('/') ? returnUrl : null;
          return targetReturn ?? this.getDefaultRouteForRoles(session.user.roles ?? []);
        }),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.mapKeycloakErrorFromHttp(error)))
        )
      );
  }

  handleAuthCallback(params: URLSearchParams): Observable<string> {
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      this.clearAuthTransaction();
      return throwError(() => new Error(this.mapKeycloakError(error, errorDescription)));
    }

    const code = params.get('code');
    const state = params.get('state');
    const transaction = this.getAuthTransaction();

    if (!code || !state || !transaction || state !== transaction.state) {
      this.clearAuthTransaction();
      return throwError(
        () => new Error('La reponse de connexion est invalide. Veuillez relancer la connexion.')
      );
    }

    const body = new HttpParams({
      fromObject: {
        grant_type: 'authorization_code',
        client_id: environment.keycloak.clientId,
        code,
        redirect_uri: this.getRedirectUri(),
        code_verifier: transaction.verifier,
      },
    });

    return this.http
      .post<KeycloakTokenResponse>(this.getKeycloakEndpoint('/protocol/openid-connect/token'), body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        map((response) => this.completeAuthentication(response, transaction.nonce, transaction.returnUrl)),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.mapKeycloakErrorFromHttp(error)))
        ),
        finalize(() => this.clearAuthTransaction())
      );
  }

  getValidAccessToken(forceRefresh = false): Observable<string | null> {
    const session = this.currentSession;

    if (!session) {
      return of(null);
    }

    if (!forceRefresh && !this.isAccessTokenExpired(30)) {
      return of(session.accessToken);
    }

    if (this.isRefreshTokenExpired()) {
      this.clearSession();
      return of(null);
    }

    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const body = new HttpParams({
      fromObject: {
        grant_type: 'refresh_token',
        client_id: environment.keycloak.clientId,
        refresh_token: session.refreshToken,
      },
    });

    this.refreshRequest$ = this.http
      .post<KeycloakTokenResponse>(this.getKeycloakEndpoint('/protocol/openid-connect/token'), body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        map((response) => {
          const nextSession = this.buildSession(response, null);
          this.persistSession(nextSession);
          return nextSession.accessToken;
        }),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
        finalize(() => {
          this.refreshRequest$ = undefined;
        }),
        shareReplay(1)
      );

    return this.refreshRequest$;
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const currentRoles = this.currentRoles;
    const requiredRoles = Array.isArray(role) ? role : [role];
    return requiredRoles.some((requiredRole) => currentRoles.includes(requiredRole));
  }

  getDefaultRouteForCurrentUser(): string {
    return this.getDefaultRouteForRoles(this.currentRoles);
  }

  getDefaultRouteForRoles(roles: UserRole[]): string {
    if (roles.includes('ADMIN_FEDERATION')) {
      return '/app/admin';
    }

    if (roles.includes('PLAYER')) {
      return '/app/player';
    }

    if (roles.includes('CLUB_MANAGER')) {
      return '/app/manager';
    }

    if (roles.includes('COACH')) {
      return '/app/coach';
    }

    if (roles.includes('REFEREE')) {
      return '/app/referee';
    }

    return '/app/profile/me';
  }

  shouldAttachToken(url: string): boolean {
    const normalizedUrl = url.toLowerCase();
    const apiBaseUrl = environment.apiBaseUrl.toLowerCase();
    const hasApiBaseUrl = apiBaseUrl.length > 0;

    const isGatewayUrl =
      (hasApiBaseUrl && normalizedUrl.startsWith(apiBaseUrl)) || normalizedUrl.startsWith('/api/');
    const isPublicRegistrationEndpoint =
      normalizedUrl.includes('/api/auth/register/player') ||
      normalizedUrl.includes('/api/auth/register/staff');

    return isGatewayUrl && !isPublicRegistrationEndpoint;
  }

  navigateAfterLogin(returnUrl?: string | null): Promise<boolean> {
    const targetUrl = returnUrl?.startsWith('/') ? returnUrl : this.getDefaultRouteForCurrentUser();
    return this.router.navigateByUrl(targetUrl, { replaceUrl: true });
  }

  logout(): void {
    const idToken = this.currentSession?.idToken;
    const logoutUrl = this.createAppUrl(this.getKeycloakEndpoint('/protocol/openid-connect/logout'));

    logoutUrl.searchParams.set('client_id', environment.keycloak.clientId);
    logoutUrl.searchParams.set('post_logout_redirect_uri', this.getPostLogoutRedirectUri());

    if (idToken) {
      logoutUrl.searchParams.set('id_token_hint', idToken);
    }

    this.clearSession();

    if (this.isBrowser()) {
      window.location.assign(logoutUrl.toString());
      return;
    }

    void this.router.navigate(['/auth/login'], { queryParams: { loggedOut: 1 } });
  }

  handleUnauthorized(): void {
    const returnUrl = this.router.url.startsWith('/auth') ? null : this.router.url;
    this.clearSession();
    void this.router.navigate(['/auth/login'], {
      queryParams: {
        ...(returnUrl ? { returnUrl } : {}),
        sessionExpired: 1,
      },
    });
  }

  navigateToUnauthorized(): void {
    void this.router.navigate(['/auth/unauthorized']);
  }

  private restoreSession(): void {
    if (!this.isBrowser()) {
      return;
    }

    const rawSession = localStorage.getItem(this.sessionKey);
    if (!rawSession) {
      return;
    }

    try {
      const session = JSON.parse(rawSession) as UserSession;
      this.sessionSubject.next(session);

      if (this.isRefreshTokenExpired()) {
        this.clearSession();
      }
    } catch {
      this.clearSession();
    }
  }

  private completeAuthentication(
    response: KeycloakTokenResponse,
    expectedNonce: string,
    returnUrl: string | null
  ): string {
    const session = this.buildSession(response, expectedNonce);
    this.persistSession(session);
    return returnUrl?.startsWith('/') ? returnUrl : this.getDefaultRouteForRoles(session.user.roles ?? []);
  }

  private buildSession(response: KeycloakTokenResponse, expectedNonce: string | null): UserSession {
    const accessPayload = this.decodeJwt<Record<string, unknown>>(response.access_token);
    const idPayload = response.id_token ? this.decodeJwt<Record<string, unknown>>(response.id_token) : null;

    if (expectedNonce && idPayload?.['nonce'] !== expectedNonce) {
      throw new Error('La verification de securite de la session a echoue. Veuillez vous reconnecter.');
    }

    const user = this.mapUserFromToken(accessPayload, idPayload);
    const accessExpiry = this.extractExpiry(response.access_token, response.expires_in);
    const refreshExpiry = this.extractExpiry(response.refresh_token, response.refresh_expires_in ?? 0);

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      idToken: response.id_token,
      tokenType: response.token_type,
      expiresAt: accessExpiry,
      refreshExpiresAt: refreshExpiry,
      user,
    };
  }

  private persistSession(session: UserSession): void {
    this.sessionSubject.next(session);

    if (this.isBrowser()) {
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }
  }

  private updateStoredUser(user: User): void {
    const currentSession = this.currentSession;
    if (!currentSession) {
      return;
    }

    this.persistSession({
      ...currentSession,
      user,
    });
  }

  private clearSession(): void {
    this.sessionSubject.next(null);
    this.clearAuthTransaction();

    if (this.isBrowser()) {
      localStorage.removeItem(this.sessionKey);
    }
  }

  private getAuthTransaction(): AuthTransaction | null {
    if (!this.isBrowser()) {
      return null;
    }

    const rawTransaction = sessionStorage.getItem(this.authTransactionKey);
    if (!rawTransaction) {
      return null;
    }

    try {
      return JSON.parse(rawTransaction) as AuthTransaction;
    } catch {
      this.clearAuthTransaction();
      return null;
    }
  }

  private clearAuthTransaction(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(this.authTransactionKey);
    }
  }

  private mapUserFromToken(
    accessPayload: Record<string, unknown>,
    idPayload: Record<string, unknown> | null
  ): User {
    const roles = this.extractRoles(accessPayload);
    const role = roles[0] ?? 'UNKNOWN';
    const username = this.readString(accessPayload['preferred_username']) ?? this.readString(idPayload?.['preferred_username']) ?? this.readString(accessPayload['email']) ?? 'user';
    const email = this.readString(accessPayload['email']) ?? this.readString(idPayload?.['email']) ?? '';
    const firstName =
      this.readString(accessPayload['given_name']) ??
      this.readString(idPayload?.['given_name']) ??
      username;
    const lastName =
      this.readString(accessPayload['family_name']) ??
      this.readString(idPayload?.['family_name']) ??
      'Utilisateur';

    return {
      id: this.readString(accessPayload['sub']) ?? username,
      username,
      firstName,
      lastName,
      email,
      role,
      roles,
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };
  }

  private extractRoles(payload: Record<string, unknown>): UserRole[] {
    const realmAccess = payload['realm_access'];
    if (!realmAccess || typeof realmAccess !== 'object') {
      return [];
    }

    const rawRoles = (realmAccess as { roles?: unknown }).roles;
    if (!Array.isArray(rawRoles)) {
      return [];
    }

    return APP_ROLES.filter((role) => rawRoles.includes(role));
  }

  private extractExpiry(token: string, fallbackSeconds: number): number {
    const payload = this.decodeJwt<Record<string, unknown>>(token);
    const tokenExp = typeof payload['exp'] === 'number' ? payload['exp'] * 1000 : null;
    return tokenExp ?? Date.now() + fallbackSeconds * 1000;
  }

  private decodeJwt<T>(token: string): T {
    const [, payload] = token.split('.');

    if (!payload) {
      throw new Error('Session invalide.');
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

    if (typeof atob === 'function') {
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes)) as T;
    }

    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as T;
  }

  private async createCodeChallenge(verifier: string): Promise<string> {
    if (!this.isBrowser()) {
      throw new Error('La connexion ne peut pas etre preparee depuis cet environnement.');
    }

    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return this.toBase64Url(new Uint8Array(digest));
  }

  private createRandomString(size: number): string {
    if (!this.isBrowser()) {
      return '';
    }

    const values = new Uint8Array(size);
    window.crypto.getRandomValues(values);
    return this.toBase64Url(values).slice(0, size);
  }

  private toBase64Url(bytes: Uint8Array): string {
    if (typeof btoa === 'function') {
      const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    return Buffer.from(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private mapRegistrationError(error: HttpErrorResponse): string {
    const payload = typeof error.error === 'string' ? error.error : this.readString(error.error?.message);
    const message = payload?.toLowerCase() ?? '';

    if (error.status === 0) {
      return 'Le service d inscription est indisponible pour le moment. Merci de reessayer.';
    }

    if (message.includes('already') || message.includes('exist') || error.status === 409) {
      return 'Un compte avec cet email ou ce nom d utilisateur existe deja.';
    }

    if (message.includes('invalid') || error.status === 400) {
      return 'Les informations saisies sont invalides. Verifiez le formulaire puis reessayez.';
    }

    return payload || 'Une erreur est survenue pendant l inscription.';
  }

  private mapKeycloakError(error: string, description: string | null): string {
    const normalizedDescription = description?.toLowerCase() ?? '';

    if (error === 'invalid_grant' && normalizedDescription.includes('invalid user credentials')) {
      return 'Nom d utilisateur ou mot de passe incorrect.';
    }

    if (
      error === 'unauthorized_client' ||
      normalizedDescription.includes('not allowed') ||
      normalizedDescription.includes('not permitted')
    ) {
      return 'La connexion par formulaire n est pas activee sur le serveur. Contactez l administrateur.';
    }

    if (normalizedDescription.includes('invalid parameter')) {
      return 'Le service de connexion est momentanement indisponible.';
    }

    if (normalizedDescription.includes('not fully set up')) {
      return 'Keycloak bloque la connexion : le compte a des actions requises ou un email non verifie. Dans Admin Keycloak > Users > cet utilisateur : vider Required actions, cocher Email verified, Enregistrer.';
    }

    if (normalizedDescription.includes('disabled')) {
      return 'Votre compte n est pas encore active. Contactez l administration.';
    }

    if (error === 'access_denied') {
      return 'La connexion a ete annulee.';
    }

    return description || 'La connexion n a pas pu aboutir.';
  }

  private mapKeycloakErrorFromHttp(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Impossible de joindre le service de connexion. Verifiez que les services sont demarres.';
    }

    const errorDescription = this.readString(error.error?.error_description);
    const errorCode = this.readString(error.error?.error);
    return this.mapKeycloakError(errorCode ?? 'login_failed', errorDescription);
  }

  private getKeycloakEndpoint(path: string): string {
    return `${environment.keycloak.baseUrl}/realms/${environment.keycloak.realm}${path}`;
  }

  private createAppUrl(path: string): URL {
    return new URL(path, this.getAppOrigin());
  }

  private getAppOrigin(): string {
    return this.isBrowser() ? window.location.origin : 'http://localhost:4200';
  }

  private getRedirectUri(): string {
    return `${this.getAppOrigin()}${environment.keycloak.redirectPath}`;
  }

  private getPostLogoutRedirectUri(): string {
    return `${this.getAppOrigin()}${environment.keycloak.postLogoutRedirectPath}`;
  }

  private isAccessTokenExpired(skewSeconds = 0): boolean {
    const expiresAt = this.currentSession?.expiresAt ?? 0;
    return Date.now() + skewSeconds * 1000 >= expiresAt;
  }

  private isRefreshTokenExpired(): boolean {
    const refreshExpiresAt = this.currentSession?.refreshExpiresAt ?? 0;
    return Date.now() >= refreshExpiresAt;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
