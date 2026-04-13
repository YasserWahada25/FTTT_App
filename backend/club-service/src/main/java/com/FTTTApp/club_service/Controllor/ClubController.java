package com.FTTTApp.club_service.Controllor;

import com.FTTTApp.club_service.Client.TerrainDTO;
import com.FTTTApp.club_service.Entity.Club;
import com.FTTTApp.club_service.Service.ClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {
    @Autowired
    private ClubService clubService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Club createClub(@RequestBody Club club) {
        return clubService.createClub(club);
    }

    @GetMapping
    public List<Club> getAllClubs() {
        return clubService.getAllClubs();
    }

    @GetMapping("/{id}")
    public Club getClubById(@PathVariable("id") Long id) {
        return clubService.getClubById(id);
    }

    @PutMapping("/{id}")
    public Club updateClub(@PathVariable("id") Long id, @RequestBody Club club) {
        return clubService.updateClub(id, club);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClub(@PathVariable("id") Long id) {
        clubService.deleteClub(id);
    }

    @GetMapping("/{id}/terrains-disponibles")
    public List<TerrainDTO> getTerrainsForClub(@PathVariable("id") Long id) {
        return clubService.getTerrainsDisponiblesForClub(id);
    }
}
