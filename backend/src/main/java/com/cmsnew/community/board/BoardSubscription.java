package com.cmsnew.community.board;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.cmsnew.community.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "board_subscriptions", uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "board_id"}))
public class BoardSubscription {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "board_id")
    private Board board;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    protected BoardSubscription() {
    }

    public BoardSubscription(Member member, Board board) {
        this.member = member;
        this.board = board;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = OffsetDateTime.now();
    }
}
