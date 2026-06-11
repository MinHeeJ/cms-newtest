package com.cmsnew.community.board;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import com.cmsnew.community.common.CommunityEnums.BoardVisibility;
import com.cmsnew.community.common.CommunityEnums.PostingPolicy;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "boards")
public class Board {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BoardVisibility visibility = BoardVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostingPolicy postingPolicy = PostingPolicy.MEMBERS;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "board_category_options", joinColumns = @JoinColumn(name = "board_id"))
    @Column(name = "category")
    private Set<String> categoryOptions = new LinkedHashSet<>();

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private boolean isArchived;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    protected Board() {
    }

    public Board(String slug, String name, String description, BoardVisibility visibility, PostingPolicy postingPolicy) {
        this.slug = slug;
        this.name = name;
        this.description = description;
        this.visibility = visibility;
        this.postingPolicy = postingPolicy;
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

    public void update(String slug, String name, String description, BoardVisibility visibility, PostingPolicy postingPolicy,
                       Set<String> categoryOptions, int sortOrder, boolean archived) {
        this.slug = slug;
        this.name = name;
        this.description = description;
        this.visibility = visibility;
        this.postingPolicy = postingPolicy;
        this.categoryOptions.clear();
        if (categoryOptions != null) {
            this.categoryOptions.addAll(categoryOptions);
        }
        this.sortOrder = sortOrder;
        this.isArchived = archived;
    }

    public String getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BoardVisibility getVisibility() {
        return visibility;
    }

    public PostingPolicy getPostingPolicy() {
        return postingPolicy;
    }

    public Set<String> getCategoryOptions() {
        return categoryOptions;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isArchived() {
        return isArchived;
    }
}
