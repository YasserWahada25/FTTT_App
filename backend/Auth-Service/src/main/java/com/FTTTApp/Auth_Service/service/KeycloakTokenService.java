package com.FTTTApp.Auth_Service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class KeycloakTokenService {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getAdminToken() {
        if ("XXXX".equalsIgnoreCase(StringUtils.trimWhitespace(clientSecret))) {
            throw new IllegalStateException(
                    "keycloak.client-secret is still the placeholder XXXX. "
                            + "Keycloak: Realm fttapp → Clients → fttapp-backend → Credentials → copy the secret. "
                            + "Put it in application.properties as keycloak.client-secret=... (no ${...} around the value), "
                            + "or set environment variable KEYCLOAK_CLIENT_SECRET.");
        }
        if (!StringUtils.hasText(clientSecret)) {
            throw new IllegalStateException(
                    "keycloak.client-secret is empty. Do not use ${yourSecret:} — that is invalid. "
                            + "Either: keycloak.client-secret=PASTE_SECRET_HERE in application.properties, "
                            + "or KEYCLOAK_CLIENT_SECRET=PASTE_SECRET in the Run Configuration / OS environment. "
                            + "Client fttapp-backend must be confidential with service account + realm-management roles.");
        }

        String url = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            Map<?, ?> responseBody = response.getBody();
            if (responseBody == null || responseBody.get("access_token") == null) {
                throw new IllegalStateException("Keycloak token response had no access_token");
            }
            return (String) responseBody.get("access_token");
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new IllegalStateException(
                    "Keycloak returned 401 Unauthorized for client_credentials. "
                            + "Check keycloak.server-url, realm, client-id, and client-secret. "
                            + "Ensure the client is confidential, service account is enabled, "
                            + "and the service account has realm-management roles (manage-users, view-users).",
                    e);
        }
    }
}