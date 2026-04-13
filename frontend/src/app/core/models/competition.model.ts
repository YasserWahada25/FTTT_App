/** Valeurs renvoyées par Competition-Service (enum Java). */
export type CompetitionCategoryApi = 'CHAMPIONNAT' | 'COUPE' | 'AMICAL' | 'TOURNOI';
export type CompetitionStatusApi = 'UPCOMING' | 'ONGOING' | 'FINISHED';

export interface CompetitionApiResponse {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    status: CompetitionStatusApi;
    category: CompetitionCategoryApi;
    sportCategoryLabel?: string | null;
    organizerName?: string | null;
    rules?: string | null;
    prize?: string | null;
    maxParticipants?: number | null;
    currentParticipants?: number | null;
    registrationDeadline?: string | null;
    published: boolean;
    targetRoles?: string[] | null;
    createdAt?: string | null;
}

/** Statut affiché (badges, filtres) — dérivé de `published` + statut API. */
export type CompetitionUiStatus = 'draft' | 'open' | 'ongoing' | 'finished';

export interface Competition {
    id: string;
    name: string;
    /** Format / règles (championnat, coupe…) pour l’UI historique. */
    type: 'championship' | 'cup' | 'friendly' | 'league';
    /** Libellé catégorie sportive (ex. Senior Hommes). */
    category: string;
    categoryApi: CompetitionCategoryApi;
    status: CompetitionUiStatus;
    apiStatus: CompetitionStatusApi;
    published: boolean;
    targetRoles: string[];
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    description?: string;
    rules?: string;
    organizerName: string;
    prize?: string;
    createdAt?: string;
}

export interface CompetitionRegistration {
    id: string;
    competitionId: string;
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
    registrationDate: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface CompetitionWritePayload {
    name: string;
    description?: string;
    location?: string;
    startDate: string;
    endDate: string;
    status?: CompetitionStatusApi;
    category: CompetitionCategoryApi;
    sportCategoryLabel?: string;
    organizerName?: string;
    rules?: string;
    prize?: string;
    maxParticipants?: number;
    currentParticipants?: number;
    registrationDeadline?: string;
    published?: boolean;
    targetRoles?: string[];
}
