package com.cmsnew.community.post;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.cmsnew.community.board.Board;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "board_id")
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private Member author;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.PUBLISHED;

    @Column(nullable = false)
    private boolean isNotice;

    @Column(nullable = false)
    private boolean isPinned;

    @Column(nullable = false)
    private int viewCount;

    @Column(nullable = false)
    private int commentCount;

    @Column(nullable = false)
    private int reactionCount;

    @Column(nullable = false)
    private int reportCount;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    private OffsetDateTime deletedAt;

    protected Post() {
    }

    public Post(Board board, Member author, String title, String body, String category) {
        this.board = board;
        this.author = author;
        this.title = title;
        this.body = body;
        this.category = category;
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

    public void update(String title, String body, String category) {
        if (title != null && !title.isBlank()) {
            this.title = title.trim();
        }
        if (body != null && !body.isBlank()) {
            this.body = body;
        }
        if (category != null) {
            this.category = category.isBlank() ? null : category.trim();
        }
    }

    public void incrementViewCount() {
        viewCount++;
    }

    public void incrementCommentCount() {
        commentCount++;
    }

    public void setReactionCount(int reactionCount) {
        this.reactionCount = reactionCount;
    }

    public void incrementReportCount() {
        reportCount++;
    }

    public void changeStatus(PostStatus status) {
        this.status = status;
        if (status == PostStatus.DELETED) {
            deletedAt = OffsetDateTime.now();
        }
    }

    public void pin(boolean pinned) {
        isPinned = pinned;
    }

    public void notice(boolean notice) {
        isNotice = notice;
    }

    public String getId() {
        return id;
    }

    public Board getBoard() {
        return board;
    }

    public Member getAuthor() {
        return author;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getCategory() {
        return category;
    }

    public PostStatus getStatus() {
        return status;
    }

    public boolean isNotice() {
        return isNotice;
    }

    public boolean isPinned() {
        return isPinned;
    }

    public int getViewCount() {
        return viewCount;
    }

    public int getCommentCount() {
        return commentCount;
    }

    public int getReactionCount() {
        return reactionCount;
    }

    public int getReportCount() {
        return reportCount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
