package com.FTTT.Competition_Service.services;

import com.FTTT.Competition_Service.dto.CompetitionCalendarDTO;
import com.FTTT.Competition_Service.entities.Competition;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.entities.CompetitionStatus;
import com.FTTT.Competition_Service.repositories.CompetitionRepository;
import com.FTTT.Competition_Service.services.impl.CompetitionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires pour la fonctionnalité calendrier des compétitions
 */
@ExtendWith(MockitoExtension.class)
class CompetitionCalendarServiceTest {

    @Mock
    private CompetitionRepository competitionRepository;

    @InjectMocks
    private CompetitionServiceImpl competitionService;

    private Competition competition1;
    private Competition competition2;

    @BeforeEach
    void setUp() {
        competition1 = new Competition();
        competition1.setId(1L);
        competition1.setName("Ligue 1");
        competition1.setLocation("Tunisie");
        competition1.setStartDate(LocalDateTime.of(2026, 3, 1, 10, 0));
        competition1.setCategory(CompetitionCategory.CHAMPIONNAT);
        competition1.setStatus(CompetitionStatus.UPCOMING);
        competition1.setPublished(true);

        competition2 = new Competition();
        competition2.setId(2L);
        competition2.setName("Coupe Nationale");
        competition2.setLocation("France");
        competition2.setStartDate(LocalDateTime.of(2026, 4, 10, 15, 0));
        competition2.setCategory(CompetitionCategory.COUPE);
        competition2.setStatus(CompetitionStatus.UPCOMING);
        competition2.setPublished(true);
    }

    @Test
    void testGetCompetitionCalendar_ShouldReturnSortedList() {
        // Given
        List<Competition> competitions = Arrays.asList(competition2, competition1); // Ordre inversé
        when(competitionRepository.findCompetitionsWithFilters(any(), any(), any(), any()))
                .thenReturn(competitions);

        // When
        List<CompetitionCalendarDTO> result = competitionService.getCompetitionCalendar(
                null, null, null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        // Vérifier que les résultats sont triés par date de début
        assertEquals("Ligue 1", result.get(0).getName());
        assertEquals("Coupe Nationale", result.get(1).getName());
        
        // Vérifier le contenu du premier élément
        CompetitionCalendarDTO first = result.get(0);
        assertEquals("Ligue 1", first.getName());
        assertEquals("Tunisie", first.getLocation());
        assertEquals(LocalDateTime.of(2026, 3, 1, 10, 0), first.getStartDate());
        assertEquals("CHAMPIONNAT", first.getCategory());
    }

    @Test
    void testGetCompetitionCalendar_WithCategoryFilter() {
        // Given
        List<Competition> competitions = Arrays.asList(competition1);
        when(competitionRepository.findCompetitionsWithFilters(
                eq(CompetitionCategory.CHAMPIONNAT), any(), any(), any()))
                .thenReturn(competitions);

        // When
        List<CompetitionCalendarDTO> result = competitionService.getCompetitionCalendar(
                CompetitionCategory.CHAMPIONNAT, null, null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("CHAMPIONNAT", result.get(0).getCategory());
    }

    @Test
    void testGetCompetitionCalendar_WithLocationFilter() {
        // Given
        List<Competition> competitions = Arrays.asList(competition2);
        when(competitionRepository.findCompetitionsWithFilters(
                any(), eq("France"), any(), any()))
                .thenReturn(competitions);

        // When
        List<CompetitionCalendarDTO> result = competitionService.getCompetitionCalendar(
                null, "France", null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("France", result.get(0).getLocation());
    }

    @Test
    void testGetCompetitionCalendar_EmptyResult() {
        // Given
        when(competitionRepository.findCompetitionsWithFilters(any(), any(), any(), any()))
                .thenReturn(Arrays.asList());

        // When
        List<CompetitionCalendarDTO> result = competitionService.getCompetitionCalendar(
                null, null, null, null, null);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}