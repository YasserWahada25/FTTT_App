package com.FTTT.Competition_Service.dto;

import com.FTTT.Competition_Service.entities.CompetitionCategory;
import com.FTTT.Competition_Service.entities.CompetitionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO pour les requêtes de création et modification de compétition.
 */
public class CompetitionRequestDTO {

    @NotBlank(message = "Le nom de la compétition est obligatoire")
    private String name;

    private String description;

    private String location;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    /** Si absent à la création, UPCOMING est appliqué côté serveur. */
    private CompetitionStatus status;

    @NotNull(message = "Le format (catégorie) est obligatoire")
    private CompetitionCategory category;

    /** Ex. Senior Hommes, Juniors — affichage et filtrage métier. */
    private String sportCategoryLabel;

    private String organizerName;

    private String rules;

    private String prize;

    private Integer maxParticipants;

    private Integer currentParticipants;

    private LocalDateTime registrationDeadline;

    private Boolean published;

    /** Rôles Keycloak ciblés lors de la publication (vide = tous les utilisateurs connectés). */
    private List<String> targetRoles = new ArrayList<>();

    public CompetitionRequestDTO() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public CompetitionStatus getStatus() {
        return status;
    }

    public void setStatus(CompetitionStatus status) {
        this.status = status;
    }

    public CompetitionCategory getCategory() {
        return category;
    }

    public void setCategory(CompetitionCategory category) {
        this.category = category;
    }

    public String getSportCategoryLabel() {
        return sportCategoryLabel;
    }

    public void setSportCategoryLabel(String sportCategoryLabel) {
        this.sportCategoryLabel = sportCategoryLabel;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getPrize() {
        return prize;
    }

    public void setPrize(String prize) {
        this.prize = prize;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public Integer getCurrentParticipants() {
        return currentParticipants;
    }

    public void setCurrentParticipants(Integer currentParticipants) {
        this.currentParticipants = currentParticipants;
    }

    public LocalDateTime getRegistrationDeadline() {
        return registrationDeadline;
    }

    public void setRegistrationDeadline(LocalDateTime registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public Boolean getPublished() {
        return published;
    }

    public void setPublished(Boolean published) {
        this.published = published;
    }

    public List<String> getTargetRoles() {
        return targetRoles;
    }

    public void setTargetRoles(List<String> targetRoles) {
        this.targetRoles = targetRoles != null ? targetRoles : new ArrayList<>();
    }
}
