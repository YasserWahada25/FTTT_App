package com.FTTT.Competition_Service.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entité représentant une compétition sportive
 */
@Entity
@Table(name = "competitions")
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String location;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompetitionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompetitionCategory category;

    /** Libellé métier (ex. Senior Hommes), distinct du type CHAMPIONNAT / COUPE. */
    @Column(name = "sport_category_label", length = 120)
    private String sportCategoryLabel;

    @Column(name = "organizer_name", length = 255)
    private String organizerName;

    @Column(columnDefinition = "TEXT")
    private String rules;

    @Column(length = 500)
    private String prize;

    @Column(name = "max_participants")
    private Integer maxParticipants = 32;

    @Column(name = "current_participants")
    private Integer currentParticipants = 0;

    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;

    /** Visible pour le public cible (utilisateurs authentifiés correspondant à {@link #targetRolesCsv}). */
    @Column(nullable = false)
    private boolean published = false;

    /** Rôles cibles séparés par virgule (ex. PLAYER,COACH). Vide ou null = tous les rôles authentifiés. */
    @Column(name = "target_roles_csv", length = 512)
    private String targetRolesCsv;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructeurs
    public Competition() {
    }

    public Competition(Long id, String name, String description, String location,
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

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public String getTargetRolesCsv() {
        return targetRolesCsv;
    }

    public void setTargetRolesCsv(String targetRolesCsv) {
        this.targetRolesCsv = targetRolesCsv;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
