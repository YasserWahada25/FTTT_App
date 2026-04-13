package com.FTTTApp.Auth_Service.dto;

public class AdminUserResponse {

    private final String id;
    private final String username;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String role;
    private final String status;
    private final String createdAt;

    public AdminUserResponse(
            String id,
            String username,
            String email,
            String firstName,
            String lastName,
            String role,
            String status,
            String createdAt
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
