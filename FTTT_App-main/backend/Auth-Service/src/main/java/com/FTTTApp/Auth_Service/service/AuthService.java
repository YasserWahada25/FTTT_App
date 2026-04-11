package com.FTTTApp.Auth_Service.service;

import com.FTTTApp.Auth_Service.dto.AdminCreateUserRequest;
import com.FTTTApp.Auth_Service.dto.AdminUserResponse;
import com.FTTTApp.Auth_Service.dto.CurrentUserResponse;
import com.FTTTApp.Auth_Service.dto.PlayerRegisterRequest;
import com.FTTTApp.Auth_Service.dto.StaffRegisterRequest;
import com.FTTTApp.Auth_Service.dto.UpdateCurrentUserRequest;
import com.FTTTApp.Auth_Service.entity.PendingUserRequest;
import com.FTTTApp.Auth_Service.repository.PendingUserRequestRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class AuthService {

    private static final Set<String> STAFF_ROLES = Set.of("CLUB_MANAGER", "COACH", "REFEREE");
    private static final Set<String> DIRECT_CREATE_ROLES = Set.of("PLAYER", "CLUB_MANAGER", "COACH", "REFEREE");
    private static final List<String> MANAGED_ROLE_PRIORITY = List.of(
            "ADMIN_FEDERATION",
            "CLUB_MANAGER",
            "COACH",
            "REFEREE",
            "PLAYER"
    );
    private static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private final KeycloakAdminService keycloakAdminService;
    private final PendingUserRequestRepository pendingUserRequestRepository;
    private final ProfileSyncService profileSyncService;

    public AuthService(KeycloakAdminService keycloakAdminService,
                       PendingUserRequestRepository pendingUserRequestRepository,
                       ProfileSyncService profileSyncService) {
        this.keycloakAdminService = keycloakAdminService;
        this.pendingUserRequestRepository = pendingUserRequestRepository;
        this.profileSyncService = profileSyncService;
    }

    public void registerPlayer(PlayerRegisterRequest req) {
        String userId = keycloakAdminService.createUser(
                req.username,
                req.email,
                req.firstName,
                req.lastName,
                req.password,
                true,
                java.util.Map.of("approvalStatus", List.of("APPROVED"))
        );

        keycloakAdminService.assignRealmRole(userId, "PLAYER");
        profileSyncService.syncActiveProfile(userId, req.firstName, req.lastName, req.email, "PLAYER", null);
    }

    public void registerStaff(StaffRegisterRequest req) {
        if (!STAFF_ROLES.contains(req.requestedRole)) {
            throw new IllegalArgumentException("Invalid role");
        }

        String userId = keycloakAdminService.createUser(
                req.username,
                req.email,
                req.firstName,
                req.lastName,
                req.password,
                false,
                java.util.Map.of(
                        "approvalStatus", List.of("PENDING"),
                        "requestedRole", List.of(req.requestedRole)
                )
        );

        pendingUserRequestRepository.save(
                new PendingUserRequest(req.username, req.email, req.requestedRole, "PENDING", userId)
        );
    }

    public List<PendingUserRequest> getPendingRequests() {
        return pendingUserRequestRepository.findByStatus("PENDING");
    }

    public void approveRequest(Long requestId) {
        PendingUserRequest request = pendingUserRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        keycloakAdminService.enableUser(request.getKeycloakUserId());
        keycloakAdminService.assignRealmRole(request.getKeycloakUserId(), request.getRequestedRole());
        Map<String, Object> keycloakUser = keycloakAdminService.getUser(request.getKeycloakUserId());
        profileSyncService.syncActiveProfile(
                request.getKeycloakUserId(),
                fallback(readString(keycloakUser.get("firstName")), request.getUsername(), request.getUsername()),
                fallback(readString(keycloakUser.get("lastName")), ""),
                fallback(readString(keycloakUser.get("email")), request.getEmail(), request.getEmail()),
                request.getRequestedRole(),
                null
        );

        request.setStatus("APPROVED");
        pendingUserRequestRepository.save(request);
    }

    public void rejectRequest(Long requestId) {
        PendingUserRequest request = pendingUserRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("REJECTED");
        pendingUserRequestRepository.save(request);
    }

    public List<AdminUserResponse> getUsers(String status) {
        String normalizedStatus = status == null ? "all" : status.trim().toLowerCase();

        return keycloakAdminService.getUsers().stream()
                .map(this::mapAdminUser)
                .filter(Objects::nonNull)
                .filter(user -> matchesStatus(user, normalizedStatus))
                .sorted(
                        Comparator.comparing(AdminUserResponse::getStatus)
                                .thenComparing(AdminUserResponse::getLastName, String.CASE_INSENSITIVE_ORDER)
                                .thenComparing(AdminUserResponse::getFirstName, String.CASE_INSENSITIVE_ORDER)
                )
                .toList();
    }

    public AdminUserResponse createDirectUser(AdminCreateUserRequest request) {
        if (!DIRECT_CREATE_ROLES.contains(request.role)) {
            throw new IllegalArgumentException("Invalid role");
        }

        String userId = keycloakAdminService.createUser(
                request.username,
                request.email,
                request.firstName,
                request.lastName,
                request.password,
                true,
                Map.of("approvalStatus", List.of("APPROVED"))
        );

        keycloakAdminService.assignRealmRole(userId, request.role);
        profileSyncService.syncActiveProfile(userId, request.firstName, request.lastName, request.email, request.role, null);
        return mapAdminUser(keycloakAdminService.getUser(userId));
    }

    public CurrentUserResponse updateCurrentUser(String userId, UpdateCurrentUserRequest request) {
        keycloakAdminService.updateUserIdentity(
                userId,
                request.firstName.trim(),
                request.lastName.trim(),
                request.email.trim()
        );

        List<String> roles = keycloakAdminService.getRealmRoles(userId).stream()
                .filter(MANAGED_ROLE_PRIORITY::contains)
                .toList();
        String primaryRole = fallback(findPrimaryManagedRole(roles), "UNKNOWN");
        profileSyncService.syncActiveProfile(
                userId,
                request.firstName,
                request.lastName,
                request.email,
                primaryRole,
                request.phone
        );

        Map<String, Object> keycloakUser = keycloakAdminService.getUser(userId);
        return new CurrentUserResponse(
                userId,
                fallback(readString(keycloakUser.get("username")), readString(keycloakUser.get("email")), "user"),
                fallback(readString(keycloakUser.get("firstName")), request.firstName),
                fallback(readString(keycloakUser.get("lastName")), request.lastName),
                fallback(readString(keycloakUser.get("email")), request.email),
                normalizePhone(request.phone),
                primaryRole,
                roles
        );
    }

    private AdminUserResponse mapAdminUser(Map<String, Object> userData) {
        if (userData == null) {
            return null;
        }

        String id = readString(userData.get("id"));
        if (id == null) {
            return null;
        }

        List<String> roles = keycloakAdminService.getRealmRoles(id);
        String primaryRole = findPrimaryManagedRole(roles);

        if (primaryRole == null) {
            return null;
        }

        boolean enabled = Boolean.TRUE.equals(userData.get("enabled"));
        return new AdminUserResponse(
                id,
                fallback(readString(userData.get("username")), readString(userData.get("email")), "user"),
                fallback(readString(userData.get("email")), ""),
                fallback(readString(userData.get("firstName")), "-"),
                fallback(readString(userData.get("lastName")), "-"),
                primaryRole,
                enabled ? "active" : "inactive",
                toIsoDate(userData.get("createdTimestamp"))
        );
    }

    private boolean matchesStatus(AdminUserResponse user, String status) {
        if ("active".equals(status)) {
            return "active".equals(user.getStatus());
        }

        if ("inactive".equals(status)) {
            return "inactive".equals(user.getStatus());
        }

        return true;
    }

    private String toIsoDate(Object createdTimestamp) {
        if (createdTimestamp instanceof Number number) {
            return ISO_DATE_FORMATTER.format(
                    Instant.ofEpochMilli(number.longValue()).atOffset(ZoneOffset.UTC)
            );
        }

        return Instant.now().atOffset(ZoneOffset.UTC).format(ISO_DATE_FORMATTER);
    }

    private String readString(Object value) {
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            return stringValue;
        }

        return null;
    }

    private String fallback(String value, String alternate) {
        return value != null ? value : alternate;
    }

    private String fallback(String value, String alternate, String defaultValue) {
        if (value != null) {
            return value;
        }

        return alternate != null ? alternate : defaultValue;
    }

    private String findPrimaryManagedRole(List<String> roles) {
        return MANAGED_ROLE_PRIORITY.stream()
                .filter(roles::contains)
                .findFirst()
                .orElse(null);
    }

    private String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }

        String normalizedPhone = phone.trim();
        return normalizedPhone.isBlank() ? null : normalizedPhone;
    }
}
