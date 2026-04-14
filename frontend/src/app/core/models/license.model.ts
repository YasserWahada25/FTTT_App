export type LicenseStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'active';

export type LicensePaymentStatus = 'paid' | 'pending' | 'cancelled';

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
    paymentStatus: LicensePaymentStatus;
    notes?: string;
    renewedFromLicenceId?: string;
    /** Dérivé backend : licence approuvée et non expirée à la date du jour */
    validNow?: boolean;
    expiredByDate?: boolean;
    /** Pièces jointes enregistrées avec la demande */
    hasMedicalCertificate?: boolean;
    hasIdentityPhoto?: boolean;
}

/** Réponse brute API Spring (énumérations en majuscules) */
export interface LicenseApiResponse {
    id: number;
    licenseNumber: string;
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
    season: string;
    category: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestDate: string;
    approvalDate?: string;
    expiryDate: string;
    amount: number;
    paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
    notes?: string;
    renewedFromLicenceId?: number;
    validNow?: boolean;
    expiredByDate?: boolean;
    createdAt?: string;
    updatedAt?: string;
    hasMedicalCertificate?: boolean;
    hasIdentityPhoto?: boolean;
}

export interface LicenseValidityApiResponse {
    found: boolean;
    valid: boolean;
    reasonCode: string;
    message: string;
    checkedAt: string;
    license?: LicenseApiResponse;
}

export interface LicenseCreateRequest {
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
    season?: string;
    category: string;
    expiryDate?: string;
    amount?: number;
    notes?: string;
}
