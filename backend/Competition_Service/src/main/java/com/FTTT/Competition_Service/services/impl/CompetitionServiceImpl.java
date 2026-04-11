package com.FTTT.Competition_Service.services.impl;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.dto.CompetitionRequestDTO;
import com.FTTT.Competition_Service.dto.CompetitionResponseDTO;
import com.FTTT.Competition_Service.entities.Competition;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.repositories.CompetitionRepository;
import com.FTTT.Competition_Service.services.CompetitionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de gestion des compétitions
 */
@Service
@Transactional
public class CompetitionServiceImpl implements CompetitionService {

    private final CompetitionRepository competitionRepository;

    public CompetitionServiceImpl(CompetitionRepository competitionRepository) {
        this.competitionRepository = competitionRepository;
    }

    @Override
    public CompetitionResponseDTO createCompetition(CompetitionRequestDTO requestDTO) {
        System.out.println("Création d'une nouvelle compétition : " + requestDTO.getName());
        
        Competition competition = mapToEntity(requestDTO);
        Competition savedCompetition = competitionRepository.save(competition);
        
        System.out.println("Compétition créée avec succès avec l'ID : " + savedCompetition.getId());
        return mapToDTO(savedCompetition);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionResponseDTO> getAllCompetitions() {
        System.out.println("Récupération de toutes les compétitions");
        
        List<Competition> competitions = competitionRepository.findAll();
        
        System.out.println("Nombre de compétitions trouvées : " + competitions.size());
        return competitions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompetitionResponseDTO getCompetitionById(Long id) {
        System.out.println("Récupération de la compétition avec l'ID : " + id);
        
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competition non trouvée avec l'ID : " + id));
        
        return mapToDTO(competition);
    }

    @Override
    public CompetitionResponseDTO updateCompetition(Long id, CompetitionRequestDTO requestDTO) {
        System.out.println("Mise à jour de la compétition avec l'ID : " + id);
        
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competition non trouvée avec l'ID : " + id));

        // Mise à jour des champs
        competition.setName(requestDTO.getName());
        competition.setDescription(requestDTO.getDescription());
        competition.setLocation(requestDTO.getLocation());
        competition.setStartDate(requestDTO.getStartDate());
        competition.setEndDate(requestDTO.getEndDate());
        competition.setStatus(requestDTO.getStatus());
        competition.setCategory(requestDTO.getCategory());

        Competition updatedCompetition = competitionRepository.save(competition);
        
        System.out.println("Compétition mise à jour avec succès : " + updatedCompetition.getId());
        return mapToDTO(updatedCompetition);
    }

    @Override
    public void deleteCompetition(Long id) {
        System.out.println("Suppression de la compétition avec l'ID : " + id);
        
        Competition competition = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competition non trouvée avec l'ID : " + id));

        competitionRepository.delete(competition);
        
        System.out.println("Compétition supprimée avec succès : " + id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionCalendarDTO> getCompetitionCalendar(CompetitionCategory category,
                                                              String location,
                                                              LocalDateTime startDate,
                                                              LocalDateTime endDate) {
        System.out.println("Récupération du calendrier des compétitions avec filtres");
        
        List<Competition> competitions = competitionRepository.findCompetitionsWithFilters(
                category, location, startDate, endDate);
        
        System.out.println("Nombre de compétitions trouvées pour le calendrier : " + competitions.size());
        
        return competitions.stream()
                .map(this::mapToCalendarDTO)
                .sorted(Comparator.comparing(CompetitionCalendarDTO::getStartDate))
                .collect(Collectors.toList());
    }

    /**
     * Mapper DTO vers Entity
     */
    private Competition mapToEntity(CompetitionRequestDTO dto) {
        Competition competition = new Competition();
        competition.setName(dto.getName());
        competition.setDescription(dto.getDescription());
        competition.setLocation(dto.getLocation());
        competition.setStartDate(dto.getStartDate());
        competition.setEndDate(dto.getEndDate());
        competition.setStatus(dto.getStatus());
        competition.setCategory(dto.getCategory());
        return competition;
    }

    /**
     * Mapper Entity vers DTO
     */
    private CompetitionResponseDTO mapToDTO(Competition competition) {
        return new CompetitionResponseDTO(
                competition.getId(),
                competition.getName(),
                competition.getDescription(),
                competition.getLocation(),
                competition.getStartDate(),
                competition.getEndDate(),
                competition.getStatus(),
                competition.getCategory(),
                competition.getCreatedAt()
        );
    }

    /**
     * Mapper Entity vers CompetitionCalendarDTO
     */
    private CompetitionCalendarDTO mapToCalendarDTO(Competition competition) {
        return new CompetitionCalendarDTO(
                competition.getName(),
                competition.getLocation(),
                competition.getStartDate(),
                competition.getCategory().name()
        );
    }
}
