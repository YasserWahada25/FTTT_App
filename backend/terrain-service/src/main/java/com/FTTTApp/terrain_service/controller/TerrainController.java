package com.FTTTApp.terrain_service.controller;

import com.FTTTApp.terrain_service.dto.TerrainRequestDTO;
import com.FTTTApp.terrain_service.dto.TerrainResponseDTO;
import com.FTTTApp.terrain_service.service.TerrainManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/terrains", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class TerrainController {

    private final TerrainManagementService terrainManagementService;

    @GetMapping("/disponibles")
    public ResponseEntity<List<TerrainResponseDTO>> getTerrainsDisponibles() {
        return ResponseEntity.ok(terrainManagementService.listDisponibles());
    }

    @PatchMapping("/{id:\\d+}/disponibilite")
    public ResponseEntity<TerrainResponseDTO> changerDisponibilite(
            @PathVariable Long id,
            @RequestParam boolean disponible) {
        return ResponseEntity.ok(terrainManagementService.changerDisponibilite(id, disponible));
    }

    @GetMapping
    public ResponseEntity<List<TerrainResponseDTO>> list(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(terrainManagementService.listTerrains(jwt));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<TerrainResponseDTO> getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        return ResponseEntity.ok(terrainManagementService.getById(id, jwt));
    }

    @PreAuthorize("hasAnyRole('ADMIN_FEDERATION','CLUB_MANAGER')")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TerrainResponseDTO> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TerrainRequestDTO body) {
        return new ResponseEntity<>(terrainManagementService.create(body, jwt), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ADMIN_FEDERATION','CLUB_MANAGER')")
    @PutMapping(path = "/{id:\\d+}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TerrainResponseDTO> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody TerrainRequestDTO body) {
        return ResponseEntity.ok(terrainManagementService.update(id, body, jwt));
    }

    @PreAuthorize("hasAnyRole('ADMIN_FEDERATION','CLUB_MANAGER')")
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        terrainManagementService.delete(id, jwt);
        return ResponseEntity.noContent().build();
    }
}
