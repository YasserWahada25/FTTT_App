package com.FTTTApp.club_service.Client;

import com.FTTTApp.club_service.DTO.TerrainDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "terrain-service")
public interface TerrainClient {

    @GetMapping("/api/terrains")
    List<TerrainDTO> getAllTerrains();

    @GetMapping("/api/terrains/{id}")
    TerrainDTO getTerrainById(@PathVariable Long id);

    @GetMapping("/api/terrains/disponibles")
    List<TerrainDTO> getTerrainsDisponibles();

    @PatchMapping("/api/terrains/{id}/disponibilite")
    TerrainDTO changerDisponibilite(
            @PathVariable Long id,
            @RequestParam boolean disponible
    );
}