package com.FTTTApp.terrain_service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TerrainService {

    private final TerrainRepository terrainRepository;

    // Lister tous les terrains
    public List<Terrain> getAllTerrains() {
        return terrainRepository.findAll();
    }

    // Obtenir un terrain par ID
    public Terrain getTerrainById(Long id) {
        return terrainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain non trouvé avec id: " + id));
    }

    // Ajouter un terrain
    public Terrain createTerrain(Terrain terrain) {
        return terrainRepository.save(terrain);
    }

    // Modifier un terrain
    public Terrain updateTerrain(Long id, Terrain terrainDetails) {
        Terrain terrain = getTerrainById(id);
        terrain.setNom(terrainDetails.getNom());
        terrain.setSurface(terrainDetails.getSurface());
        terrain.setLocalisation(terrainDetails.getLocalisation());
        terrain.setDisponible(terrainDetails.isDisponible());
        terrain.setPrixParHeure(terrainDetails.getPrixParHeure());
        terrain.setImage(terrainDetails.getImage());
        return terrainRepository.save(terrain);
    }

    // Supprimer un terrain
    public void deleteTerrain(Long id) {
        terrainRepository.deleteById(id);
    }

    // Terrains disponibles
    public List<Terrain> getTerrainsDisponibles() {
        return terrainRepository.findByDisponibleTrue();
    }

    // Changer disponibilité (appelé par Reservation-service)
    public Terrain changerDisponibilite(Long id, boolean disponible) {
        Terrain terrain = getTerrainById(id);
        terrain.setDisponible(disponible);
        return terrainRepository.save(terrain);
    }
}