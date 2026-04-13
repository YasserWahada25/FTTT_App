package com.FTTTApp.Licences_Service.dto;

import java.time.LocalDate;

/**
 * Résultat de vérification d'une licence (contrôle d'accès en compétition, etc.).
 */
public class LicenceValidityResponse {

    private boolean found;
    private boolean valid;
    private String reasonCode;
    private String message;
    private LocalDate checkedAt;
    private LicenceResponse license;

    public static LicenceValidityResponse notFound(LocalDate checkedAt) {
        LicenceValidityResponse r = new LicenceValidityResponse();
        r.found = false;
        r.valid = false;
        r.reasonCode = "NOT_FOUND";
        r.message = "Aucune licence avec ce numéro.";
        r.checkedAt = checkedAt;
        return r;
    }

    public boolean isFound() {
        return found;
    }

    public void setFound(boolean found) {
        this.found = found;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getReasonCode() {
        return reasonCode;
    }

    public void setReasonCode(String reasonCode) {
        this.reasonCode = reasonCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDate getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(LocalDate checkedAt) {
        this.checkedAt = checkedAt;
    }

    public LicenceResponse getLicense() {
        return license;
    }

    public void setLicense(LicenceResponse license) {
        this.license = license;
    }
}
