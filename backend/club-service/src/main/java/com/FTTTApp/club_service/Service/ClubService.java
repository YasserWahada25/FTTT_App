package com.FTTTApp.club_service.Service;

import com.FTTTApp.club_service.Client.TerrainClient;
import com.FTTTApp.club_service.DTO.AddClubMemberRequestDTO;
import com.FTTTApp.club_service.DTO.ClubMemberResponseDTO;
import com.FTTTApp.club_service.DTO.ClubRequestDTO;
import com.FTTTApp.club_service.DTO.ClubResponseDTO;
import com.FTTTApp.club_service.DTO.TerrainDTO;
import com.FTTTApp.club_service.Entity.Club;
import com.FTTTApp.club_service.Entity.ClubMember;
import com.FTTTApp.club_service.Entity.ClubStatus;
import com.FTTTApp.club_service.Repository.ClubMemberRepository;
import com.FTTTApp.club_service.Repository.ClubRepository;
import com.FTTTApp.club_service.security.JwtClubSupport;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final TerrainClient terrainClient;

    public ClubService(ClubRepository clubRepository,
                       ClubMemberRepository clubMemberRepository,
                       TerrainClient terrainClient) {
        this.clubRepository = clubRepository;
        this.clubMemberRepository = clubMemberRepository;
        this.terrainClient = terrainClient;
    }

    /**
     * Clubs dont l'utilisateur courant (sub JWT) est membre (effectif),
     * indépendamment des claims Keycloak {@code club_id}.
     */
    @Transactional(readOnly = true)
    public List<ClubResponseDTO> listMyMemberClubs(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null || jwt.getSubject().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session invalide");
        }
        return clubMemberRepository.findByPlayerUserIdOrderByJoinedAtAsc(jwt.getSubject()).stream()
                .map(ClubMember::getClub)
                .collect(Collectors.toMap(
                        Club::getId,
                        c -> c,
                        (existing, replacement) -> existing,
                        LinkedHashMap::new))
                .values()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClubResponseDTO> listClubs(Jwt jwt) {
        List<Club> clubs = clubRepository.findAll();
        if (JwtClubSupport.isAdmin(jwt)) {
            return clubs.stream().map(this::toResponse).collect(Collectors.toList());
        }
        return clubs.stream()
                .filter(c -> c.getStatus() == ClubStatus.active)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClubResponseDTO getClubById(Long id, Jwt jwt) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable"));
        if (!canViewClub(jwt, club)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable");
        }
        return toResponse(club);
    }

    public ClubResponseDTO createClub(ClubRequestDTO dto, Jwt jwt) {
        requireAdmin(jwt);
        if (clubRepository.existsByCodeIgnoreCase(dto.getCode().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce code club est déjà utilisé");
        }
        Club club = new Club();
        applyFullAdmin(dto, club, true);
        if (club.getStatus() == null) {
            club.setStatus(ClubStatus.active);
        }
        return toResponse(clubRepository.save(club));
    }

    public ClubResponseDTO updateClub(Long id, ClubRequestDTO dto, Jwt jwt) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable"));
        if (JwtClubSupport.isAdmin(jwt)) {
            String newCode = dto.getCode().trim();
            if (!club.getCode().equalsIgnoreCase(newCode)
                    && clubRepository.existsByCodeIgnoreCaseAndIdNot(newCode, id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce code club est déjà utilisé");
            }
            applyFullAdmin(dto, club, false);
        } else if (JwtClubSupport.managesClub(jwt, id)) {
            applyManagerUpdate(dto, club);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Droits insuffisants pour modifier ce club");
        }
        return toResponse(clubRepository.save(club));
    }

    public void deleteClub(Long id, Jwt jwt) {
        requireAdmin(jwt);
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable"));
        clubMemberRepository.deleteAll(clubMemberRepository.findByClub_IdOrderByJoinedAtAsc(id));
        clubRepository.delete(club);
    }

    @Transactional(readOnly = true)
    public List<ClubMemberResponseDTO> listMembers(Long clubId, Jwt jwt) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable");
        }
        if (!canManageMembers(jwt, clubId) && !isMember(jwt, clubId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès aux membres refusé");
        }
        return clubMemberRepository.findByClub_IdOrderByJoinedAtAsc(clubId).stream()
                .map(this::toMemberDto)
                .collect(Collectors.toList());
    }

    public ClubMemberResponseDTO addMember(Long clubId, AddClubMemberRequestDTO dto, Jwt jwt) {
        requireMemberAdmin(jwt, clubId);
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable"));
        String playerId = dto.getPlayerUserId().trim();
        if (clubMemberRepository.existsByClub_IdAndPlayerUserId(clubId, playerId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce joueur est déjà associé au club");
        }
        ClubMember m = new ClubMember();
        m.setClub(club);
        m.setPlayerUserId(playerId);
        return toMemberDto(clubMemberRepository.save(m));
    }

    public void removeMember(Long clubId, String playerUserId, Jwt jwt) {
        requireMemberAdmin(jwt, clubId);
        if (!clubRepository.existsById(clubId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable");
        }
        if (!clubMemberRepository.existsByClub_IdAndPlayerUserId(clubId, playerUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable");
        }
        clubMemberRepository.deleteByClub_IdAndPlayerUserId(clubId, playerUserId);
    }

    @Transactional(readOnly = true)
    public List<TerrainDTO> getTerrainsDisponiblesForClub(Long clubId, Jwt jwt) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable"));
        if (!canViewClub(jwt, club)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable");
        }
        try {
            return terrainClient.getTerrainsDisponibles();
        } catch (Exception e) {
            return List.of();
        }
    }

    private void requireAdmin(Jwt jwt) {
        if (!JwtClubSupport.isAdmin(jwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Réservé à l'administration fédérale");
        }
    }

    private void requireMemberAdmin(Jwt jwt, Long clubId) {
        if (JwtClubSupport.isAdmin(jwt)) {
            return;
        }
        if (JwtClubSupport.managesClub(jwt, clubId)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Réservé au responsable du club ou à l'admin");
    }

    private boolean canManageMembers(Jwt jwt, Long clubId) {
        return JwtClubSupport.isAdmin(jwt) || JwtClubSupport.managesClub(jwt, clubId);
    }

    private boolean isMember(Jwt jwt, Long clubId) {
        if (jwt == null) {
            return false;
        }
        return clubMemberRepository.existsByClub_IdAndPlayerUserId(clubId, jwt.getSubject());
    }

    private boolean canViewClub(Jwt jwt, Club club) {
        if (JwtClubSupport.isAdmin(jwt)) {
            return true;
        }
        if (club.getStatus() == ClubStatus.active) {
            return true;
        }
        return JwtClubSupport.managesClub(jwt, club.getId()) || isMember(jwt, club.getId());
    }

    private void applyFullAdmin(ClubRequestDTO dto, Club club, boolean isCreate) {
        club.setName(dto.getName().trim());
        club.setCode(dto.getCode().trim());
        club.setLogo(trimOrNull(dto.getLogo()));
        club.setAddress(trimOrNull(dto.getAddress()));
        club.setCity(trimOrNull(dto.getCity()));
        club.setRegion(trimOrNull(dto.getRegion()));
        club.setPhone(trimOrNull(dto.getPhone()));
        club.setEmail(trimOrNull(dto.getEmail()));
        club.setWebsite(trimOrNull(dto.getWebsite()));
        club.setFoundedYear(dto.getFoundedYear());
        if (dto.getStatus() != null) {
            club.setStatus(dto.getStatus());
        } else if (isCreate) {
            club.setStatus(ClubStatus.active);
        }
        club.setManagerUserId(trimOrNull(dto.getManagerUserId()));
    }

    private void applyManagerUpdate(ClubRequestDTO dto, Club club) {
        club.setName(dto.getName().trim());
        club.setLogo(trimOrNull(dto.getLogo()));
        club.setAddress(trimOrNull(dto.getAddress()));
        club.setCity(trimOrNull(dto.getCity()));
        club.setRegion(trimOrNull(dto.getRegion()));
        club.setPhone(trimOrNull(dto.getPhone()));
        club.setEmail(trimOrNull(dto.getEmail()));
        club.setWebsite(trimOrNull(dto.getWebsite()));
        club.setFoundedYear(dto.getFoundedYear());
    }

    private static String trimOrNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private ClubResponseDTO toResponse(Club c) {
        ClubResponseDTO d = new ClubResponseDTO();
        d.setId(c.getId());
        d.setName(c.getName());
        d.setCode(c.getCode());
        d.setLogo(c.getLogo());
        d.setAddress(c.getAddress());
        d.setCity(c.getCity());
        d.setRegion(c.getRegion());
        d.setPhone(c.getPhone());
        d.setEmail(c.getEmail());
        d.setWebsite(c.getWebsite());
        d.setFoundedYear(c.getFoundedYear());
        d.setManagerUserId(c.getManagerUserId());
        d.setStatus(c.getStatus());
        d.setMembersCount(clubMemberRepository.countByClub_Id(c.getId()));
        d.setCreatedAt(c.getCreatedAt());
        d.setUpdatedAt(c.getUpdatedAt());
        return d;
    }

    private ClubMemberResponseDTO toMemberDto(ClubMember m) {
        ClubMemberResponseDTO d = new ClubMemberResponseDTO();
        d.setId(m.getId());
        d.setPlayerUserId(m.getPlayerUserId());
        d.setJoinedAt(m.getJoinedAt());
        return d;
    }
}
