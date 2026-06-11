package com.cmsnew.community.post;

import java.time.OffsetDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cmsnew.community.common.CommunityEnums.PostStatus;

public interface PostRepository extends JpaRepository<Post, String> {
    @Query("""
            select p from Post p
            join p.board b
            where b.id = :boardId
              and p.status = :status
              and (:category is null or p.category = :category)
            """)
    Page<Post> findPublicBoardPosts(@Param("boardId") String boardId, @Param("category") String category,
                                    @Param("status") PostStatus status, Pageable pageable);

    @Query("""
            select p from Post p
            join p.board b
            where p.status = :status
            """)
    Page<Post> findPublicPosts(@Param("status") PostStatus status, Pageable pageable);

    @Query("""
            select p from Post p
            join p.board b
            where p.status = :status
              and (lower(p.title) like lower(concat('%', :keyword, '%'))
                or lower(p.body) like lower(concat('%', :keyword, '%')))
              and (:boardId is null or b.id = :boardId)
            """)
    Page<Post> searchPublicPosts(@Param("keyword") String keyword, @Param("boardId") String boardId,
                                 @Param("status") PostStatus status, Pageable pageable);

    long countByCreatedAtAfter(OffsetDateTime createdAt);

    long countByStatus(PostStatus status);
}
