package com.FTTT.Competition_Service.controllers;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.services.CompetitionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour l'endpoint calendrier des compétitions
 */
@WebMvcTest(CompetitionController.class)
class CompetitionCalendarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CompetitionService competitionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetCompetitionCalendar_ShouldReturnCalendarData() throws Exception {
        // Given
        List<CompetitionCalendarDTO> calendarData = Arrays.asList(
                new CompetitionCalendarDTO("Ligue 1", "Tunisie", 
                        LocalDateTime.of(2026, 3, 1, 10, 0), "CHAMPIONNAT"),
                new CompetitionCalendarDTO("Coupe Nationale", "France", 
                        LocalDateTime.of(2026, 4, 10, 15, 0), "COUPE")
        );

        when(competitionService.getCompetitionCalendar(any(), any(), any(), any()))
                .thenReturn(calendarData);

        // When & Then
        mockMvc.perform(get("/api/competitions/calendar")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Ligue 1"))
                .andExpect(jsonPath("$[0].location").value("Tunisie"))
                .andExpect(jsonPath("$[0].category").value("CHAMPIONNAT"))
                .andExpect(jsonPath("$[1].name").value("Coupe Nationale"))
                .andExpect(jsonPath("$[1].location").value("France"))
                .andExpect(jsonPath("$[1].category").value("COUPE"));
    }

    @Test
    void testGetCompetitionCalendar_WithCategoryFilter() throws Exception {
        // Given
        List<CompetitionCalendarDTO> calendarData = Arrays.asList(
                new CompetitionCalendarDTO("Ligue 1", "Tunisie", 
                        LocalDateTime.of(2026, 3, 1, 10, 0), "CHAMPIONNAT")
        );

        when(competitionService.getCompetitionCalendar(
                eq(CompetitionCategory.CHAMPIONNAT), any(), any(), any()))
                .thenReturn(calendarData);

        // When & Then
        mockMvc.perform(get("/api/competitions/calendar")
                        .param("category", "CHAMPIONNAT")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].category").value("CHAMPIONNAT"));
    }

    @Test
    void testGetCompetitionCalendar_WithLocationFilter() throws Exception {
        // Given
        List<CompetitionCalendarDTO> calendarData = Arrays.asList(
                new CompetitionCalendarDTO("Coupe Nationale", "France", 
                        LocalDateTime.of(2026, 4, 10, 15, 0), "COUPE")
        );

        when(competitionService.getCompetitionCalendar(
                any(), eq("France"), any(), any()))
                .thenReturn(calendarData);

        // When & Then
        mockMvc.perform(get("/api/competitions/calendar")
                        .param("location", "France")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].location").value("France"));
    }

    @Test
    void testGetCompetitionCalendar_EmptyResult() throws Exception {
        // Given
        when(competitionService.getCompetitionCalendar(any(), any(), any(), any()))
                .thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/competitions/calendar")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}