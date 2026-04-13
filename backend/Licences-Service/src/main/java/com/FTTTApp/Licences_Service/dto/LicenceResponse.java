package com.FTTTApp.Licences_Service.dto;

import com.FTTTApp.Licences_Service.entities.Licence;
import com.FTTTApp.Licences_Service.entities.LicenceStatus;
import com.FTTTApp.Licences_Service.entities.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LicenceResponse {

    private Long id;
    private String licenseNumber;
    private String playerId;
    private String playerName;
    private String clubId;
    private String clubName;
    private String season;
    private String category;
    private LicenceStatus status;
    private LocalDate requestDate;
    private LocalDate approvalDate;
    private LocalDate expiryDate;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private String notes;
    private Long renewedFromLicenceId;
    /** True si statut APPROVED et date d'expiration non dépassée (aujourdhui). */
    private boolean validNow;
    /** True si statut APPROVED et expirée par la date. */
    private boolean expiredByDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LicenceResponse fromEntity(Licence licence) {
        LocalDate today = LocalDate.now();
        LicenceResponse dto = new LicenceResponse();
        dto.id = licence.getId();
        dto.licenseNumber = licence.getLicenseNumber();
        dto.playerId = licence.getPlayerId();
        dto.playerName = licence.getPlayerName();
        dto.clubId = licence.getClubId();
        dto.clubName = licence.getClubName();
        dto.season = licence.getSeason();
        dto.category = licence.getCategory();
        dto.status = licence.getStatus();
        dto.requestDate = licence.getRequestDate();
        dto.approvalDate = licence.getApprovalDate();
        dto.expiryDate = licence.getExpiryDate();
        dto.amount = licence.getAmount();
        dto.paymentStatus = licence.getPaymentStatus();
        dto.notes = licence.getNotes();
        dto.renewedFromLicenceId = licence.getRenewedFromLicenceId();
        dto.validNow = licence.getStatus() == LicenceStatus.APPROVED
                && !today.isAfter(licence.getExpiryDate());
        dto.expiredByDate = licence.getStatus() == LicenceStatus.APPROVED
                && today.isAfter(licence.getExpiryDate());
        dto.createdAt = licence.getCreatedAt();
        dto.updatedAt = licence.getUpdatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public String getClubId() {
        return clubId;
    }

    public String getClubName() {
        return clubName;
    }

    public String getSeason() {
        return season;
    }

    public String getCategory() {
        return category;
    }

    public LicenceStatus getStatus() {
        return status;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public LocalDate getApprovalDate() {
        return approvalDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public String getNotes() {
        return notes;
    }

    public Long getRenewedFromLicenceId() {
        return renewedFromLicenceId;
    }

    public boolean isValidNow() {
        return validNow;
    }

    public boolean isExpiredByDate() {
        return expiredByDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

