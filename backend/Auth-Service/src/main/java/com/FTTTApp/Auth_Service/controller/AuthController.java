package com.FTTTApp.Auth_Service.controller;


import com.FTTTApp.Auth_Service.dto.AdminCreateUserRequest;
import com.FTTTApp.Auth_Service.dto.AdminUserResponse;
import com.FTTTApp.Auth_Service.dto.CurrentUserResponse;
import com.FTTTApp.Auth_Service.dto.PlayerRegisterRequest;
import com.FTTTApp.Auth_Service.dto.StaffRegisterRequest;
import com.FTTTApp.Auth_Service.dto.UpdateCurrentUserRequest;
import com.FTTTApp.Auth_Service.entity.PendingUserRequest;
import com.FTTTApp.Auth_Service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/player")
    public ResponseEntity<String> registerPlayer(@Valid @RequestBody PlayerRegisterRequest request) {
        authService.registerPlayer(request);
        return ResponseEntity.ok("PLAYER created");
    }

    @PostMapping("/register/staff")
    public ResponseEntity<String> registerStaff(@Valid @RequestBody StaffRegisterRequest request) {
        authService.registerStaff(request);
        return ResponseEntity.ok("Staff request created");
    }

    @PutMapping("/me")
    public ResponseEntity<CurrentUserResponse> updateCurrentUser(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateCurrentUserRequest request
    ) {
        return ResponseEntity.ok(authService.updateCurrentUser(jwt.getSubject(), request));
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @GetMapping("/requests/pending")
    public ResponseEntity<List<PendingUserRequest>> getPendingRequests() {
        return ResponseEntity.ok(authService.getPendingRequests());
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable("id") Long id) {
        authService.approveRequest(id);
        return ResponseEntity.ok("Request approved");
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable("id") Long id) {
        authService.rejectRequest(id);
        return ResponseEntity.ok("Request rejected");
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers(
            @RequestParam(name = "status", defaultValue = "all") String status
    ) {
        return ResponseEntity.ok(authService.getUsers(status));
    }

    @PreAuthorize("hasRole('ADMIN_FEDERATION')")
    @PostMapping("/users")
    public ResponseEntity<AdminUserResponse> createDirectUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createDirectUser(request));
    }
}
