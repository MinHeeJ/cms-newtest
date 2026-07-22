package com.noticeboard;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@MappedSuperclass
abstract class AuditedEntity {
  @Column(name = "created_at", nullable = false)
  OffsetDateTime createdAt;
  @Column(name = "updated_at", nullable = false)
  OffsetDateTime updatedAt;
  @PrePersist void prePersist() { var now = OffsetDateTime.now(); createdAt = now; updatedAt = now; }
  @PreUpdate void preUpdate() { updatedAt = OffsetDateTime.now(); }
}

enum UserRole { USER, ADMIN }
enum NotificationType { NEW_COMMENT }

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
class AppUser extends AuditedEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
  @Column(nullable = false, unique = true) String email;
  @Column(name = "password_hash", nullable = false) String passwordHash;
  @Column(nullable = false) String nickname;
  @Enumerated(EnumType.STRING) @Column(nullable = false) UserRole role = UserRole.USER;
}

@Entity
@Table(name = "notices", indexes = {
  @Index(name = "idx_notices_created_at", columnList = "created_at"),
  @Index(name = "idx_notices_published", columnList = "published")
})
class Notice extends AuditedEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
  @Column(nullable = false) String title;
  @Column(nullable = false, columnDefinition = "text") String content;
  @ManyToOne(optional = false) @JoinColumn(name = "author_id") AppUser author;
  @Column(nullable = false) boolean published = true;
  @Column(name = "view_count", nullable = false) int viewCount = 0;
  @OneToMany(mappedBy = "notice", cascade = CascadeType.REMOVE, orphanRemoval = true) List<Comment> comments = new ArrayList<>();
}

@Entity
@Table(name = "comments", indexes = {@Index(name = "idx_comments_notice", columnList = "notice_id")})
class Comment extends AuditedEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
  @ManyToOne(optional = false) @JoinColumn(name = "notice_id", foreignKey = @ForeignKey(name = "fk_comments_notice")) Notice notice;
  @ManyToOne(optional = false) @JoinColumn(name = "author_id", foreignKey = @ForeignKey(name = "fk_comments_author")) AppUser author;
  @Column(nullable = false, columnDefinition = "text") String content;
}

@Entity
@Table(name = "notifications", indexes = {@Index(name = "idx_notifications_user_read", columnList = "user_id,is_read")})
class NotificationItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
  @ManyToOne(optional = false) @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_notifications_user")) AppUser user;
  @Enumerated(EnumType.STRING) @Column(nullable = false) NotificationType type = NotificationType.NEW_COMMENT;
  @Column(nullable = false) String message;
  @Column(name = "reference_id") Long referenceId;
  @Column(name = "is_read", nullable = false) boolean read = false;
  @Column(name = "created_at", nullable = false) OffsetDateTime createdAt;
  @PrePersist void prePersist() { createdAt = OffsetDateTime.now(); }
}
