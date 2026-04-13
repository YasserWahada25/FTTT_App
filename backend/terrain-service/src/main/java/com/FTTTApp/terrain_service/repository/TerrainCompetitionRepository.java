package com.FTTTApp.terrain_service.repository;

import com.FTTTApp.terrain_service.entity.TerrainCompetition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TerrainCompetitionRepository extends JpaRepository<TerrainCompetition, Long> {

    List<TerrainCompetition> findByTerrain_Id(Long terrainId);

    void deleteByTerrain_Id(Long terrainId);

    boolean existsByTerrain_IdAndCompetitionId(Long terrainId, Long competitionId);
}
