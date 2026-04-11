package com.FTTTApp.club_service.Service;

import com.FTTTApp.club_service.Client.TerrainClient;
import com.FTTTApp.club_service.Client.TerrainDTO;
import com.FTTTApp.club_service.Entity.Club;
import com.FTTTApp.club_service.Repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class ClubService {
    @Autowired
    private ClubRepository clubRepository;
    @Autowired
    private TerrainClient terrainClient;

    public Club createClub(Club club) {
        return clubRepository.save(club);
    }

    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    public Club getClubById(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club introuvable avec l'ID: " + id));
    }

    public Club updateClub(Long id, Club details) {
        Club club = clubRepository.findById(id).orElseThrow(() -> new RuntimeException("Club non trouvé"));

        club.setName(details.getName());
        club.setCode(details.getCode());
        club.setLogo(details.getLogo());
        club.setAddress(details.getAddress());
        club.setCity(details.getCity());
        club.setRegion(details.getRegion());
        club.setPhone(details.getPhone());
        club.setEmail(details.getEmail());
        club.setWebsite(details.getWebsite());
        club.setFoundedYear(details.getFoundedYear());
        club.setStatus(details.getStatus());

        return clubRepository.save(club);
    }

    public void deleteClub(Long id) {
        clubRepository.deleteById(id);
    }

    public List<TerrainDTO> getTerrainsDisponiblesForClub(Long clubId) {
        try {
            // Vérifier que le club existe
            Club club = getClubById(clubId);

            // Appeler le service Terrain via Feign
            return terrainClient.getTerrainsDisponibles();
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel à Terrain-service"+ e);
            return List.of();
        }
    }
}