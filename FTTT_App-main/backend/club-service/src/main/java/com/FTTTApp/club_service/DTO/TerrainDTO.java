package com.FTTTApp.club_service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TerrainDTO {
    private Long id;
    private String nom;
    private String surface;
    private String localisation;
    private boolean disponible;
    private double prixParHeure;
    private String image;
}