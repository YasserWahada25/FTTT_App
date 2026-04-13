package com.FTTTApp.terrain_service.repository;

import com.FTTTApp.terrain_service.entity.Terrain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TerrainRepository extends JpaRepository<Terrain, Long> {

    List<Terrain> findByDisponibleTrue();

    List<Terrain> findByClubId(Long clubId);
}
