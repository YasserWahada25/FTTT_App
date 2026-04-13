package com.FTTTApp.terrain_service.service;

import com.FTTTApp.terrain_service.dto.TerrainRequestDTO;
import com.FTTTApp.terrain_service.dto.TerrainResponseDTO;
import com.FTTTApp.terrain_service.entity.Terrain;
import com.FTTTApp.terrain_service.entity.TerrainCompetition;
import com.FTTTApp.terrain_service.repository.TerrainCompetitionRepository;
import com.FTTTApp.terrain_service.repository.TerrainRepository;
import com.FTTTApp.terrain_service.security.JwtTerrainSupport;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TerrainManagementService {

    private final TerrainRepository terrainRepository;
    private final TerrainCompetitionRepository terrainCompetitionRepository;

    public TerrainManagementService(
            TerrainRepository terrainRepository,
            TerrainCompetitionRepository terrainCompetitionRepository) {
        this.terrainRepository = terrainRepository;
        this.terrainCompetitionRepository = terrainCompetitionRepository;
    }

    @Transactional(readOnly = true)
    public List<TerrainResponseDTO> listTerrains(Jwt jwt) {
        if (JwtTerrainSupport.isAdmin(jwt)) {
            return terrainRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        }
        if (JwtTerrainSupport.isClubManager(jwt)) {
            return JwtTerrainSupport.managedClubIdClaim(jwt)
                    .flatMap(this::parseClubIdOptional)
                    .map(cid -> terrainRepository.findAll().stream()
                            .filter(t -> t.isDisponible() || Objects.equals(t.getClubId(), cid))
                            .map(this::toResponse)
                            .collect(Collectors.toList()))
                    .orElseGet(() -> terrainRepository.findByDisponibleTrue().stream()
                            .map(this::toResponse)
                            .collect(Collectors.toList()));
        }
        return terrainRepository.findByDisponibleTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TerrainResponseDTO getById(Long id, Jwt jwt) {
        Terrain t = terrainRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Terrain introuvable"));
        if (!canViewTerrain(jwt, t)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Terrain introuvable");
        }
        return toResponse(t);
    }

    @Transactional(readOnly = true)
    public List<TerrainResponseDTO> listDisponibles() {
        return terrainRepository.findByDisponibleTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TerrainResponseDTO create(TerrainRequestDTO dto, Jwt jwt) {
        requireCanManageCreate(jwt, dto);
        Terrain t = new Terrain();
        applyDto(t, dto);
        Terrain saved = terrainRepository.save(t);
        replaceCompetitionLinks(dto.getCompetitionIds(), jwt, saved);
        return toResponse(terrainRepository.findById(saved.getId()).orElseThrow());
    }

    public TerrainResponseDTO update(Long id, TerrainRequestDTO dto, Jwt jwt) {
        Terrain t = terrainRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Terrain introuvable"));
        requireCanModifyTerrain(jwt, t);
        if (JwtTerrainSupport.isClubManager(jwt) && !JwtTerrainSupport.isAdmin(jwt)) {
            Long cid = parseClubIdOptional(JwtTerrainSupport.managedClubIdClaim(jwt).orElse(null)).orElse(null);
            if (dto.getClubId() != null && !Objects.equals(dto.getClubId(), cid)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Club non autorisé");
            }
            dto.setClubId(cid);
        }
        applyDto(t, dto);
        Terrain saved = terrainRepository.save(t);
        replaceCompetitionLinks(dto.getCompetitionIds(), jwt, saved);
        return toResponse(terrainRepository.findById(saved.getId()).orElseThrow());
    }

    public void delete(Long id, Jwt jwt) {
        Terrain t = terrainRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Terrain introuvable"));
        requireCanModifyTerrain(jwt, t);
        terrainCompetitionRepository.deleteByTerrain_Id(id);
        terrainRepository.delete(t);
    }

    public TerrainResponseDTO changerDisponibilite(Long id, boolean disponible) {
        Terrain t = terrainRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Terrain introuvable"));
        t.setDisponible(disponible);
        return toResponse(terrainRepository.save(t));
    }

    private void requireCanManageCreate(Jwt jwt, TerrainRequestDTO dto) {
        if (JwtTerrainSupport.isAdmin(jwt)) {
            return;
        }
        if (JwtTerrainSupport.isClubManager(jwt)) {
            Long cid = JwtTerrainSupport.managedClubIdClaim(jwt)
                    .flatMap(this::parseClubIdOptional)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Club non défini pour ce responsable"));
            if (dto.getClubId() != null && !dto.getClubId().equals(cid)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez créer un terrain que pour votre club");
            }
            dto.setClubId(cid);
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Création réservée à l'administration ou au responsable de club");
    }

    private void requireCanModifyTerrain(Jwt jwt, Terrain t) {
        if (JwtTerrainSupport.isAdmin(jwt)) {
            return;
        }
        if (JwtTerrainSupport.isClubManager(jwt) && t.getClubId() != null
                && JwtTerrainSupport.managesClub(jwt, t.getClubId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Modification non autorisée");
    }

    private boolean canViewTerrain(Jwt jwt, Terrain t) {
        if (JwtTerrainSupport.isAdmin(jwt)) {
            return true;
        }
        if (t.isDisponible()) {
            return true;
        }
        return t.getClubId() != null && JwtTerrainSupport.managesClub(jwt, t.getClubId());
    }

    private void applyDto(Terrain t, TerrainRequestDTO dto) {
        t.setNom(dto.getNom().trim());
        t.setSurface(trimToNull(dto.getSurface()));
        t.setLocalisation(trimToNull(dto.getLocalisation()));
        t.setDisponible(Boolean.TRUE.equals(dto.getDisponible()));
        t.setPrixParHeure(dto.getPrixParHeure() == null ? 0 : dto.getPrixParHeure());
        t.setImage(trimToNull(dto.getImage()));
        t.setClubId(dto.getClubId());
    }

    private void replaceCompetitionLinks(List<Long> competitionIds, Jwt jwt, Terrain persisted) {
        if (!JwtTerrainSupport.isAdmin(jwt)
                && !(JwtTerrainSupport.isClubManager(jwt) && persisted.getClubId() != null
                && JwtTerrainSupport.managesClub(jwt, persisted.getClubId()))) {
            return;
        }
        terrainCompetitionRepository.deleteByTerrain_Id(persisted.getId());
        if (competitionIds == null || competitionIds.isEmpty()) {
            return;
        }
        LinkedHashSet<Long> unique = new LinkedHashSet<>(competitionIds);
        for (Long cid : unique) {
            if (cid == null) {
                continue;
            }
            TerrainCompetition link = new TerrainCompetition();
            link.setTerrain(persisted);
            link.setCompetitionId(cid);
            terrainCompetitionRepository.save(link);
        }
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private TerrainResponseDTO toResponse(Terrain t) {
        TerrainResponseDTO d = new TerrainResponseDTO();
        d.setId(t.getId());
        d.setNom(t.getNom());
        d.setSurface(t.getSurface());
        d.setLocalisation(t.getLocalisation());
        d.setDisponible(t.isDisponible());
        d.setPrixParHeure(t.getPrixParHeure());
        d.setImage(t.getImage());
        d.setClubId(t.getClubId());
        d.setCompetitionIds(
                terrainCompetitionRepository.findByTerrain_Id(t.getId()).stream()
                        .map(TerrainCompetition::getCompetitionId)
                        .collect(Collectors.toList()));
        return d;
    }

    private Optional<Long> parseClubIdOptional(String raw) {
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(Long.parseLong(raw.trim()));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
