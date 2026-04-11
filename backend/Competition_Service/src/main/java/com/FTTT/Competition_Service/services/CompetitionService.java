package com.FTTT.Competition_Service.services;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.dto.CompetitionRequestDTO;
import com.FTTT.Competition_Service.dto.CompetitionResponseDTO;
import com.FTTT.Competition_Service.entities.CompetitionCategory;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface du service de gestion des compétitions
 */
public interface CompetitionService {

    /**
     * Créer une nouvelle compétition
     */
    CompetitionResponseDTO createCompetition(CompetitionRequestDTO requestDTO);

    /**
     * Récupérer toutes les compétitions
     */
    List<CompetitionResponseDTO> getAllCompetitions();

    /**
     * Récupérer une compétition par son ID
     */
    CompetitionResponseDTO getCompetitionById(Long id);

    /**
     * Mettre à jour une compétition existante
     */
    CompetitionResponseDTO updateCompetition(Long id, CompetitionRequestDTO requestDTO);

    /**
     * Supprimer une compétition
     */
    void deleteCompetition(Long id);

    /**
     * Récupérer les compétitions pour l'affichage calendrier
     * avec filtres optionnels
     */
    List<CompetitionCalendarDTO> getCompetitionCalendar(CompetitionCategory category,
                                                       String location,
                                                       LocalDateTime startDate,
                                                       LocalDateTime endDate);
}
