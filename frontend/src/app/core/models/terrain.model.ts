/** Réponses API terrain-service. */
export interface TerrainApiResponse {
    id: number;
    nom: string;
    surface?: string | null;
    localisation?: string | null;
    disponible: boolean;
    prixParHeure: number;
    image?: string | null;
    clubId?: number | null;
    competitionIds?: number[] | null;
}

export interface TerrainWritePayload {
    nom: string;
    surface?: string;
    localisation?: string;
    disponible: boolean;
    prixParHeure: number;
    image?: string;
    clubId?: number | null;
    competitionIds: number[];
}

export interface Terrain {
    id: string;
    nom: string;
    surface: string;
    localisation: string;
    disponible: boolean;
    prixParHeure: number;
    image?: string;
    clubId?: string;
    competitionIds: string[];
}
