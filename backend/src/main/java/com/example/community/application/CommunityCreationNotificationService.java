package com.example.community.application;

import com.example.community.domain.CommunityCreationRequest;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CommunityCreationNotificationService {
    private final AuditEventPublisher auditEventPublisher;

    public CommunityCreationNotificationService(AuditEventPublisher auditEventPublisher) {
        this.auditEventPublisher = auditEventPublisher;
    }

    public void notifyCreator(CommunityCreationRequest request, String eventType, String summary) {
        auditEventPublisher.publish(
                request.getCreatorUserId(),
                "COMMUNITY_CREATION_REQUEST",
                request.getId(),
                eventType,
                summary);
    }

    public void notifyOperator(UUID operatorUserId, CommunityCreationRequest request, String eventType, String summary) {
        auditEventPublisher.publish(operatorUserId, "COMMUNITY_CREATION_REQUEST", request.getId(), eventType, summary);
    }
}
