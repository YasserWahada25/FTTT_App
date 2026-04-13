package com.FTTTApp.terrain_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "terrain_competitions",
        uniqueConstraints = @UniqueConstraint(name = "uk_terrain_competition", columnNames = {"terrain_id", "competition_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TerrainCompetition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "terrain_id", nullable = false)
    private Terrain terrain;

    /** Identifiant compétition (competition-service), sans FK JPA inter-MS. */
    @Column(name = "competition_id", nullable = false)
    private Long competitionId;
}
