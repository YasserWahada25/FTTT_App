import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import {
    License,
    LicenseApiResponse,
    LicenseCreateRequest,
    LicenseValidityApiResponse,
} from '../../../core/models/license.model';

@Injectable({ providedIn: 'root' })
export class LicensesService {
    private readonly base = '/api/licenses';

    constructor(private readonly http: HttpClient) {}

    getAll(status?: string, clubId?: string): Observable<License[]> {
        let params = new HttpParams();
        if (status) {
            params = params.set('status', status);
        }
        if (clubId) {
            params = params.set('clubId', clubId);
        }
        return this.http
            .get<LicenseApiResponse[]>(this.base, { params })
            .pipe(map((rows) => rows.map((r) => this.mapLicense(r))));
    }

    getMyLicenses(): Observable<License[]> {
        return this.http
            .get<LicenseApiResponse[]>(`${this.base}/me`)
            .pipe(map((rows) => rows.map((r) => this.mapLicense(r))));
    }

    getByPlayerId(playerId: string): Observable<License[]> {
        return this.http
            .get<LicenseApiResponse[]>(`${this.base}/player/${encodeURIComponent(playerId)}`)
            .pipe(map((rows) => rows.map((r) => this.mapLicense(r))));
    }

    getById(id: string): Observable<License | undefined> {
        return this.http.get<LicenseApiResponse>(`${this.base}/${id}`).pipe(
            map((r) => this.mapLicense(r)),
            catchError(() => of(undefined))
        );
    }

    verify(licenseNumber: string): Observable<LicenseValidityApiResponse> {
        const params = new HttpParams().set('number', licenseNumber);
        return this.http.get<LicenseValidityApiResponse>(`${this.base}/verify`, { params });
    }

    create(data: LicenseCreateRequest): Observable<License> {
        return this.http
            .post<LicenseApiResponse>(this.base, data)
            .pipe(map((r) => this.mapLicense(r)));
    }

    /**
     * Création avec certificat médical (PDF / image) et photo d'identité (JPEG / PNG), multipart/form-data.
     */
    createWithDocuments(
        data: LicenseCreateRequest,
        medicalCertificate: File,
        identityPhoto: File
    ): Observable<License> {
        const fd = new FormData();
        fd.append(
            'payload',
            new Blob([JSON.stringify(data)], { type: 'application/json' })
        );
        fd.append('medicalCertificate', medicalCertificate, medicalCertificate.name);
        fd.append('identityPhoto', identityPhoto, identityPhoto.name);
        return this.http
            .post<LicenseApiResponse>(this.base, fd)
            .pipe(map((r) => this.mapLicense(r)));
    }

    downloadMedicalCertificate(id: string): Observable<Blob> {
        return this.http.get(`${this.base}/${id}/documents/medical`, { responseType: 'blob' });
    }

    downloadIdentityPhoto(id: string): Observable<Blob> {
        return this.http.get(`${this.base}/${id}/documents/photo`, { responseType: 'blob' });
    }

    renew(
        id: string,
        body?: { season?: string; expiryDate?: string; amount?: number; category?: string; notes?: string }
    ): Observable<License> {
        return this.http
            .post<LicenseApiResponse>(`${this.base}/${id}/renew`, body ?? {})
            .pipe(map((r) => this.mapLicense(r)));
    }

    approve(id: string): Observable<License> {
        return this.http
            .put<LicenseApiResponse>(`${this.base}/${id}/approve`, {})
            .pipe(map((r) => this.mapLicense(r)));
    }

    reject(id: string, notes: string): Observable<License> {
        return this.http
            .put<LicenseApiResponse>(`${this.base}/${id}/reject`, { notes })
            .pipe(map((r) => this.mapLicense(r)));
    }

    private mapLicense(r: LicenseApiResponse): License {
        const payment = this.mapPayment(r.paymentStatus);
        const status = this.mapCombinedStatus(r);
        return {
            id: String(r.id),
            licenseNumber: r.licenseNumber,
            playerId: r.playerId,
            playerName: r.playerName,
            clubId: r.clubId,
            clubName: r.clubName,
            season: r.season,
            category: r.category,
            status,
            requestDate: r.requestDate,
            approvalDate: r.approvalDate,
            expiryDate: r.expiryDate,
            amount: Number(r.amount),
            paymentStatus: payment,
            notes: r.notes,
            renewedFromLicenceId:
                r.renewedFromLicenceId !== undefined && r.renewedFromLicenceId !== null
                    ? String(r.renewedFromLicenceId)
                    : undefined,
            validNow: r.validNow,
            expiredByDate: r.expiredByDate,
            hasMedicalCertificate: r.hasMedicalCertificate,
            hasIdentityPhoto: r.hasIdentityPhoto,
        };
    }

    private mapPayment(s: LicenseApiResponse['paymentStatus']): License['paymentStatus'] {
        switch (s) {
            case 'PAID':
                return 'paid';
            case 'CANCELLED':
                return 'cancelled';
            default:
                return 'pending';
        }
    }

    private mapCombinedStatus(r: LicenseApiResponse): License['status'] {
        if (r.status === 'PENDING') {
            return 'pending';
        }
        if (r.status === 'REJECTED') {
            return 'rejected';
        }
        if (r.status === 'APPROVED') {
            if (r.expiredByDate) {
                return 'expired';
            }
            if (r.validNow) {
                return 'active';
            }
            return 'approved';
        }
        return 'pending';
    }
}
