package com.FTTTApp.club_service.DTO; // Change le package pour le terrain-service

public class TerrainEventDTO {
    private String message;
    private Long clubId;

    // Constructeurs
    public TerrainEventDTO() {}

    public TerrainEventDTO(String message, Long clubId) {
        this.message = message;
        this.clubId = clubId;
    }

    // Getters et Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
}