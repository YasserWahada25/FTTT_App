package com.FTTT.Competition_Service.controllers;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.dto.CompetitionRequestDTO;
import com.FTTT.Competition_Service.dto.CompetitionResponseDTO;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.services.CompetitionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Contrôleur REST pour la gestion des compétitions
 */
@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {

    private final CompetitionService competitionService;

    public CompetitionController(CompetitionService competitionService) {
        this.competitionService = competitionService;
    }

    /**
     * Créer une nouvelle compétition
     * POST /api/competitions
     */
    @PostMapping
    public ResponseEntity<CompetitionResponseDTO> createCompetition(
            @Valid @RequestBody CompetitionRequestDTO requestDTO) {
        
        System.out.println("Requête POST reçue pour créer une compétition : " + requestDTO.getName());
        
        CompetitionResponseDTO response = competitionService.createCompetition(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Récupérer toutes les compétitions
     * GET /api/competitions
     */
    @GetMapping
    public ResponseEntity<List<CompetitionResponseDTO>> getAllCompetitions() {
        System.out.println("Requête GET reçue pour récupérer toutes les compétitions");
        
        List<CompetitionResponseDTO> competitions = competitionService.getAllCompetitions();
        return ResponseEntity.ok(competitions);
    }

    /**
     * Récupérer une compétition par son ID
     * GET /api/competitions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompetitionResponseDTO> getCompetitionById(@PathVariable("id") Long id) {
        System.out.println("Requête GET reçue pour récupérer la compétition avec l'ID : " + id);
        
        CompetitionResponseDTO response = competitionService.getCompetitionById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Mettre à jour une compétition existante
     * PUT /api/competitions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompetitionResponseDTO> updateCompetition(
            @PathVariable("id") Long id,
            @Valid @RequestBody CompetitionRequestDTO requestDTO) {
        
        System.out.println("Requête PUT reçue pour mettre à jour la compétition avec l'ID : " + id);
        
        CompetitionResponseDTO response = competitionService.updateCompetition(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Supprimer une compétition
     * DELETE /api/competitions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompetition(@PathVariable("id") Long id) {
        System.out.println("Requête DELETE reçue pour supprimer la compétition avec l'ID : " + id);
        
        competitionService.deleteCompetition(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Récupérer les compétitions pour l'affichage calendrier
     * GET /api/competitions/calendar
     * 
     * Paramètres optionnels :
     * - category : filtrer par catégorie (CHAMPIONNAT, COUPE, AMICAL, TOURNOI)
     * - location : filtrer par lieu (recherche partielle)
     * - startDate : date de début pour filtrer (format: yyyy-MM-dd'T'HH:mm:ss)
     * - endDate : date de fin pour filtrer (format: yyyy-MM-dd'T'HH:mm:ss)
     */
    @GetMapping("/calendar")
    public ResponseEntity<List<CompetitionCalendarDTO>> getCompetitionCalendar(
            @RequestParam(name = "category", required = false) CompetitionCategory category,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        System.out.println("Requête GET reçue pour le calendrier des compétitions");
        System.out.println("Filtres - Catégorie: " + category + ", Lieu: " + location + 
                          ", Date début: " + startDate + ", Date fin: " + endDate);
        
        List<CompetitionCalendarDTO> calendarData = competitionService.getCompetitionCalendar(
                category, location, startDate, endDate);
        
        return ResponseEntity.ok(calendarData);
    }
}
