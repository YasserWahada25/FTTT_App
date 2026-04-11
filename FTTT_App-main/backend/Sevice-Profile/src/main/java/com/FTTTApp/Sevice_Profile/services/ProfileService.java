package com.FTTTApp.Sevice_Profile.services;

import com.FTTTApp.Sevice_Profile.dto.ProfileDTO;
import com.FTTTApp.Sevice_Profile.dto.ProfileStatsDTO;
import com.FTTTApp.Sevice_Profile.dto.ProfileSyncRequest;
import com.FTTTApp.Sevice_Profile.entities.Profile;
import com.FTTTApp.Sevice_Profile.repositories.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public List<ProfileDTO> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public ProfileDTO getProfileById(Long id) {
        return toDto(findById(id));
    }

    public ProfileDTO getProfileByUserId(String userId) {
        return profileRepository.findByUserId(userId)
                .map(this::toDto)
                .orElseGet(() -> createDefaultProfileDto(userId));
    }

    public ProfileDTO addProfile(ProfileDTO profileDTO) {
        Profile profile = new Profile();
        applyDto(profile, profileDTO);
        return toDto(profileRepository.save(profile));
    }

    public ProfileDTO updateProfile(ProfileDTO profileDTO) {
        if (profileDTO.getId() == null) {
            throw new IllegalArgumentException("Profile id is required for update");
        }

        Profile profile = findById(profileDTO.getId());
        applyDto(profile, profileDTO);
        return toDto(profileRepository.save(profile));
    }

    public ProfileDTO updateProfileByUserId(String userId, ProfileDTO profileDTO) {
        Profile profile = profileRepository.findByUserId(userId).orElseGet(() -> {
            Profile created = new Profile();
            created.setUserId(userId);
            return created;
        });

        applyDto(profile, profileDTO);
        profile.setUserId(userId);
        return toDto(profileRepository.save(profile));
    }

    public ProfileDTO updateVisibility(String userId, boolean publicProfile) {
        Profile profile = profileRepository.findByUserId(userId).orElseGet(() -> {
            Profile created = new Profile();
            created.setUserId(userId);
            created.setBio("Profil FTTT en cours de completion.");
            return created;
        });
        profile.setPublicProfile(publicProfile);
        return toDto(profileRepository.save(profile));
    }

    public ProfileDTO syncProfile(ProfileSyncRequest request) {
        Profile profile = profileRepository.findByUserId(request.getUserId()).orElseGet(() -> {
            Profile created = new Profile();
            created.setUserId(request.getUserId());
            created.setPublicProfile(true);
            return created;
        });

        if (hasText(request.getName())) {
            profile.setName(request.getName().trim());
        }
        if (hasText(request.getEmail())) {
            profile.setEmail(request.getEmail().trim());
        }
        if (request.getPhone() != null) {
            profile.setPhone(hasText(request.getPhone()) ? request.getPhone().trim() : null);
        }
        if (hasText(request.getCategory())) {
            profile.setCategory(request.getCategory().trim());
        }
        if (request.getClubId() != null) {
            profile.setClubId(request.getClubId());
        }
        if (request.getLicenseId() != null) {
            profile.setLicenseId(request.getLicenseId());
        }
        if (request.getSportHistoryId() != null) {
            profile.setSportHistoryId(request.getSportHistoryId());
        }

        if (!hasText(profile.getBio())) {
            profile.setBio(defaultBio(profile.getCategory()));
        }
        if (profile.getSkills() == null) {
            profile.setSkills(new ArrayList<>());
        }
        if (profile.getAchievements() == null) {
            profile.setAchievements(new ArrayList<>());
        }
        if (profile.getPoints() == null) {
            profile.setPoints(0);
        }
        if (profile.getWins() == null) {
            profile.setWins(0);
        }
        if (profile.getLosses() == null) {
            profile.setLosses(0);
        }
        if (profile.getMatchesPlayed() == null) {
            profile.setMatchesPlayed(0);
        }

        return toDto(profileRepository.save(profile));
    }

    public void deleteProfile(Long id) {
        profileRepository.delete(findById(id));
    }

    private Profile findById(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    private Profile findByUserId(String userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    private ProfileDTO createDefaultProfileDto(String userId) {
        ProfileDTO dto = new ProfileDTO();
        dto.setUserId(userId);
        dto.setBio("Profil FTTT en cours de completion.");
        dto.setSkills(new ArrayList<>());
        dto.setAchievements(new ArrayList<>());
        dto.setStats(new ProfileStatsDTO());
        dto.setPublicProfile(true);
        return dto;
    }

    private void applyDto(Profile profile, ProfileDTO profileDTO) {
        if (hasText(profileDTO.getUserId())) {
            profile.setUserId(profileDTO.getUserId().trim());
        }

        if (profileDTO.getName() != null) {
            profile.setName(profileDTO.getName());
        }
        if (profileDTO.getEmail() != null) {
            profile.setEmail(profileDTO.getEmail());
        }
        if (profileDTO.getPhone() != null) {
            profile.setPhone(profileDTO.getPhone());
        }
        if (profileDTO.getCategory() != null) {
            profile.setCategory(profileDTO.getCategory());
        }
        if (profileDTO.getPhotoUrl() != null) {
            profile.setPhotoUrl(profileDTO.getPhotoUrl());
        }
        if (profileDTO.getClubId() != null) {
            profile.setClubId(profileDTO.getClubId());
        }
        if (profileDTO.getLicenseId() != null) {
            profile.setLicenseId(profileDTO.getLicenseId());
        }
        if (profileDTO.getSportHistoryId() != null) {
            profile.setSportHistoryId(profileDTO.getSportHistoryId());
        }
        if (profileDTO.getBio() != null) {
            profile.setBio(profileDTO.getBio());
        }
        if (profileDTO.getSkills() != null) {
            profile.setSkills(new ArrayList<>(profileDTO.getSkills()));
        }
        if (profileDTO.getAchievements() != null) {
            profile.setAchievements(new ArrayList<>(profileDTO.getAchievements()));
        }

        ProfileStatsDTO stats = profileDTO.getStats();
        if (stats != null) {
            if (stats.getRanking() != null) {
                profile.setRanking(stats.getRanking());
            }
            if (stats.getPoints() != null) {
                profile.setPoints(stats.getPoints());
            }
            if (stats.getWins() != null) {
                profile.setWins(stats.getWins());
            }
            if (stats.getLosses() != null) {
                profile.setLosses(stats.getLosses());
            }
            if (stats.getMatchesPlayed() != null) {
                profile.setMatchesPlayed(stats.getMatchesPlayed());
            }
        }

        if (profileDTO.getPublicProfile() != null) {
            profile.setPublicProfile(profileDTO.getPublicProfile());
        }
    }

    private ProfileDTO toDto(Profile profile) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUserId());
        dto.setName(profile.getName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setCategory(profile.getCategory());
        dto.setPhotoUrl(profile.getPhotoUrl());
        dto.setClubId(profile.getClubId());
        dto.setLicenseId(profile.getLicenseId());
        dto.setSportHistoryId(profile.getSportHistoryId());
        dto.setBio(profile.getBio());
        dto.setSkills(profile.getSkills() != null ? new ArrayList<>(profile.getSkills()) : new ArrayList<>());
        dto.setAchievements(profile.getAchievements() != null ? new ArrayList<>(profile.getAchievements()) : new ArrayList<>());
        dto.setPublicProfile(profile.getPublicProfile());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());

        ProfileStatsDTO stats = new ProfileStatsDTO();
        stats.setRanking(profile.getRanking());
        stats.setPoints(profile.getPoints());
        stats.setWins(profile.getWins());
        stats.setLosses(profile.getLosses());
        stats.setMatchesPlayed(profile.getMatchesPlayed());
        dto.setStats(stats);

        return dto;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String defaultBio(String category) {
        if (!hasText(category)) {
            return "Profil FTTT en cours de completion.";
        }

        return switch (category) {
            case "PLAYER" -> "Profil joueur cree sur la plateforme FTTT.";
            case "CLUB_MANAGER" -> "Profil responsable club cree sur la plateforme FTTT.";
            case "COACH" -> "Profil entraineur cree sur la plateforme FTTT.";
            case "REFEREE" -> "Profil arbitre cree sur la plateforme FTTT.";
            case "ADMIN_FEDERATION" -> "Profil administration federation cree sur la plateforme FTTT.";
            default -> "Profil FTTT en cours de completion.";
        };
    }
}
