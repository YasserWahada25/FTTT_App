package com.FTTTApp.Sevice_Profile.controllers;

import com.FTTTApp.Sevice_Profile.dto.ProfileDTO;
import com.FTTTApp.Sevice_Profile.dto.ProfileSyncRequest;
import com.FTTTApp.Sevice_Profile.services.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<List<ProfileDTO>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    @PostMapping
    public ResponseEntity<ProfileDTO> createProfile(@Valid @RequestBody ProfileDTO profileDTO) {
        return ResponseEntity.status(201).body(profileService.addProfile(profileDTO));
    }

    @PostMapping("/addProfile")
    public ResponseEntity<ProfileDTO> addProfile(@Valid @RequestBody ProfileDTO profileDTO) {
        return ResponseEntity.status(201).body(profileService.addProfile(profileDTO));
    }

    @PostMapping("/sync")
    public ResponseEntity<ProfileDTO> syncProfile(@Valid @RequestBody ProfileSyncRequest request) {
        return ResponseEntity.ok(profileService.syncProfile(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ProfileDTO> getProfileByUserId(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> getProfileById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(profileService.getProfileById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileDTO> updateProfile(@PathVariable("id") Long id, @Valid @RequestBody ProfileDTO profileDTO) {
        profileDTO.setId(id);
        return ResponseEntity.ok(profileService.updateProfile(profileDTO));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<ProfileDTO> updateProfileByUserId(
            @PathVariable("userId") String userId,
            @Valid @RequestBody ProfileDTO profileDTO
    ) {
        return ResponseEntity.ok(profileService.updateProfileByUserId(userId, profileDTO));
    }

    @PutMapping("/update")
    public ResponseEntity<ProfileDTO> updateProfile(@Valid @RequestBody ProfileDTO profileDTO) {
        return ResponseEntity.ok(profileService.updateProfile(profileDTO));
    }

    @PatchMapping("/user/{userId}/visibility")
    public ResponseEntity<ProfileDTO> updateVisibility(
            @PathVariable("userId") String userId,
            @RequestBody Map<String, Boolean> payload
    ) {
        boolean publicProfile = Boolean.TRUE.equals(payload.get("publicProfile"));
        return ResponseEntity.ok(profileService.updateVisibility(userId, publicProfile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProfileByRest(@PathVariable("id") Long id) {
        profileService.deleteProfile(id);
        return ResponseEntity.ok("Profile deleted successfully");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProfile(@PathVariable("id") Long id) {
        profileService.deleteProfile(id);
        return ResponseEntity.ok("Profile deleted successfully");
    }
}
