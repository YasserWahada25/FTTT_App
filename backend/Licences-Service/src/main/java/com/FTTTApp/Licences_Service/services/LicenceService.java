package com.FTTTApp.Licences_Service.services;

import com.FTTTApp.Licences_Service.dto.LicenceRequest;
import com.FTTTApp.Licences_Service.dto.LicenceResponse;
import com.FTTTApp.Licences_Service.dto.RejectRequest;
import com.FTTTApp.Licences_Service.entities.Licence;
import com.FTTTApp.Licences_Service.entities.LicenceStatus;
import com.FTTTApp.Licences_Service.entities.PaymentStatus;
import com.FTTTApp.Licences_Service.repositories.LicenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LicenceService {

    private final LicenceRepository licenceRepository;

    public LicenceService(LicenceRepository licenceRepository) {
        this.licenceRepository = licenceRepository;
    }

    @Transactional(readOnly = true)
    public List<LicenceResponse> findAll() {
        return licenceRepository.findAll().stream()
                .map(LicenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<LicenceResponse> findById(Long id) {
        return licenceRepository.findById(id).map(LicenceResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<LicenceResponse> findByPlayerId(String playerId) {
        return licenceRepository.findByPlayerId(playerId).stream()
                .map(LicenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Filtre par statut : pending, approved, rejected, active, expired.
     * - active = approuvées et non expirées
     * - expired = approuvées et expirées
     */
    @Transactional(readOnly = true)
    public List<LicenceResponse> findByStatus(String status) {
        LocalDate today = LocalDate.now();
        String lower = status != null ? status.trim().toLowerCase() : "";

        switch (lower) {
            case "pending":
                return licenceRepository.findByStatus(LicenceStatus.PENDING).stream()
                        .map(LicenceResponse::fromEntity)
                        .collect(Collectors.toList());
            case "approved":
                return licenceRepository.findByStatus(LicenceStatus.APPROVED).stream()
                        .map(LicenceResponse::fromEntity)
                        .collect(Collectors.toList());
            case "rejected":
                return licenceRepository.findByStatus(LicenceStatus.REJECTED).stream()
                        .map(LicenceResponse::fromEntity)
                        .collect(Collectors.toList());
            case "active":
                return licenceRepository.findApprovedNotExpired(LicenceStatus.APPROVED, today).stream()
                        .map(LicenceResponse::fromEntity)
                        .collect(Collectors.toList());
            case "expired":
                return licenceRepository.findApprovedExpired(LicenceStatus.APPROVED, today).stream()
                        .map(LicenceResponse::fromEntity)
                        .collect(Collectors.toList());
            default:
                return findAll();
        }
    }

    @Transactional
    public LicenceResponse create(LicenceRequest request) {
        Licence licence = new Licence();
        licence.setLicenseNumber(generateLicenseNumber());
        licence.setPlayerId(request.getPlayerId());
        licence.setPlayerName(request.getPlayerName());
        licence.setClubId(request.getClubId());
        licence.setClubName(request.getClubName());
        licence.setSeason(request.getSeason() != null ? request.getSeason() : defaultSeason());
        licence.setCategory(request.getCategory());
        licence.setStatus(LicenceStatus.PENDING);
        licence.setRequestDate(LocalDate.now());
        licence.setExpiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : defaultExpiryDate());
        licence.setAmount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO);
        licence.setPaymentStatus(PaymentStatus.PENDING);
        licence.setNotes(request.getNotes());
        return LicenceResponse.fromEntity(licenceRepository.save(licence));
    }

    @Transactional
    public Optional<LicenceResponse> approve(Long id) {
        return licenceRepository.findById(id)
                .filter(l -> l.getStatus() == LicenceStatus.PENDING)
                .map(l -> {
                    l.setStatus(LicenceStatus.APPROVED);
                    l.setApprovalDate(LocalDate.now());
                    return LicenceResponse.fromEntity(licenceRepository.save(l));
                });
    }

    @Transactional
    public Optional<LicenceResponse> reject(Long id, RejectRequest body) {
        return licenceRepository.findById(id)
                .filter(l -> l.getStatus() == LicenceStatus.PENDING)
                .map(l -> {
                    l.setStatus(LicenceStatus.REJECTED);
                    if (body != null && body.getNotes() != null) {
                        l.setNotes(body.getNotes());
                    }
                    return LicenceResponse.fromEntity(licenceRepository.save(l));
                });
    }

    private String generateLicenseNumber() {
        int year = LocalDate.now().getYear();
        long n = licenceRepository.count() + 1;
        return String.format("FTTT-%d-%05d", year, n % 100000);
    }

    private static String defaultSeason() {
        int year = LocalDate.now().getYear();
        return year + "-" + (year + 1);
    }

    private static LocalDate defaultExpiryDate() {
        int year = LocalDate.now().getYear();
        return LocalDate.of(year + 1, 8, 31); // fin saison typique
    }
}
