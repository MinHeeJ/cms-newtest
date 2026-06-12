package com.example.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "community_rules")
public class CommunityRule {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creation_request_id")
    private CommunityCreationRequest creationRequest;

    @Column(nullable = false, length = 80)
    private String title;

    @Column(nullable = false, length = 1200)
    private String body;

    @Column(nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean requiredRule;

    protected CommunityRule() {
    }

    public CommunityRule(String title, String body, int displayOrder, boolean requiredRule) {
        this.title = title == null ? "" : title.strip();
        this.body = body == null ? "" : body.strip();
        this.displayOrder = displayOrder;
        this.requiredRule = requiredRule;
    }

    public void setCreationRequest(CommunityCreationRequest creationRequest) {
        this.creationRequest = creationRequest;
    }

    public void setCommunity(Community community) {
        this.community = community;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isRequiredRule() {
        return requiredRule;
    }
}
