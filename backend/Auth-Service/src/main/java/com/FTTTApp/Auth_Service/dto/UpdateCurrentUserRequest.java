package com.FTTTApp.Auth_Service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCurrentUserRequest {

    @NotBlank
    public String firstName;

    @NotBlank
    public String lastName;

    @NotBlank
    @Email
    public String email;

    @Size(max = 20)
    public String phone;
}
