package com.cms.service;
import com.cms.entity.*;
import com.cms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
@Component @RequiredArgsConstructor @Slf4j
public class PublicationScheduler {
    private final PublicationScheduleRepository scheduleRepo;
    private final ContentItemRepository contentRepo;
    private final WorkflowEventRepository eventRepo;
    @Scheduled(fixedDelay=60_000)
    @Transactional
    public void run() {
        scheduleRepo.findDue(Instant.now()).forEach(sch -> {
            try {
                sch.setStatus("RUNNING"); scheduleRepo.save(sch);
                contentRepo.findById(sch.getContentItemId()).ifPresent(item -> {
                    item.setStatus("PUBLISHED"); item.setPublishedAt(Instant.now()); item.setUpdatedAt(Instant.now());
                    contentRepo.save(item);
                    eventRepo.save(WorkflowEvent.builder().eventType("PUBLISH").actor(sch.getRequestedBy())
                        .targetType("CONTENT").targetId(item.getId()).comment("예약 게시").build());
                });
                sch.setStatus("SUCCEEDED"); sch.setExecutedAt(Instant.now()); scheduleRepo.save(sch);
            } catch (Exception e) {
                log.error("예약 게시 실패: {}", sch.getId(), e);
                sch.setStatus("FAILED"); sch.setFailureReason(e.getMessage()); scheduleRepo.save(sch);
            }
        });
    }
}
