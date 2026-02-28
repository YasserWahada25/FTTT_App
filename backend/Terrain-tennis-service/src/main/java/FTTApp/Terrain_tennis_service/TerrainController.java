package FTTApp.Terrain_tennis_service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/terrains")
@RequiredArgsConstructor
public class TerrainController {

    private final TerrainService terrainService;

    // GET /terrains
    @GetMapping
    public ResponseEntity<List<Terrain>> getAllTerrains() {
        return ResponseEntity.ok(terrainService.getAllTerrains());
    }

    // GET /terrains/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Terrain> getTerrainById(@PathVariable Long id) {
        return ResponseEntity.ok(terrainService.getTerrainById(id));
    }

    // GET /terrains/disponibles
    @GetMapping("/disponibles")
    public ResponseEntity<List<Terrain>> getTerrainsDisponibles() {
        return ResponseEntity.ok(terrainService.getTerrainsDisponibles());
    }

    // POST /terrains
    @PostMapping
    public ResponseEntity<Terrain> createTerrain(@RequestBody Terrain terrain) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(terrainService.createTerrain(terrain));
    }

    // PUT /terrains/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Terrain> updateTerrain(@PathVariable Long id,
                                                 @RequestBody Terrain terrain) {
        return ResponseEntity.ok(terrainService.updateTerrain(id, terrain));
    }

    // DELETE /terrains/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTerrain(@PathVariable Long id) {
        terrainService.deleteTerrain(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /terrains/{id}/disponibilite
    // (utilisé par le Reservation-service de ton collègue via OpenFeign)
    @PatchMapping("/{id}/disponibilite")
    public ResponseEntity<Terrain> changerDisponibilite(@PathVariable Long id,
                                                        @RequestParam boolean disponible) {
        return ResponseEntity.ok(terrainService.changerDisponibilite(id, disponible));
    }
}
