package com.cmsnew.community.board;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardSubscriptionRepository extends JpaRepository<BoardSubscription, String> {
    boolean existsByMember_IdAndBoard_Id(String memberId, String boardId);

    void deleteByMember_IdAndBoard_Id(String memberId, String boardId);
}
