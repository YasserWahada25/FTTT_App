export type CompetitionStatus = 'draft' | 'open' | 'ongoing' | 'finished' | 'cancelled';

export interface Competition {
    id: string;
    name: string;
    type: 'championship' | 'cup' | 'friendly' | 'league';
    category: string;
    status: CompetitionStatus;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    location: string;
    venueId?: string;
    venueName?: string;
    maxParticipants: number;
    currentParticipants: number;
    description?: string;
    rules?: string;
    organizerId: string;
    organizerName: string;
    prize?: string;
    createdAt: string;
    updatedAt: string;
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
