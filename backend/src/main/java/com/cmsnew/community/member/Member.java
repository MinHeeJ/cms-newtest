package com.cmsnew.community.member;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.cmsnew.community.common.CommunityEnums.MemberStatus;
import com.cmsnew.community.common.CommunityEnums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "members")
public class Member {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, unique = true)
    private String nickname;

    private String profileImageUrl;

    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status = MemberStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MEMBER;

    @Column(columnDefinition = "text")
    private String notificationPreferences;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    private OffsetDateTime lastLoginAt;

    protected Member() {
    }

    public Member(String email, String passwordHash, String nickname) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.status = MemberStatus.ACTIVE;
        this.role = Role.MEMBER;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public void markLoggedIn() {
        lastLoginAt = OffsetDateTime.now();
    }

    public void updateProfile(String nickname, String bio, String notificationPreferences) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname.trim();
        }
        if (bio != null) {
            this.bio = bio;
        }
        if (notificationPreferences != null) {
            this.notificationPreferences = notificationPreferences;
        }
    }

    public void changeRole(Role role) {
        this.role = role;
    }

    public void changeStatus(MemberStatus status) {
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getBio() {
        return bio;
    }

    public MemberStatus getStatus() {
        return status;
    }

    public Role getRole() {
        return role;
    }

    public String getNotificationPreferences() {
        return notificationPreferences;
    }
}
