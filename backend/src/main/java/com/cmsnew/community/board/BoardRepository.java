package com.cmsnew.community.board;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cmsnew.community.common.CommunityEnums.BoardVisibility;

public interface BoardRepository extends JpaRepository<Board, String> {
    Page<Board> findByVisibilityOrderBySortOrderAscCreatedAtAsc(BoardVisibility visibility, Pageable pageable);

    Optional<Board> findBySlug(String slug);
}
