package com.FTTTApp.Auth_Service.dto;

import java.util.List;

public class CurrentUserResponse {

    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private List<String> roles;

    public CurrentUserResponse(
            String id,
            String username,
            String firstName,
            String lastName,
            String email,
            String phone,
            String role,
            List<String> roles
    ) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.roles = roles;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public List<String> getRoles() {
        return roles;
    }
}
