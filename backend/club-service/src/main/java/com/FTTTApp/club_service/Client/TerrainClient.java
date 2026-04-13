package com.FTTTApp.club_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "terrain-service")
public interface TerrainClient {

    @GetMapping("/terrains")
    List<TerrainDTO> getAllTerrains();

    @GetMapping("/terrains/{id}")
    TerrainDTO getTerrainById(@PathVariable("id") Long id);

    @GetMapping("/terrains/disponibles")
    List<TerrainDTO> getTerrainsDisponibles();

    @PatchMapping("/terrains/{id}/disponibilite")
    TerrainDTO changerDisponibilite(
            @PathVariable("id") Long id,
            @RequestParam("disponible") boolean disponible
    );
}