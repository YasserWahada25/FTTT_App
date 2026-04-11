package com.FTTTApp.Licences_Service.controllers;

import com.FTTTApp.Licences_Service.dto.LicenceRequest;
import com.FTTTApp.Licences_Service.dto.LicenceResponse;
import com.FTTTApp.Licences_Service.dto.RejectRequest;
import com.FTTTApp.Licences_Service.services.LicenceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/licenses", produces = MediaType.APPLICATION_JSON_VALUE)
public class LicenceController {

    private final LicenceService licenceService;

    public LicenceController(LicenceService licenceService) {
        this.licenceService = licenceService;
    }

    @GetMapping
    public ResponseEntity<List<LicenceResponse>> getAll() {
        return ResponseEntity.ok(licenceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LicenceResponse> getById(@PathVariable Long id) {
        return licenceService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LicenceResponse>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(licenceService.findByStatus(status));
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<LicenceResponse>> getByPlayerId(@PathVariable String playerId) {
        return ResponseEntity.ok(licenceService.findByPlayerId(playerId));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LicenceResponse> create(@Valid @RequestBody LicenceRequest request) {
        LicenceResponse created = licenceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LicenceResponse> approve(@PathVariable Long id) {
        return licenceService.approve(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LicenceResponse> reject(@PathVariable Long id,
                                                  @RequestBody(required = false) RejectRequest body) {
        return licenceService.reject(id, body != null ? body : new RejectRequest())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
