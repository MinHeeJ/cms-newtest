package com.cmsnew.community.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String actorId, String eventType, String targetType, String targetId, String summary, String metadata) {
        auditEventRepository.save(new AuditEvent(actorId, eventType, targetType, targetId, summary, metadata));
        log.info("audit eventType={} actorId={} targetType={} targetId={}", eventType, actorId, targetType, targetId);
    }
}
