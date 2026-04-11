package com.FTTTApp.Auth_Service.repository;

import com.FTTTApp.Auth_Service.entity.PendingUserRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PendingUserRequestRepository extends JpaRepository<PendingUserRequest, Long> {
    List<PendingUserRequest> findByStatus(String status);
}