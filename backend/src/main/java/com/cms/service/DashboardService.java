package com.cms.service;
import com.cms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class DashboardService {
    private final ContentItemRepository contentRepo;
    private final WorkflowEventRepository eventRepo;
    private final DtoMapper mapper;
    public Map<String,Object> metrics() {
        Map<String,Object> counts = new LinkedHashMap<>();
        counts.put("draft",     contentRepo.countByStatus("DRAFT"));
        counts.put("inReview",  contentRepo.countByStatus("IN_REVIEW"));
        counts.put("approved",  contentRepo.countByStatus("APPROVED"));
        counts.put("scheduled", contentRepo.countByStatus("SCHEDULED"));
        counts.put("published", contentRepo.countByStatus("PUBLISHED"));
        counts.put("archived",  contentRepo.countByStatus("ARCHIVED"));
        List<Map<String,Object>> recent = eventRepo.findTop8ByOrderByCreatedAtDesc()
            .stream().map(mapper::event).collect(Collectors.toList());
        return Map.of("contentCounts", counts,
            "reviewQueueCount", counts.get("inReview"),
            "scheduledCount", counts.get("scheduled"),
            "recentActivity", recent, "publishingTrend", List.of());
    }
}
