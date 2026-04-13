package com.FTTTApp.Licences_Service.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public final class JwtLicenseSupport {

    private JwtLicenseSupport() {
    }

    public static String userId(Jwt jwt) {
        return jwt.getSubject();
    }

    public static Set<String> roles(Jwt jwt) {
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

    /**
     * Claim optionnel : configurez un mapper Keycloak (ex. attribut utilisateur {@code club_id} → claim {@code club_id}).
     */
    public static Optional<String> clubIdClaim(Jwt jwt) {
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

    public static String displayName(Jwt jwt) {
        String given = Optional.ofNullable(jwt.getClaimAsString("given_name")).orElse("");
        String family = Optional.ofNullable(jwt.getClaimAsString("family_name")).orElse("");
        String combined = (given + " " + family).trim();
        if (!combined.isEmpty()) {
            return combined;
        }
        return Optional.ofNullable(jwt.getClaimAsString("preferred_username")).orElse("Joueur");
    }
}
