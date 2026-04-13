package com.FTTT.Competition_Service.repositories;

import com.FTTT.Competition_Service.entities.Competition;
import com.FTTT.Competition_Service.entities.CompetitionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour la gestion des compétitions
 */
@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    /**
     * Récupérer les compétitions par catégorie
     */
    List<Competition> findByCategory(CompetitionCategory category);

    /**
     * Récupérer les compétitions par lieu
     */
    List<Competition> findByLocationContainingIgnoreCase(String location);

    /**
     * Récupérer les compétitions dans un intervalle de dates
     */
    @Query("SELECT c FROM Competition c WHERE c.startDate BETWEEN :startDate AND :endDate")
    List<Competition> findByStartDateBetween(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * Récupérer les compétitions avec filtres combinés
     */
    @Query("SELECT c FROM Competition c WHERE " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:location IS NULL OR LOWER(c.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:startDate IS NULL OR c.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR c.startDate <= :endDate)")
    List<Competition> findCompetitionsWithFilters(@Param("category") CompetitionCategory category,
                                                 @Param("location") String location,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);
}
