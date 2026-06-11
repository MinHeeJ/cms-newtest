package com.cmsnew.community.post;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionRepository extends JpaRepository<Reaction, String> {
    Optional<Reaction> findByPost_IdAndMember_Id(String postId, String memberId);

    List<Reaction> findByPost_Id(String postId);

    long countByPost_Id(String postId);

    void deleteByPost_IdAndMember_Id(String postId, String memberId);
}
