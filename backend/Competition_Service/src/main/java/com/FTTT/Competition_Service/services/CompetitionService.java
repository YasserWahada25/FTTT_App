package com.FTTT.Competition_Service.services;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.dto.CompetitionRequestDTO;
import com.FTTT.Competition_Service.dto.CompetitionResponseDTO;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDateTime;
import java.util.List;

public interface CompetitionService {

    CompetitionResponseDTO createCompetition(CompetitionRequestDTO requestDTO, Jwt jwt);

    List<CompetitionResponseDTO> listCompetitions(Jwt jwt);

    CompetitionResponseDTO getCompetitionById(Long id, Jwt jwt);

    CompetitionResponseDTO updateCompetition(Long id, CompetitionRequestDTO requestDTO, Jwt jwt);

    void deleteCompetition(Long id, Jwt jwt);

    CompetitionResponseDTO publishCompetition(Long id, Jwt jwt);

    CompetitionResponseDTO unpublishCompetition(Long id, Jwt jwt);

    List<CompetitionCalendarDTO> getCompetitionCalendar(CompetitionCategory category,
                                                        String location,
                                                        LocalDateTime startDate,
                                                        LocalDateTime endDate,
                                                        Jwt jwt);
}
