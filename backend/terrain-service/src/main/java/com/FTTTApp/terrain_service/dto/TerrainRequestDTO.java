package com.FTTTApp.terrain_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TerrainRequestDTO {

    @NotBlank
    private String nom;

    private String surface;

    private String localisation;

    @NotNull
    private Boolean disponible;

    @NotNull
    @PositiveOrZero
    private Double prixParHeure;

    private String image;

    /** Club propriétaire (optionnel) — aligné sur l’id club-service. */
    private Long clubId;

    private List<Long> competitionIds = new ArrayList<>();
}
