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
    managerId: string;
    managerName: string;
    membersCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ClubMember {
    id: string;
    userId: string;
    userName: string;
    role: string;
    joinedAt: string;
}
