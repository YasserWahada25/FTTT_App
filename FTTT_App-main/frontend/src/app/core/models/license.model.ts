export type LicenseStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'active';

export interface License {
    id: string;
    licenseNumber: string;
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
    season: string;
    category: string;
    status: LicenseStatus;
    requestDate: string;
    approvalDate?: string;
    expiryDate: string;
    amount: number;
    paymentStatus: 'paid' | 'pending' | 'overdue';
    notes?: string;
}
