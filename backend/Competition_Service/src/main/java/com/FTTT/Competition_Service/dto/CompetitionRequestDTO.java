package com.FTTT.Competition_Service.dto;

import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.entities.CompetitionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * DTO pour les requêtes de création et modification de compétition
 */
public class CompetitionRequestDTO {

    @NotBlank(message = "Le nom de la compétition est obligatoire")
    private String name;

    private String description;

    private String location;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @NotNull(message = "Le statut est obligatoire")
    private CompetitionStatus status;

    @NotNull(message = "La catégorie est obligatoire")
    private CompetitionCategory category;

    // Constructeurs
    public CompetitionRequestDTO() {
    }

    public CompetitionRequestDTO(String name, String description, String location, 
                                LocalDateTime startDate, LocalDateTime endDate, 
                                CompetitionStatus status, CompetitionCategory category) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.category = category;
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public CompetitionStatus getStatus() {
        return status;
    }

    public CompetitionCategory getCategory() {
        return category;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public void setStatus(CompetitionStatus status) {
        this.status = status;
    }

    public void setCategory(CompetitionCategory category) {
        this.category = category;
    }
}
