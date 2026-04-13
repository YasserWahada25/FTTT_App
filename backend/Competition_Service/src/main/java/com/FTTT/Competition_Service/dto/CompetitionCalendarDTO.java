package com.FTTT.Competition_Service.dto;

import java.time.LocalDateTime;

/**
 * DTO pour l'affichage des compétitions dans un calendrier
 * Contient uniquement les informations essentielles pour la vue calendrier
 */
public class CompetitionCalendarDTO {

    private String name;
    private String location;
    private LocalDateTime startDate;
    private String category;

    // Constructeurs
    public CompetitionCalendarDTO() {
    }

    public CompetitionCalendarDTO(String name, String location, LocalDateTime startDate, String category) {
        this.name = name;
        this.location = location;
        this.startDate = startDate;
        this.category = category;
    }

    // Getters et Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}