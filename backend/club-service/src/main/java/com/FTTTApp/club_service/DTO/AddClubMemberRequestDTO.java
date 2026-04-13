package com.FTTTApp.club_service.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddClubMemberRequestDTO {

    @NotBlank(message = "L'identifiant joueur (Keycloak sub) est obligatoire")
    private String playerUserId;
}
