import { User, UserRole } from './user.model';

export const APP_ROLES = [
  'ADMIN_FEDERATION',
  'PLAYER',
  'CLUB_MANAGER',
  'COACH',
  'REFEREE',
] as const satisfies readonly UserRole[];

export const STAFF_ROLES = ['CLUB_MANAGER', 'COACH', 'REFEREE'] as const;

export type StaffRequestedRole = (typeof STAFF_ROLES)[number];

export interface PlayerRegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface StaffRegisterRequest extends PlayerRegisterRequest {
  requestedRole: StaffRequestedRole;
}

export interface UpdateMyProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

export interface CurrentUserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  roles: UserRole[];
}

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  tokenType: string;
  expiresAt: number;
  refreshExpiresAt: number;
  user: User;
}

export interface AuthTransaction {
  nonce: string;
  returnUrl: string | null;
  state: string;
  verifier: string;
}

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_expires_in?: number;
  refresh_token: string;
  scope?: string;
  session_state?: string;
  token_type: string;
}
