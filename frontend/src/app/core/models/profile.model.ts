export interface Profile {
    id: string;
    userId: string;
    bio?: string;
    skills?: string[];
    achievements?: string[];
    stats?: {
        ranking?: number;
        points?: number;
        wins?: number;
        losses?: number;
        matchesPlayed?: number;
    };
    createdAt?: string;
    updatedAt?: string;
}
