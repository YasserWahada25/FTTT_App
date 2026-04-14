package com.FTTTApp.Licences_Service.controllers;

import com.FTTTApp.Licences_Service.dto.LicenceRenewalRequest;
import com.FTTTApp.Licences_Service.dto.LicenceRequest;
import com.FTTTApp.Licences_Service.dto.LicenceResponse;
import com.FTTTApp.Licences_Service.dto.LicenceValidityResponse;
import com.FTTTApp.Licences_Service.dto.RejectRequest;
import com.FTTTApp.Licences_Service.services.LicenceService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(value = "/api/licenses", produces = MediaType.APPLICATION_JSON_VALUE)
public class LicenceController {

    private final LicenceService licenceService;

    public LicenceController(LicenceService licenceService) {
        this.licenceService = licenceService;
    }

    /**
     * Liste filtrée selon le rôle (fédération : tout ou club optionnel ; club / coach : leur club).
     */
    @GetMapping
    public ResponseEntity<List<LicenceResponse>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "clubId", required = false) String clubId
    ) {
        return ResponseEntity.ok(licenceService.listForPrincipal(jwt, status, clubId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<LicenceResponse>> myLicenses(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(licenceService.findMine(jwt));
    }

    @GetMapping("/verify")
    public ResponseEntity<LicenceValidityResponse> verify(
            @RequestParam(name = "number") String licenseNumber
    ) {
        return ResponseEntity.ok(licenceService.verifyByNumber(licenseNumber));
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<LicenceResponse>> byPlayer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("playerId") String playerId
    ) {
        return ResponseEntity.ok(licenceService.findByPlayerIdForPrincipal(jwt, playerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LicenceResponse>> byStatusPath(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("status") String status
    ) {
        return ResponseEntity.ok(licenceService.listForPrincipal(jwt, status, null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LicenceResponse> getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id
    ) {
        return licenceService.findByIdForPrincipal(jwt, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LicenceResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody LicenceRequest request
    ) {
        LicenceResponse created = licenceService.createForPrincipal(jwt, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Création avec pièces jointes (certificat médical + photo d'identité), conforme au parcours « Nouvelle demande ».
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LicenceResponse> createWithDocuments(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("payload") @Valid LicenceRequest request,
            @RequestPart("medicalCertificate") MultipartFile medicalCertificate,
            @RequestPart("identityPhoto") MultipartFile identityPhoto
    ) {
        LicenceResponse created = licenceService.createWithDocumentsForPrincipal(
                jwt, request, medicalCertificate, identityPhoto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}/documents/medical")
    public ResponseEntity<Resource> downloadMedical(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id
    ) {
        return licenceService.downloadMedicalCertificate(jwt, id);
    }

    @GetMapping("/{id}/documents/photo")
    public ResponseEntity<Resource> downloadPhoto(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id
    ) {
        return licenceService.downloadIdentityPhoto(jwt, id);
    }

    @PostMapping(path = "/{id}/renew", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LicenceResponse> renew(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id,
            @RequestBody(required = false) LicenceRenewalRequest body
    ) {
        LicenceRenewalRequest payload = body != null ? body : new LicenceRenewalRequest();
        return ResponseEntity.ok(licenceService.renewForPrincipal(jwt, id, payload));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LicenceResponse> approve(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id
    ) {
        return licenceService.approve(id, jwt)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LicenceResponse> reject(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable("id") Long id,
            @RequestBody(required = false) RejectRequest body
    ) {
        return licenceService.reject(id, jwt, body != null ? body : new RejectRequest())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
