package com.FTTTApp.club_service.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Club {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // On utilise Long pour la DB, mais exposé en String via Jackson si besoin

    private String name;
    private String code;
    private String logo;
    private String address;
    private String city;
    private String region;
    private String phone;
    private String email;
    private String website;
    private int foundedYear;

    @Enumerated(EnumType.STRING)
    private ClubStatus status = ClubStatus.active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
