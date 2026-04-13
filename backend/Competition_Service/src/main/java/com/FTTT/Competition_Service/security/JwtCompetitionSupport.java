package com.FTTT.Competition_Service.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public final class JwtCompetitionSupport {

    private JwtCompetitionSupport() {
    }

    public static Set<String> roles(Jwt jwt) {
        if (jwt == null) {
            return Set.of();
        }
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null || realmAccess.get("roles") == null) {
            return Set.of();
        }
        Object raw = realmAccess.get("roles");
        if (!(raw instanceof List<?> list)) {
            return Set.of();
        }
        return list.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .collect(Collectors.toSet());
    }

    public static boolean hasRole(Jwt jwt, String role) {
        return roles(jwt).contains(role);
    }

    public static boolean isAdmin(Jwt jwt) {
        return hasRole(jwt, "ADMIN_FEDERATION");
    }
}
