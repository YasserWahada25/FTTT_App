package com.FTTTApp.terrain_service.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TerrainResponseDTO {
    private Long id;
    private String nom;
    private String surface;
    private String localisation;
    private boolean disponible;
    private double prixParHeure;
    private String image;
    private Long clubId;
    private List<Long> competitionIds = new ArrayList<>();
}
