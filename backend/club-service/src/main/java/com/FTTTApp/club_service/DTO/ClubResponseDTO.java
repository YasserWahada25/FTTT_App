package com.FTTTApp.club_service.DTO;

import com.FTTTApp.club_service.Entity.ClubStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClubResponseDTO {
    private Long id;
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
    private String managerUserId;
    private ClubStatus status;
    private long membersCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
