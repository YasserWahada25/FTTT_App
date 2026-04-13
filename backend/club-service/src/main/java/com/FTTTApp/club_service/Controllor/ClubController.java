package com.FTTTApp.club_service.Controllor;

import com.FTTTApp.club_service.DTO.AddClubMemberRequestDTO;
import com.FTTTApp.club_service.DTO.ClubMemberResponseDTO;
import com.FTTTApp.club_service.DTO.ClubRequestDTO;
import com.FTTTApp.club_service.DTO.ClubResponseDTO;
import com.FTTTApp.club_service.DTO.TerrainDTO;
import com.FTTTApp.club_service.Service.ClubService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/clubs", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping
    public ResponseEntity<List<ClubResponseDTO>> list(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(clubService.listClubs(jwt));
    }

    /** Clubs dont l'utilisateur connecté est membre (table club_members). */
    @GetMapping("/my-memberships")
    public ResponseEntity<List<ClubResponseDTO>> myMemberships(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(clubService.listMyMemberClubs(jwt));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ClubResponseDTO> getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(clubService.getClubById(id, jwt));
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClubResponseDTO> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ClubRequestDTO body) {
        return new ResponseEntity<>(clubService.createClub(body, jwt), HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id:\\d+}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClubResponseDTO> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id,
            @Valid @RequestBody ClubRequestDTO body) {
        return ResponseEntity.ok(clubService.updateClub(id, body, jwt));
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        clubService.deleteClub(id, jwt);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id:\\d+}/members")
    public ResponseEntity<List<ClubMemberResponseDTO>> listMembers(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(clubService.listMembers(id, jwt));
    }

    @PostMapping(path = "/{id:\\d+}/members", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClubMemberResponseDTO> addMember(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id,
            @Valid @RequestBody AddClubMemberRequestDTO body) {
        return new ResponseEntity<>(clubService.addMember(id, body, jwt), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id:\\d+}/members/{playerUserId}")
    public ResponseEntity<Void> removeMember(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id,
            @PathVariable("playerUserId") String playerUserId) {
        clubService.removeMember(id, playerUserId, jwt);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id:\\d+}/terrains-disponibles")
    public ResponseEntity<List<TerrainDTO>> terrainsDisponibles(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(clubService.getTerrainsDisponiblesForClub(id, jwt));
    }
}
