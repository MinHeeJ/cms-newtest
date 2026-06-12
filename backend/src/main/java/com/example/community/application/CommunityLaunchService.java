package com.example.community.application;

import com.example.community.domain.Community;
import com.example.community.domain.CommunityBoard;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityMembership;
import com.example.community.domain.CommunityRule;
import com.example.community.domain.CommunityTypes;
import com.example.community.repository.CommunityCreationRepositories;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CommunityLaunchService {
    private final CommunityCreationRepositories repositories;
    private final Clock clock;
    private final AuditEventPublisher auditEventPublisher;

    public CommunityLaunchService(
            CommunityCreationRepositories repositories,
            Clock clock,
            AuditEventPublisher auditEventPublisher) {
        this.repositories = repositories;
        this.clock = clock;
        this.auditEventPublisher = auditEventPublisher;
    }

    public UUID launch(CommunityCreationRequest request, String idempotencyKey) {
        if (request.getLaunchedCommunityId() != null) {
            return request.getLaunchedCommunityId();
        }

        Instant now = Instant.now(clock);
        Community community = new Community(
                request.getDisplayName(),
                request.getNormalizedName(),
                request.getSlug(),
                request.getCategoryId(),
                request.getDescription() == null ? "" : request.getDescription(),
                request.getVisibility(),
                request.getJoinPolicy(),
                request.getCreatorUserId(),
                request.getRepresentativeImageId(),
                now);
        repositories.persist(community);

        for (CommunityBoard board : request.getBoards()) {
            board.setCommunity(community);
        }
        for (CommunityRule rule : request.getRules()) {
            rule.setCommunity(community);
        }
        if (request.getRepresentativeImageId() != null) {
            repositories.findMediaAsset(request.getRepresentativeImageId())
                    .ifPresent(asset -> asset.attachTo(community));
        }

        repositories.persist(new CommunityMembership(community, request.getCreatorUserId(), CommunityTypes.Role.OWNER));
        request.markLaunched(community.getId(), idempotencyKey, now);
        auditEventPublisher.publish(
                request.getCreatorUserId(),
                "COMMUNITY",
                community.getId(),
                "COMMUNITY_LAUNCHED",
                "커뮤니티가 공개 상태로 전환되었습니다.");
        auditEventPublisher.publish(
                request.getCreatorUserId(),
                "COMMUNITY",
                community.getId(),
                "OWNER_ASSIGNED",
                "생성자가 커뮤니티장으로 지정되었습니다.");
        return community.getId();
    }
}
