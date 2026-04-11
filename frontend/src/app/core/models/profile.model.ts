export interface Profile {
    id: string;
    userId: string;
    name?: string;
    email?: string;
    phone?: string;
    category?: string;
    bio?: string;
    skills?: string[];
    achievements?: string[];
    publicProfile?: boolean;
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
