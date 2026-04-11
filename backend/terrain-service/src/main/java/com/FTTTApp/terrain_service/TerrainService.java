package com.FTTTApp.terrain_service;

import com.FTTTApp.terrain_service.DTO.TerrainEventDTO; // Assure-toi que ce package correspond bien à l'emplacement de ton DTO
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TerrainService {

    private final TerrainRepository terrainRepository;

    // =========================================================================
    // 🎧 L'Écouteur RabbitMQ (Consommateur)
    // =========================================================================

    @RabbitListener(queues = "terrain_queue")
    public void consommerMessageRabbitMQ(TerrainEventDTO event) {
        System.out.println("========== MESSAGE REÇU DEPUIS RABBITMQ ! ==========");
        System.out.println("Message : " + event.getMessage());
        System.out.println("ID du Club concerné : " + event.getClubId());
        System.out.println("====================================================");

        // Exemple de logique métier que tu peux ajouter ici :
        // Tu pourrais créer un terrain par défaut automatiquement pour ce nouveau club
        // Terrain terrainDefaut = new Terrain();
        // terrainDefaut.setNom("Terrain Principal - Club " + event.getClubId());
        // terrainDefaut.setDisponible(true);
        // terrainRepository.save(terrainDefaut);
    }

    // =========================================================================
    // 🛠️ Méthodes CRUD Classiques
    // =========================================================================

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