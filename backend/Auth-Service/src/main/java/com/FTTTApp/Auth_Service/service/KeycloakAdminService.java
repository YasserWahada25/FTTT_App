package com.FTTTApp.Auth_Service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    private final KeycloakTokenService tokenService;
    private final RestTemplate restTemplate = new RestTemplate();

    public KeycloakAdminService(KeycloakTokenService tokenService) {
        this.tokenService = tokenService;
    }

    public String createUser(String username, String email, String firstName, String lastName,
                             String password, boolean enabled, Map<String, List<String>> attributes) {

        String url = serverUrl + "/admin/realms/" + realm + "/users";
        String token = tokenService.getAdminToken();

        Map<String, Object> user = new HashMap<>();
        user.put("username", username);
        user.put("email", email);
        user.put("firstName", firstName);
        user.put("lastName", lastName);
        user.put("enabled", enabled);
        user.put("emailVerified", true);
        user.put("requiredActions", Collections.emptyList());
        user.put("attributes", attributes);

        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", password);
        credential.put("temporary", false);

        user.put("credentials", List.of(credential));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Void> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(user, headers), Void.class
        );

        String location = response.getHeaders().getFirst(HttpHeaders.LOCATION);
        return location.substring(location.lastIndexOf("/") + 1);
    }

    public void assignRealmRole(String userId, String roleName) {
        String token = tokenService.getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String roleUrl = serverUrl + "/admin/realms/" + realm + "/roles/" + roleName;
        ResponseEntity<Map> roleResponse = restTemplate.exchange(
                roleUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class
        );

        headers.setContentType(MediaType.APPLICATION_JSON);
        String mappingUrl = serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";

        restTemplate.exchange(
                mappingUrl,
                HttpMethod.POST,
                new HttpEntity<>(List.of(roleResponse.getBody()), headers),
                Void.class
        );
    }

    public void enableUser(String userId) {
        String token = tokenService.getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String userUrl = serverUrl + "/admin/realms/" + realm + "/users/" + userId;
        ResponseEntity<Map> response = restTemplate.exchange(
                userUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class
        );

        Map<String, Object> user = response.getBody();
        user.put("enabled", true);
        user.put("emailVerified", true);
        user.put("requiredActions", Collections.emptyList());

        headers.setContentType(MediaType.APPLICATION_JSON);
        restTemplate.exchange(
                userUrl,
                HttpMethod.PUT,
                new HttpEntity<>(user, headers),
                Void.class
        );
    }

    public List<Map<String, Object>> getUsers() {
        String token = tokenService.getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String usersUrl = serverUrl + "/admin/realms/" + realm + "/users?max=500";
        ResponseEntity<List> response = restTemplate.exchange(
                usersUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                List.class
        );

        Object body = response.getBody();
        if (!(body instanceof List<?> users)) {
            return Collections.emptyList();
        }

        return users.stream()
                .filter(Map.class::isInstance)
                .map(user -> (Map<String, Object>) user)
                .toList();
    }

    public Map<String, Object> getUser(String userId) {
        String token = tokenService.getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String userUrl = serverUrl + "/admin/realms/" + realm + "/users/" + userId;
        ResponseEntity<Map> response = restTemplate.exchange(
                userUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        return response.getBody();
    }

    public void updateUserIdentity(String userId, String firstName, String lastName, String email) {
        String token = tokenService.getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String userUrl = serverUrl + "/admin/realms/" + realm + "/users/" + userId;
        ResponseEntity<Map> response = restTemplate.exchange(
                userUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        Map<String, Object> user = response.getBody();
        if (user == null) {
            throw new RuntimeException("User not found in Keycloak");
        }

        user.put("firstName", firstName);
        user.put("lastName", lastName);
        user.put("email", email);

        headers.setContentType(MediaType.APPLICATION_JSON);
        restTemplate.exchange(
                userUrl,
                HttpMethod.PUT,
                new HttpEntity<>(user, headers),
                Void.class
        );
    }

    public List<String> getRealmRoles(String userId) {
        String token = tokenService.getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String mappingUrl = serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm/composite";
        ResponseEntity<List> response = restTemplate.exchange(
                mappingUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                List.class
        );

        Object body = response.getBody();
        if (!(body instanceof List<?> roles)) {
            return Collections.emptyList();
        }

        return roles.stream()
                .filter(Map.class::isInstance)
                .map(role -> (Map<?, ?>) role)
                .map(role -> role.get("name"))
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
