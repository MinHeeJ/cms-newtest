package com.cmsnew.community.moderation;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModerationActionRepository extends JpaRepository<ModerationAction, String> {
}
