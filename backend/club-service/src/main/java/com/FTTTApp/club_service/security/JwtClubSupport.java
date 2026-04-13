package com.FTTTApp.club_service.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public final class JwtClubSupport {

    private JwtClubSupport() {
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

    /**
     * Club géré par l'utilisateur (claim Keycloak {@code club_id} ou {@code clubId}), aligné profil / licences.
     */
    public static Optional<String> managedClubIdClaim(Jwt jwt) {
        if (jwt == null) {
            return Optional.empty();
        }
        String c = jwt.getClaimAsString("club_id");
        if (c != null && !c.isBlank()) {
            return Optional.of(c.trim());
        }
        c = jwt.getClaimAsString("clubId");
        if (c != null && !c.isBlank()) {
            return Optional.of(c.trim());
        }
        return Optional.empty();
    }

    public static boolean managesClub(Jwt jwt, Long clubId) {
        if (clubId == null) {
            return false;
        }
        return managedClubIdClaim(jwt).map(id -> id.equals(String.valueOf(clubId))).orElse(false)
                && hasRole(jwt, "CLUB_MANAGER");
    }
}
