package com.cmsnew.community.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    Page<Notification> findByRecipient_IdOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    Page<Notification> findByRecipient_IdAndReadAtIsNullOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    long countByRecipient_IdAndReadAtIsNull(String recipientId);
}
