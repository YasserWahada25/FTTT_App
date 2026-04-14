package com.FTTTApp.Licences_Service.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "licences")
public class Licence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_number", unique = true, nullable = false, length = 50)
    private String licenseNumber;

    @Column(name = "player_id", nullable = false, length = 50)
    private String playerId;

    @Column(name = "player_name", nullable = false, length = 255)
    private String playerName;

    @Column(name = "club_id", nullable = false, length = 50)
    private String clubId;

    @Column(name = "club_name", nullable = false, length = 255)
    private String clubName;

    @Column(name = "season", length = 20)
    private String season;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LicenceStatus status = LicenceStatus.PENDING;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "notes", length = 1000)
    private String notes;

    /** Chemin relatif sous app.licenses.upload-dir (ex.42/medical.pdf). */
    @Column(name = "medical_certificate_path", length = 512)
    private String medicalCertificatePath;

    @Column(name = "identity_photo_path", length = 512)
    private String identityPhotoPath;

    /** Référence à la licence précédente lors d'un renouvellement (chaîne de dossiers). */
    @Column(name = "renewed_from_licence_id")
    private Long renewedFromLicenceId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public String getClubId() { return clubId; }
    public void setClubId(String clubId) { this.clubId = clubId; }

    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LicenceStatus getStatus() { return status; }
    public void setStatus(LicenceStatus status) { this.status = status; }

    public LocalDate getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }

    public LocalDate getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDate approvalDate) { this.approvalDate = approvalDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getMedicalCertificatePath() { return medicalCertificatePath; }
    public void setMedicalCertificatePath(String medicalCertificatePath) { this.medicalCertificatePath = medicalCertificatePath; }

    public String getIdentityPhotoPath() { return identityPhotoPath; }
    public void setIdentityPhotoPath(String identityPhotoPath) { this.identityPhotoPath = identityPhotoPath; }

    public Long getRenewedFromLicenceId() { return renewedFromLicenceId; }
    public void setRenewedFromLicenceId(Long renewedFromLicenceId) { this.renewedFromLicenceId = renewedFromLicenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
