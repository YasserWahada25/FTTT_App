package com.FTTTApp.Sevice_Profile.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ProfileSyncRequest {

    @NotBlank
    private String userId;

    private String name;

    @Email
    private String email;

    private String phone;
    private String category;
    private Long clubId;
    private Long licenseId;
    private Long sportHistoryId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getClubId() {
        return clubId;
    }

    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public Long getLicenseId() {
        return licenseId;
    }

    public void setLicenseId(Long licenseId) {
        this.licenseId = licenseId;
    }

    public Long getSportHistoryId() {
        return sportHistoryId;
    }

    public void setSportHistoryId(Long sportHistoryId) {
        this.sportHistoryId = sportHistoryId;
    }
}
