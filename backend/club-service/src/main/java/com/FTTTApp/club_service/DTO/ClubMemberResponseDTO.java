package com.FTTTApp.club_service.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClubMemberResponseDTO {
    private Long id;
    private String playerUserId;
    private LocalDateTime joinedAt;
}
