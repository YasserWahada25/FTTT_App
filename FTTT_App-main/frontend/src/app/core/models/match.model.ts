export type MatchStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed';

export interface Match {
    id: string;
    competitionId: string;
    competitionName: string;
    round: string;
    homePlayerId: string;
    homePlayerName: string;
    awayPlayerId: string;
    awayPlayerName: string;
    homeClubId: string;
    homeClubName: string;
    awayClubId: string;
    awayClubName: string;
    venueId?: string;
    venueName?: string;
    scheduledDate: string;
    status: MatchStatus;
    homeScore?: number;
    awayScore?: number;
    sets?: MatchSet[];
    refereeId?: string;
    refereeName?: string;
    notes?: string;
}

export interface MatchSet {
    setNumber: number;
    homeScore: number;
    awayScore: number;
}

export interface Ranking {
    id: string;
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
    category: string;
    position: number;
    points: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
    season: string;
    updatedAt: string;
}
