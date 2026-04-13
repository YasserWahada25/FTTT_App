package com.FTTT.Competition_Service.controllers;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.dto.CompetitionRequestDTO;
import com.FTTT.Competition_Service.dto.CompetitionResponseDTO;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.services.CompetitionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * API compétitions — calendrier avant /{id} pour éviter la capture de "calendar" comme identifiant.
 */
@RestController
@RequestMapping(value = "/api/competitions", produces = MediaType.APPLICATION_JSON_VALUE)
public class CompetitionController {

    private final CompetitionService competitionService;

    public CompetitionController(CompetitionService competitionService) {
        this.competitionService = competitionService;
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<CompetitionCalendarDTO>> getCompetitionCalendar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "category", required = false) CompetitionCategory category,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<CompetitionCalendarDTO> calendarData = competitionService.getCompetitionCalendar(
                category, location, startDate, endDate, jwt);
        return ResponseEntity.ok(calendarData);
    }

    @GetMapping
    public ResponseEntity<List<CompetitionResponseDTO>> listCompetitions(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(competitionService.listCompetitions(jwt));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetitionResponseDTO> getCompetitionById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(competitionService.getCompetitionById(id, jwt));
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CompetitionResponseDTO> createCompetition(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CompetitionRequestDTO requestDTO) {
        CompetitionResponseDTO response = competitionService.createCompetition(requestDTO, jwt);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PutMapping("/{id}")
    public ResponseEntity<CompetitionResponseDTO> updateCompetition(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id,
            @Valid @RequestBody CompetitionRequestDTO requestDTO) {
        return ResponseEntity.ok(competitionService.updateCompetition(id, requestDTO, jwt));
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompetition(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        competitionService.deleteCompetition(id, jwt);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PostMapping("/{id}/publish")
    public ResponseEntity<CompetitionResponseDTO> publish(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(competitionService.publishCompetition(id, jwt));
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PostMapping("/{id}/unpublish")
    public ResponseEntity<CompetitionResponseDTO> unpublish(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(competitionService.unpublishCompetition(id, jwt));
    }
}
