package com.FTTTApp.terrain_service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TerrainRepository extends JpaRepository<Terrain, Long> {

    // Trouver tous les terrains disponibles
    List<Terrain> findByDisponibleTrue();

    // Trouver par surface
    List<Terrain> findBySurface(String surface);

    // Trouver par localisation
    List<Terrain> findByLocalisation(String localisation);
}