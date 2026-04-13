package com.FTTTApp.club_service.DTO;

import com.FTTTApp.club_service.Entity.ClubStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ClubRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private String logo;
    private String address;
    private String city;
    private String region;
    private String phone;

    /** Vide ou adresse e-mail valide (évite l'échec de @Email sur chaîne vide). */
    @Pattern(regexp = "^$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Email invalide")
    private String email;

    private String website;

    @NotNull
    @PositiveOrZero
    private Integer foundedYear;

    private ClubStatus status;

    /** Identifiant Keycloak du responsable club (optionnel). */
    private String managerUserId;
}
