package com.cmsnew.community.comment;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.cmsnew.community.common.CommunityEnums.CommentStatus;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.post.Post;

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
@Table(name = "comments")
public class Comment {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private Member author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @Column(nullable = false, length = 2000)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentStatus status = CommentStatus.PUBLISHED;

    @Column(nullable = false)
    private int depth;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    private OffsetDateTime deletedAt;

    protected Comment() {
    }

    public Comment(Post post, Member author, Comment parentComment, String body, int depth) {
        this.post = post;
        this.author = author;
        this.parentComment = parentComment;
        this.body = body;
        this.depth = depth;
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

    public void changeStatus(CommentStatus status) {
        this.status = status;
        if (status == CommentStatus.DELETED) {
            deletedAt = OffsetDateTime.now();
        }
    }

    public String getId() {
        return id;
    }

    public Post getPost() {
        return post;
    }

    public Member getAuthor() {
        return author;
    }

    public Comment getParentComment() {
        return parentComment;
    }

    public String getBody() {
        return body;
    }

    public CommentStatus getStatus() {
        return status;
    }

    public int getDepth() {
        return depth;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
