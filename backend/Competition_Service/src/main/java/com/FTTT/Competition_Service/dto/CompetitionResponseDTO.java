package com.FTTT.Competition_Service.dto;

import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.entities.CompetitionStatus;

import java.time.LocalDateTime;

/**
 * DTO pour les réponses contenant les informations d'une compétition
 */
public class CompetitionResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String location;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private CompetitionStatus status;
    private CompetitionCategory category;
    private LocalDateTime createdAt;

    // Constructeurs
    public CompetitionResponseDTO() {
    }

    public CompetitionResponseDTO(Long id, String name, String description, String location,
                                 LocalDateTime startDate, LocalDateTime endDate,
                                 CompetitionStatus status, CompetitionCategory category,
                                 LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.category = category;
        this.createdAt = createdAt;
    }

    // Getters
    public Long getId() {
        return id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
