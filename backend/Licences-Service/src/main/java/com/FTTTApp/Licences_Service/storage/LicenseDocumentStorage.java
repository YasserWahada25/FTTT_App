package com.FTTTApp.Licences_Service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;

@Component
public class LicenseDocumentStorage {

    private static final long MAX_MEDICAL_BYTES = 8 * 1024 * 1024;
    private static final long MAX_PHOTO_BYTES = 5 * 1024 * 1024;

    private static final Set<String> MEDICAL_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    private static final Set<String> PHOTO_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    private final Path baseDir;

    public LicenseDocumentStorage(@Value("${app.licenses.upload-dir:uploads/licenses}") String uploadDir) {
        this.baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(baseDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de créer le répertoire des pièces licence : " + baseDir, e);
        }
    }

    public String saveMedicalCertificate(long licenceId, MultipartFile file) {
        validateMedical(file);
        String ext = extensionFromContentType(file.getContentType(), true);
        return store(licenceId, file, "medical", ext);
    }

    public String saveIdentityPhoto(long licenceId, MultipartFile file) {
        validatePhoto(file);
        String ext = extensionFromContentType(file.getContentType(), false);
        return store(licenceId, file, "photo", ext);
    }

    public Resource loadAsResource(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document absent.");
        }
        Path resolved = baseDir.resolve(relativePath).normalize();
        if (!resolved.startsWith(baseDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chemin de document invalide.");
        }
        if (!Files.isReadable(resolved)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable.");
        }
        try {
            return new UrlResource(resolved.toUri());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lecture du fichier impossible.", e);
        }
    }

    public void deleteFolder(long licenceId) {
        Path dir = baseDir.resolve(String.valueOf(licenceId)).normalize();
        if (!dir.startsWith(baseDir) || !Files.isDirectory(dir)) {
            return;
        }
        try {
            Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (IOException ignored) {
                            // best effort cleanup
                        }
                    });
        } catch (IOException ignored) {
        }
    }

    private String store(long licenceId, MultipartFile file, String prefix, String ext) {
        try {
            Path dir = baseDir.resolve(String.valueOf(licenceId)).normalize();
            if (!dir.startsWith(baseDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identifiant de licence invalide.");
            }
            Files.createDirectories(dir);
            String filename = prefix + ext;
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return licenceId + "/" + filename;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Enregistrement du fichier impossible.", e);
        }
    }

    private void validateMedical(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certificat médical obligatoire.");
        }
        if (file.getSize() > MAX_MEDICAL_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certificat médical trop volumineux (max 8 Mo).");
        }
        String ct = normalizeContentType(file.getContentType());
        if (ct == null || !MEDICAL_TYPES.contains(ct)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Certificat médical : formats acceptés PDF, JPEG ou PNG.");
        }
    }

    private void validatePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo d'identité obligatoire.");
        }
        if (file.getSize() > MAX_PHOTO_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo d'identité trop volumineuse (max 5 Mo).");
        }
        String ct = normalizeContentType(file.getContentType());
        if (ct == null || !PHOTO_TYPES.contains(ct)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Photo d'identité : formats acceptés JPEG ou PNG.");
        }
    }

    private static String normalizeContentType(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.toLowerCase(Locale.ROOT).trim();
        int semi = t.indexOf(';');
        return semi > 0 ? t.substring(0, semi).trim() : t;
    }

    private static String extensionFromContentType(String contentType, boolean allowPdf) {
        String ct = normalizeContentType(contentType);
        if (ct == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type de fichier inconnu.");
        }
        if (allowPdf && "application/pdf".equals(ct)) {
            return ".pdf";
        }
        if ("image/jpeg".equals(ct) || "image/jpg".equals(ct)) {
            return ".jpg";
        }
        if ("image/png".equals(ct)) {
            return ".png";
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Extension non reconnue pour ce type de fichier.");
    }
}
