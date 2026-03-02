package com.FTTTApp.Licences_Service.repositories;

import com.FTTTApp.Licences_Service.entities.Licence;
import com.FTTTApp.Licences_Service.entities.LicenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LicenceRepository extends JpaRepository<Licence, Long> {

    List<Licence> findByStatus(LicenceStatus status);

    List<Licence> findByPlayerId(String playerId);

    @Query("SELECT l FROM Licence l WHERE l.status = :status AND l.expiryDate >= :date")
    List<Licence> findApprovedNotExpired(@Param("status") LicenceStatus status, @Param("date") LocalDate date);

    @Query("SELECT l FROM Licence l WHERE l.status = :status AND l.expiryDate < :date")
    List<Licence> findApprovedExpired(@Param("status") LicenceStatus status, @Param("date") LocalDate date);
}
