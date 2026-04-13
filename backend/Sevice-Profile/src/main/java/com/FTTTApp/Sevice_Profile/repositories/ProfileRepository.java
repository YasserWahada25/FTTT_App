package com.FTTTApp.Sevice_Profile.repositories;

import com.FTTTApp.Sevice_Profile.entities.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByEmail(String email);

    Optional<Profile> findByUserId(String userId);
}
