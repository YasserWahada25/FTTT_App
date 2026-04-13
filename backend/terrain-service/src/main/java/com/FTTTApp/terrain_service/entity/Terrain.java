package com.FTTTApp.terrain_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "terrains")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Terrain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(length = 120)
    private String surface;

    @Column(length = 500)
    private String localisation;

    @Column(nullable = false)
    private boolean disponible = true;

    @Column(nullable = false)
    private double prixParHeure;

    @Column(length = 1000)
    private String image;

    /** Référence logique au club (même identifiant que club-service). */
    private Long clubId;
}
