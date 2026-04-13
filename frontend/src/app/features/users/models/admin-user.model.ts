import { User, UserRole } from '../../../core/models/user.model';

export interface AdminCreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN_FEDERATION' | 'UNKNOWN'>;
}

export interface PendingUserRequest {
  id: number;
  username: string;
  email: string;
  requestedRole: Exclude<UserRole, 'ADMIN_FEDERATION' | 'PLAYER' | 'UNKNOWN'>;
  status: 'pending' | 'approved' | 'rejected';
  keycloakUserId: string;
}

export interface AdminUserApiResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PendingUserRequestApiResponse {
  id: number;
  username: string;
  email: string;
  requestedRole: PendingUserRequest['requestedRole'];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  keycloakUserId: string;
}

export function mapAdminUserResponse(response: AdminUserApiResponse): User {
  return {
    id: response.id,
    username: response.username,
    firstName: response.firstName,
    lastName: response.lastName,
    email: response.email,
    role: response.role,
    roles: [response.role],
    status: response.status,
    createdAt: response.createdAt,
    updatedAt: response.createdAt,
  };
}

export function mapPendingUserRequestResponse(
  response: PendingUserRequestApiResponse
): PendingUserRequest {
  return {
    id: response.id,
    username: response.username,
    email: response.email,
    requestedRole: response.requestedRole,
    status: response.status.toLowerCase() as PendingUserRequest['status'],
    keycloakUserId: response.keycloakUserId,
  };
}
