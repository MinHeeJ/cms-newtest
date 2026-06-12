package com.example.community.application;

import com.example.community.domain.AuditEvent;
import com.example.community.repository.CommunityCreationRepositories;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class AuditEventPublisher {
    private final CommunityCreationRepositories repositories;

    public AuditEventPublisher(CommunityCreationRepositories repositories) {
        this.repositories = repositories;
    }

    public void publish(UUID actorUserId, String subjectType, UUID subjectId, String eventType, String summary) {
        repositories.persist(new AuditEvent(actorUserId, subjectType, subjectId, eventType, summary, "{}"));
    }
}
