package com.FTTTApp.club_service.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "club_members", uniqueConstraints = {
        @UniqueConstraint(name = "uk_club_player", columnNames = {"club_id", "player_user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    /** Identifiant Keycloak (sub) du joueur. */
    @Column(name = "player_user_id", nullable = false, length = 128)
    private String playerUserId;

    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
