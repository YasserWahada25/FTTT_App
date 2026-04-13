/** Aligné sur club-service / terrain-service (Feign). */
export interface TerrainDTO {
    id: number;
    nom: string;
    surface: string;
    localisation: string;
    disponible: boolean;
    prixParHeure: number;
    image?: string;
}
