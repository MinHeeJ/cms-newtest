package com.cmsnew.community.post;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkRepository extends JpaRepository<Bookmark, String> {
    boolean existsByMember_IdAndPost_Id(String memberId, String postId);

    void deleteByMember_IdAndPost_Id(String memberId, String postId);
}
