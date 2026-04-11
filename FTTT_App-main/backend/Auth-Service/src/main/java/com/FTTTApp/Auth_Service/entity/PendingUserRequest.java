package com.FTTTApp.Auth_Service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "pending_user_requests")
public class PendingUserRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String requestedRole;
    private String status; // PENDING, APPROVED, REJECTED
    private String keycloakUserId;

    public PendingUserRequest() {
    }

    public PendingUserRequest(String username, String email, String requestedRole, String status, String keycloakUserId) {
        this.username = username;
        this.email = email;
        this.requestedRole = requestedRole;
        this.status = status;
        this.keycloakUserId = keycloakUserId;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public String getStatus() {
        return status;
    }

    public String getKeycloakUserId() {
        return keycloakUserId;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
