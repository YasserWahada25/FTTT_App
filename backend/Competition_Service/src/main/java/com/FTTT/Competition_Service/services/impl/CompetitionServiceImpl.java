package com.FTTT.Competition_Service.services.impl;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.dto.CompetitionRequestDTO;
import com.FTTT.Competition_Service.dto.CompetitionResponseDTO;
import com.FTTT.Competition_Service.entities.Competition;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.entities.CompetitionStatus;
import com.FTTT.Competition_Service.repositories.CompetitionRepository;
import com.FTTT.Competition_Service.security.JwtCompetitionSupport;
import com.FTTT.Competition_Service.services.CompetitionService;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompetitionServiceImpl implements CompetitionService {

    private final CompetitionRepository competitionRepository;

    public CompetitionServiceImpl(CompetitionRepository competitionRepository) {
        this.competitionRepository = competitionRepository;
    }

    @Override
    public CompetitionResponseDTO createCompetition(CompetitionRequestDTO dto, Jwt jwt) {
        requireAdmin(jwt);
        Competition c = new Competition();
        applyRequest(c, dto);
        if (c.getStatus() == null) {
            c.setStatus(CompetitionStatus.UPCOMING);
        }
        if (c.getMaxParticipants() == null) {
            c.setMaxParticipants(32);
        }
        if (c.getCurrentParticipants() == null) {
            c.setCurrentParticipants(0);
        }
        boolean pub = Boolean.TRUE.equals(dto.getPublished());
        c.setPublished(pub);
        return mapToDTO(competitionRepository.save(c));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionResponseDTO> listCompetitions(Jwt jwt) {
        List<Competition> all = competitionRepository.findAll();
        if (JwtCompetitionSupport.isAdmin(jwt)) {
            return all.stream().map(this::mapToDTO).collect(Collectors.toList());
        }
        return all.stream()
                .filter(c -> visibleToNonAdmin(c, jwt))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompetitionResponseDTO getCompetitionById(Long id, Jwt jwt) {
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compétition introuvable"));
        if (!JwtCompetitionSupport.isAdmin(jwt) && !visibleToNonAdmin(c, jwt)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Compétition introuvable");
        }
        return mapToDTO(c);
    }

    @Override
    public CompetitionResponseDTO updateCompetition(Long id, CompetitionRequestDTO dto, Jwt jwt) {
        requireAdmin(jwt);
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compétition introuvable"));
        applyRequest(c, dto);
        if (dto.getPublished() != null) {
            c.setPublished(dto.getPublished());
        }
        return mapToDTO(competitionRepository.save(c));
    }

    @Override
    public void deleteCompetition(Long id, Jwt jwt) {
        requireAdmin(jwt);
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compétition introuvable"));
        competitionRepository.delete(c);
    }

    @Override
    public CompetitionResponseDTO publishCompetition(Long id, Jwt jwt) {
        requireAdmin(jwt);
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compétition introuvable"));
        c.setPublished(true);
        return mapToDTO(competitionRepository.save(c));
    }

    @Override
    public CompetitionResponseDTO unpublishCompetition(Long id, Jwt jwt) {
        requireAdmin(jwt);
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compétition introuvable"));
        c.setPublished(false);
        return mapToDTO(competitionRepository.save(c));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionCalendarDTO> getCompetitionCalendar(CompetitionCategory category,
                                                                 String location,
                                                                 LocalDateTime startDate,
                                                                 LocalDateTime endDate,
                                                                 Jwt jwt) {
        return competitionRepository.findCompetitionsWithFilters(category, location, startDate, endDate).stream()
                .filter(Competition::isPublished)
                .filter(c -> audienceMatches(c, jwt))
                .map(this::mapToCalendarDTO)
                .sorted(Comparator.comparing(CompetitionCalendarDTO::getStartDate,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    private static void requireAdmin(Jwt jwt) {
        if (jwt == null || !JwtCompetitionSupport.isAdmin(jwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Réservé à l'administration fédérale.");
        }
    }

    private boolean visibleToNonAdmin(Competition c, Jwt jwt) {
        if (!c.isPublished()) {
            return false;
        }
        return audienceMatches(c, jwt);
    }

    private boolean audienceMatches(Competition c, Jwt jwt) {
        String csv = c.getTargetRolesCsv();
        if (csv == null || csv.isBlank()) {
            return true;
        }
        Set<String> targets = parseRoleCsv(csv);
        Set<String> userRoles = JwtCompetitionSupport.roles(jwt);
        return userRoles.stream().anyMatch(targets::contains);
    }

    private static Set<String> parseRoleCsv(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private void applyRequest(Competition c, CompetitionRequestDTO dto) {
        c.setName(dto.getName());
        c.setDescription(dto.getDescription());
        c.setLocation(dto.getLocation());
        c.setStartDate(dto.getStartDate());
        c.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) {
            c.setStatus(dto.getStatus());
        }
        c.setCategory(dto.getCategory());
        c.setSportCategoryLabel(dto.getSportCategoryLabel());
        c.setOrganizerName(dto.getOrganizerName());
        c.setRules(dto.getRules());
        c.setPrize(dto.getPrize());
        if (dto.getMaxParticipants() != null) {
            c.setMaxParticipants(dto.getMaxParticipants());
        }
        if (dto.getCurrentParticipants() != null) {
            c.setCurrentParticipants(dto.getCurrentParticipants());
        }
        c.setRegistrationDeadline(dto.getRegistrationDeadline());
        c.setTargetRolesCsv(encodeRoles(dto.getTargetRoles()));
    }

    private static String encodeRoles(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        List<String> normalized = new ArrayList<>();
        for (String r : roles) {
            if (r != null && !r.isBlank()) {
                normalized.add(r.trim());
            }
        }
        if (normalized.isEmpty()) {
            return null;
        }
        return String.join(",", normalized);
    }

    private static List<String> decodeRoles(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private CompetitionResponseDTO mapToDTO(Competition competition) {
        CompetitionResponseDTO dto = new CompetitionResponseDTO();
        dto.setId(competition.getId());
        dto.setName(competition.getName());
        dto.setDescription(competition.getDescription());
        dto.setLocation(competition.getLocation());
        dto.setStartDate(competition.getStartDate());
        dto.setEndDate(competition.getEndDate());
        dto.setStatus(competition.getStatus());
        dto.setCategory(competition.getCategory());
        dto.setSportCategoryLabel(competition.getSportCategoryLabel());
        dto.setOrganizerName(competition.getOrganizerName());
        dto.setRules(competition.getRules());
        dto.setPrize(competition.getPrize());
        dto.setMaxParticipants(competition.getMaxParticipants());
        dto.setCurrentParticipants(competition.getCurrentParticipants());
        dto.setRegistrationDeadline(competition.getRegistrationDeadline());
        dto.setPublished(competition.isPublished());
        dto.setTargetRoles(decodeRoles(competition.getTargetRolesCsv()));
        dto.setCreatedAt(competition.getCreatedAt());
        return dto;
    }

    private CompetitionCalendarDTO mapToCalendarDTO(Competition competition) {
        return new CompetitionCalendarDTO(
                competition.getName(),
                competition.getLocation(),
                competition.getStartDate(),
                competition.getCategory().name()
        );
    }
}
