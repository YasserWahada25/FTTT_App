package com.FTTTApp.club_service.Repository;

import com.FTTTApp.club_service.Entity.ClubMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {

    long countByClub_Id(Long clubId);

    List<ClubMember> findByClub_IdOrderByJoinedAtAsc(Long clubId);

    List<ClubMember> findByPlayerUserIdOrderByJoinedAtAsc(String playerUserId);

    boolean existsByClub_IdAndPlayerUserId(Long clubId, String playerUserId);

    void deleteByClub_IdAndPlayerUserId(Long clubId, String playerUserId);
}
