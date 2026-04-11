package com.FTTTApp.Auth_Service.service;

import com.FTTTApp.Auth_Service.dto.ProfileSyncRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ProfileSyncService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileSyncService.class);

    @Value("${profile.service-url}")
    private String profileServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void syncActiveProfile(
            String userId,
            String firstName,
            String lastName,
            String email,
            String role,
            String phone
    ) {
        ProfileSyncRequest request = new ProfileSyncRequest();
        request.setUserId(userId);
        request.setName(buildFullName(firstName, lastName));
        request.setEmail(email);
        request.setCategory(role);
        request.setPhone(hasText(phone) ? phone.trim() : null);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            restTemplate.postForEntity(
                    profileServiceUrl + "/api/profiles/sync",
                    new HttpEntity<>(request, headers),
                    Void.class
            );
        } catch (Exception exception) {
            LOGGER.warn("Unable to sync profile for userId={}: {}", userId, exception.getMessage());
        }
    }

    private String buildFullName(String firstName, String lastName) {
        String safeFirstName = firstName == null ? "" : firstName.trim();
        String safeLastName = lastName == null ? "" : lastName.trim();
        String fullName = (safeFirstName + " " + safeLastName).trim();
        return fullName.isBlank() ? "Utilisateur FTTT" : fullName;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
