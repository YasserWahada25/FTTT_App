/** Réponses API club-service (alignées sur ClubResponseDTO). */
export interface ClubApiResponse {
    id: number;
    name: string;
    code: string;
    logo?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    foundedYear: number;
    managerUserId?: string | null;
    status: 'active' | 'inactive' | 'suspended';
    membersCount: number;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface ClubWritePayload {
    name: string;
    code: string;
    logo?: string;
    address?: string;
    city?: string;
    region?: string;
    phone?: string;
    email?: string;
    website?: string;
    foundedYear: number;
    status?: 'active' | 'inactive' | 'suspended';
    managerUserId?: string;
}

export interface Club {
    id: string;
    name: string;
    code: string;
    logo?: string;
    address: string;
    city: string;
    region: string;
    phone: string;
    email: string;
    website?: string;
    foundedYear: number;
    status: 'active' | 'inactive' | 'suspended';
    managerUserId?: string;
    membersCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ClubMemberApiResponse {
    id: number;
    playerUserId: string;
    joinedAt?: string | null;
}

export interface ClubMember {
    id: string;
    playerUserId: string;
    joinedAt?: string;
}
