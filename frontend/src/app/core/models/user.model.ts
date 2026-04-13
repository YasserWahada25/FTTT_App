export type UserRole =
  | 'ADMIN_FEDERATION'
  | 'CLUB_MANAGER'
  | 'COACH'
  | 'PLAYER'
  | 'REFEREE'
  | 'UNKNOWN';

export interface User {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  roles?: UserRole[];
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  clubId?: string;
  clubName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
