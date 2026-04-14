package com.FTTTApp.Licences_Service.services;

import com.FTTTApp.Licences_Service.dto.LicenceRenewalRequest;
import com.FTTTApp.Licences_Service.dto.LicenceRequest;
import com.FTTTApp.Licences_Service.dto.LicenceResponse;
import com.FTTTApp.Licences_Service.dto.LicenceValidityResponse;
import com.FTTTApp.Licences_Service.dto.RejectRequest;
import com.FTTTApp.Licences_Service.entities.Licence;
import com.FTTTApp.Licences_Service.entities.LicenceStatus;
import com.FTTTApp.Licences_Service.entities.PaymentStatus;
import com.FTTTApp.Licences_Service.repositories.LicenceRepository;
import com.FTTTApp.Licences_Service.security.JwtLicenseSupport;
import com.FTTTApp.Licences_Service.storage.LicenseDocumentStorage;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LicenceService {

    private static final int RENEWAL_WINDOW_DAYS = 120;

    private final LicenceRepository licenceRepository;
    private final LicenseDocumentStorage licenseDocumentStorage;

    public LicenceService(LicenceRepository licenceRepository, LicenseDocumentStorage licenseDocumentStorage) {
        this.licenceRepository = licenceRepository;
        this.licenseDocumentStorage = licenseDocumentStorage;
    }

    @Transactional(readOnly = true)
    public List<LicenceResponse> listForPrincipal(Jwt jwt, String statusFilter, String clubIdParam) {
        if (isOnlyReferee(jwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Utilisez la vérification par numéro de licence.");
        }
        if (JwtLicenseSupport.hasRole(jwt, "PLAYER")
                && !JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")
                && !JwtLicenseSupport.hasRole(jwt, "CLUB_MANAGER")
                && !JwtLicenseSupport.hasRole(jwt, "COACH")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Consultez vos licences via /api/licenses/me.");
        }

        if (JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")) {
            if (clubIdParam != null && !clubIdParam.isBlank()) {
                return filterByStatusString(
                        licenceRepository.findByClubId(clubIdParam.trim()),
                        statusFilter
                );
            }
            return filterByStatusString(licenceRepository.findAll(), statusFilter);
        }

        if (JwtLicenseSupport.hasRole(jwt, "CLUB_MANAGER") || JwtLicenseSupport.hasRole(jwt, "COACH")) {
            String club = JwtLicenseSupport.clubIdClaim(jwt)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Claim JWT club_id manquant : ajoutez un mapper Keycloak (attribut utilisateur → claim club_id)."));
            return filterByStatusString(licenceRepository.findByClubId(club), statusFilter);
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rôle non autorisé pour cette ressource.");
    }

    @Transactional(readOnly = true)
    public List<LicenceResponse> findMine(Jwt jwt) {
        String sub = JwtLicenseSupport.userId(jwt);
        return licenceRepository.findByPlayerId(sub).stream()
                .sorted(Comparator.comparing(Licence::getRequestDate).reversed())
                .map(LicenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LicenceResponse> findByPlayerIdForPrincipal(Jwt jwt, String playerId) {
        requireViewPlayer(jwt, playerId);
        return licenceRepository.findByPlayerId(playerId).stream()
                .map(LicenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<LicenceResponse> findByIdForPrincipal(Jwt jwt, Long id) {
        return licenceRepository.findById(id).map(licence -> {
            assertCanViewLicence(jwt, licence);
            return LicenceResponse.fromEntity(licence);
        });
    }

    @Transactional(readOnly = true)
    public LicenceValidityResponse verifyByNumber(String licenseNumber) {
        if (licenseNumber == null || licenseNumber.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paramètre number requis.");
        }
        LocalDate today = LocalDate.now();
        String normalized = licenseNumber.trim();
        Optional<Licence> opt = licenceRepository.findByLicenseNumber(normalized);
        if (opt.isEmpty()) {
            return LicenceValidityResponse.notFound(today);
        }
        Licence l = opt.get();
        LicenceValidityResponse r = new LicenceValidityResponse();
        r.setFound(true);
        r.setCheckedAt(today);
        r.setLicense(LicenceResponse.fromEntity(l));

        if (l.getStatus() == LicenceStatus.PENDING) {
            r.setValid(false);
            r.setReasonCode("PENDING");
            r.setMessage("Demande en attente de validation par la fédération.");
            return r;
        }
        if (l.getStatus() == LicenceStatus.REJECTED) {
            r.setValid(false);
            r.setReasonCode("REJECTED");
            r.setMessage("Licence refusée.");
            return r;
        }
        if (l.getStatus() != LicenceStatus.APPROVED) {
            r.setValid(false);
            r.setReasonCode("INVALID_STATE");
            r.setMessage("Statut de licence invalide.");
            return r;
        }
        if (today.isAfter(l.getExpiryDate())) {
            r.setValid(false);
            r.setReasonCode("EXPIRED");
            r.setMessage("Licence expirée.");
            return r;
        }
        r.setValid(true);
        r.setReasonCode("VALID");
        r.setMessage("Licence approuvée et en cours de validité.");
        return r;
    }

    @Transactional
    public LicenceResponse createForPrincipal(Jwt jwt, LicenceRequest request) {
        if (JwtLicenseSupport.hasRole(jwt, "PLAYER")
                && !JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")
                && !JwtLicenseSupport.hasRole(jwt, "CLUB_MANAGER")) {
            return createAsPlayer(jwt, request);
        }
        if (JwtLicenseSupport.hasRole(jwt, "CLUB_MANAGER")) {
            return createAsClubManager(jwt, request);
        }
        if (JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")) {
            return createAsAdmin(request);
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Création de licence non autorisée pour ce rôle.");
    }

    /**
     * Crée une demande de licence et enregistre certificat médical + photo d'identité sur disque.
     */
    @Transactional
    public LicenceResponse createWithDocumentsForPrincipal(
            Jwt jwt,
            LicenceRequest request,
            MultipartFile medicalCertificate,
            MultipartFile identityPhoto
    ) {
        LicenceResponse created = createForPrincipal(jwt, request);
        Long id = created.getId();
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Identifiant de licence manquant.");
        }
        try {
            String medicalRel = licenseDocumentStorage.saveMedicalCertificate(id, medicalCertificate);
            String photoRel = licenseDocumentStorage.saveIdentityPhoto(id, identityPhoto);
            Licence lic = licenceRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Licence introuvable après création."));
            lic.setMedicalCertificatePath(medicalRel);
            lic.setIdentityPhotoPath(photoRel);
            return LicenceResponse.fromEntity(licenceRepository.save(lic));
        } catch (RuntimeException ex) {
            licenseDocumentStorage.deleteFolder(id);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> downloadMedicalCertificate(Jwt jwt, Long id) {
        Licence l = licenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Licence introuvable."));
        assertCanViewLicence(jwt, l);
        if (!StringUtils.hasText(l.getMedicalCertificatePath())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun certificat médical joint.");
        }
        return buildFileResponse(l.getMedicalCertificatePath(), "certificat-medical");
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> downloadIdentityPhoto(Jwt jwt, Long id) {
        Licence l = licenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Licence introuvable."));
        assertCanViewLicence(jwt, l);
        if (!StringUtils.hasText(l.getIdentityPhotoPath())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucune photo d'identité jointe.");
        }
        return buildFileResponse(l.getIdentityPhotoPath(), "photo-identite");
    }

    private ResponseEntity<Resource> buildFileResponse(String relativePath, String downloadBaseName) {
        Resource resource = licenseDocumentStorage.loadAsResource(relativePath);
        MediaType mediaType = mediaTypeForStoredPath(relativePath);
        String ext = relativePath.contains(".") ? relativePath.substring(relativePath.lastIndexOf('.')) : "";
        String filename = downloadBaseName + ext;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    private static MediaType mediaTypeForStoredPath(String path) {
        String p = path.toLowerCase(Locale.ROOT);
        if (p.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        }
        if (p.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        return MediaType.IMAGE_JPEG;
    }

    @Transactional
    public LicenceResponse renewForPrincipal(Jwt jwt, Long licenceId, LicenceRenewalRequest body) {
        Licence parent = licenceRepository.findById(licenceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Licence introuvable."));

        assertCanRenew(jwt, parent);

        if (parent.getStatus() != LicenceStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seule une licence approuvée peut faire l'objet d'un renouvellement.");
        }
        LocalDate today = LocalDate.now();
        if (!isRenewalEligible(parent, today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Renouvellement possible uniquement si la licence est expirée ou dans les " + RENEWAL_WINDOW_DAYS + " jours avant expiration.");
        }

        List<Licence> otherValid = licenceRepository.findByPlayerId(parent.getPlayerId()).stream()
                .filter(l -> l.getStatus() == LicenceStatus.APPROVED && !today.isAfter(l.getExpiryDate()))
                .filter(l -> !l.getId().equals(parent.getId()))
                .toList();
        if (!otherValid.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une autre licence approuvée encore valide existe pour ce joueur.");
        }

        Licence renewal = new Licence();
        renewal.setLicenseNumber(generateLicenseNumber());
        renewal.setPlayerId(parent.getPlayerId());
        renewal.setPlayerName(parent.getPlayerName());
        renewal.setClubId(parent.getClubId());
        renewal.setClubName(parent.getClubName());
        renewal.setSeason(body.getSeason() != null ? body.getSeason() : defaultSeason());
        renewal.setCategory(body.getCategory() != null ? body.getCategory() : parent.getCategory());
        renewal.setStatus(LicenceStatus.PENDING);
        renewal.setRequestDate(today);
        renewal.setExpiryDate(body.getExpiryDate() != null ? body.getExpiryDate() : defaultExpiryDate());
        renewal.setAmount(body.getAmount() != null ? body.getAmount() : parent.getAmount());
        renewal.setPaymentStatus(PaymentStatus.PENDING);
        renewal.setRenewedFromLicenceId(parent.getId());
        String note = body.getNotes() != null ? body.getNotes().trim() : "";
        renewal.setNotes("Renouvellement demandé pour la licence " + parent.getLicenseNumber()
                + (note.isEmpty() ? "" : ". " + note));

        return LicenceResponse.fromEntity(licenceRepository.save(renewal));
    }

    @Transactional
    public Optional<LicenceResponse> approve(Long id, Jwt jwt) {
        requireAdmin(jwt);
        return licenceRepository.findById(id)
                .filter(l -> l.getStatus() == LicenceStatus.PENDING)
                .map(l -> {
                    l.setStatus(LicenceStatus.APPROVED);
                    l.setApprovalDate(LocalDate.now());
                    return LicenceResponse.fromEntity(licenceRepository.save(l));
                });
    }

    @Transactional
    public Optional<LicenceResponse> reject(Long id, Jwt jwt, RejectRequest body) {
        requireAdmin(jwt);
        return licenceRepository.findById(id)
                .filter(l -> l.getStatus() == LicenceStatus.PENDING)
                .map(l -> {
                    l.setStatus(LicenceStatus.REJECTED);
                    if (body != null && body.getNotes() != null) {
                        l.setNotes(body.getNotes());
                    }
                    return LicenceResponse.fromEntity(licenceRepository.save(l));
                });
    }

    /* --- Legacy / internal helpers --- */

    @Transactional(readOnly = true)
    public List<LicenceResponse> findAll() {
        return licenceRepository.findAll().stream()
                .map(LicenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<LicenceResponse> findById(Long id) {
        return licenceRepository.findById(id).map(LicenceResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<LicenceResponse> findByPlayerId(String playerId) {
        return licenceRepository.findByPlayerId(playerId).stream()
                .map(LicenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LicenceResponse> findByStatus(String status) {
        return filterByStatusString(licenceRepository.findAll(), status);
    }

    @Transactional
    public LicenceResponse create(LicenceRequest request) {
        return persistNewLicence(request, null, null);
    }

    private LicenceResponse createAsPlayer(Jwt jwt, LicenceRequest request) {
        String sub = JwtLicenseSupport.userId(jwt);
        if (request.getClubId() == null || request.getClubId().isBlank()
                || request.getClubName() == null || request.getClubName().isBlank()
                || request.getCategory() == null || request.getCategory().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clubId, clubName et category sont obligatoires.");
        }
        if (licenceRepository.existsByPlayerIdAndStatusAndExpiryDateGreaterThanEqual(sub, LicenceStatus.APPROVED, LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà une licence approuvée en cours de validité.");
        }
        LicenceRequest copy = copyRequestForPlayer(sub, JwtLicenseSupport.displayName(jwt), request);
        return persistNewLicence(copy, null, null);
    }

    private LicenceResponse createAsClubManager(Jwt jwt, LicenceRequest request) {
        String club = JwtLicenseSupport.clubIdClaim(jwt)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Claim club_id manquant."));
        if (request.getPlayerId() == null || request.getPlayerId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId obligatoire.");
        }
        if (!club.equals(request.getClubId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Le club de la demande doit correspondre à votre club.");
        }
        return persistNewLicence(request, null, null);
    }

    private LicenceResponse createAsAdmin(LicenceRequest request) {
        if (request.getPlayerId() == null || request.getPlayerId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId obligatoire.");
        }
        return persistNewLicence(request, null, null);
    }

    private LicenceRequest copyRequestForPlayer(String playerId, String playerName, LicenceRequest request) {
        LicenceRequest copy = new LicenceRequest();
        copy.setPlayerId(playerId);
        copy.setPlayerName(playerName);
        copy.setClubId(request.getClubId());
        copy.setClubName(request.getClubName());
        copy.setSeason(request.getSeason());
        copy.setCategory(request.getCategory());
        copy.setExpiryDate(request.getExpiryDate());
        copy.setAmount(request.getAmount());
        copy.setNotes(request.getNotes());
        return copy;
    }

    private LicenceResponse persistNewLicence(LicenceRequest request, Long renewedFrom, String forcedNumber) {
        if (request.getPlayerId() == null || request.getPlayerId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId obligatoire.");
        }
        Licence licence = new Licence();
        licence.setLicenseNumber(forcedNumber != null ? forcedNumber : generateLicenseNumber());
        licence.setPlayerId(request.getPlayerId().trim());
        licence.setPlayerName(request.getPlayerName() != null ? request.getPlayerName().trim() : "—");
        licence.setClubId(request.getClubId() != null ? request.getClubId().trim() : "");
        licence.setClubName(request.getClubName() != null ? request.getClubName().trim() : "");
        licence.setSeason(request.getSeason() != null ? request.getSeason() : defaultSeason());
        licence.setCategory(request.getCategory());
        licence.setStatus(LicenceStatus.PENDING);
        licence.setRequestDate(LocalDate.now());
        licence.setExpiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : defaultExpiryDate());
        licence.setAmount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO);
        licence.setPaymentStatus(PaymentStatus.PENDING);
        licence.setNotes(request.getNotes());
        licence.setRenewedFromLicenceId(renewedFrom);
        return LicenceResponse.fromEntity(licenceRepository.save(licence));
    }

    private static boolean isRenewalEligible(Licence parent, LocalDate today) {
        if (today.isAfter(parent.getExpiryDate())) {
            return true;
        }
        LocalDate windowStart = parent.getExpiryDate().minusDays(RENEWAL_WINDOW_DAYS);
        return !today.isBefore(windowStart);
    }

    private void requireViewPlayer(Jwt jwt, String playerId) {
        if (JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")) {
            return;
        }
        if (playerId.equals(JwtLicenseSupport.userId(jwt))) {
            return;
        }
        if (JwtLicenseSupport.hasRole(jwt, "CLUB_MANAGER") || JwtLicenseSupport.hasRole(jwt, "COACH")) {
            String club = JwtLicenseSupport.clubIdClaim(jwt)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Claim club_id manquant."));
            List<Licence> ofPlayer = licenceRepository.findByPlayerId(playerId);
            boolean sameClub = ofPlayer.stream().anyMatch(l -> club.equals(l.getClubId()));
            if (sameClub) {
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé aux licences de ce joueur.");
    }

    private void assertCanViewLicence(Jwt jwt, Licence licence) {
        if (JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")) {
            return;
        }
        if (JwtLicenseSupport.userId(jwt).equals(licence.getPlayerId())) {
            return;
        }
        if (JwtLicenseSupport.hasRole(jwt, "CLUB_MANAGER") || JwtLicenseSupport.hasRole(jwt, "COACH")) {
            String club = JwtLicenseSupport.clubIdClaim(jwt)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Claim club_id manquant."));
            if (club.equals(licence.getClubId())) {
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé à cette licence.");
    }

    private void assertCanRenew(Jwt jwt, Licence parent) {
        if (JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")) {
            return;
        }
        if (JwtLicenseSupport.userId(jwt).equals(parent.getPlayerId())) {
            return;
        }
        if (JwtLicenseSupport.hasRole(jwt, "CLUB_MANAGER")) {
            String club = JwtLicenseSupport.clubIdClaim(jwt)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Claim club_id manquant."));
            if (club.equals(parent.getClubId())) {
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Renouvellement non autorisé.");
    }

    private static void requireAdmin(Jwt jwt) {
        if (!JwtLicenseSupport.hasRole(jwt, "ADMIN_FEDERATION")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Action réservée à l'administration fédérale.");
        }
    }

    private static boolean isOnlyReferee(Jwt jwt) {
        var roles = JwtLicenseSupport.roles(jwt);
        return roles.contains("REFEREE")
                && !roles.contains("ADMIN_FEDERATION")
                && !roles.contains("CLUB_MANAGER")
                && !roles.contains("COACH")
                && !roles.contains("PLAYER");
    }

    private List<LicenceResponse> filterByStatusString(List<Licence> licences, String status) {
        if (status == null || status.isBlank()) {
            return licences.stream().map(LicenceResponse::fromEntity).collect(Collectors.toList());
        }
        LocalDate today = LocalDate.now();
        String s = status.trim().toLowerCase();
        return licences.stream()
                .filter(l -> matchesStatusFilter(l, s, today))
                .map(LicenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private static boolean matchesStatusFilter(Licence l, String s, LocalDate today) {
        return switch (s) {
            case "pending" -> l.getStatus() == LicenceStatus.PENDING;
            case "approved" -> l.getStatus() == LicenceStatus.APPROVED;
            case "rejected" -> l.getStatus() == LicenceStatus.REJECTED;
            case "active" -> l.getStatus() == LicenceStatus.APPROVED && !today.isAfter(l.getExpiryDate());
            case "expired" -> l.getStatus() == LicenceStatus.APPROVED && today.isAfter(l.getExpiryDate());
            default -> true;
        };
    }

    private String generateLicenseNumber() {
        int year = LocalDate.now().getYear();
        long n = licenceRepository.count() + 1;
        return String.format("FTTT-%d-%05d", year, n % 100000);
    }

    private static String defaultSeason() {
        int year = LocalDate.now().getYear();
        return year + "-" + (year + 1);
    }

    private static LocalDate defaultExpiryDate() {
        int year = LocalDate.now().getYear();
        return LocalDate.of(year + 1, 8, 31);
    }
}
