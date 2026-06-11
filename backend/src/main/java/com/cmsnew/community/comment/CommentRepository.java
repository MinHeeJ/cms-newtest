package com.cmsnew.community.comment;

import java.time.OffsetDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cmsnew.community.common.CommunityEnums.CommentStatus;

public interface CommentRepository extends JpaRepository<Comment, String> {
    Page<Comment> findByPost_IdAndStatusOrderByCreatedAtAsc(String postId, CommentStatus status, Pageable pageable);

    long countByCreatedAtAfter(OffsetDateTime createdAt);
}
