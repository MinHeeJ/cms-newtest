package com.cms.service;

import com.cms.repository.ContentItemRepository;
import com.cms.repository.ContentItemRepository.PublicationTrendRow;
import com.cms.repository.WorkflowEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {
    @Mock private ContentItemRepository contentRepo;
    @Mock private WorkflowEventRepository eventRepo;
    @Mock private DtoMapper mapper;
    @InjectMocks private DashboardService dashboardService;

    @Test
    void metricsIncludesPublishingTrendGroupedByPublishedDate() {
        when(contentRepo.countByStatus("DRAFT")).thenReturn(1L);
        when(contentRepo.countByStatus("IN_REVIEW")).thenReturn(2L);
        when(contentRepo.countByStatus("APPROVED")).thenReturn(3L);
        when(contentRepo.countByStatus("SCHEDULED")).thenReturn(4L);
        when(contentRepo.countByStatus("PUBLISHED")).thenReturn(5L);
        when(contentRepo.countByStatus("ARCHIVED")).thenReturn(6L);
        when(eventRepo.findTop8ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(contentRepo.findPublishingTrendSince()).thenReturn(List.of(
            trendRow(LocalDate.of(2026, 6, 10), 2L),
            trendRow(LocalDate.of(2026, 6, 15), 6L)
        ));

        Map<String, Object> metrics = dashboardService.metrics();

        assertThat(metrics.get("publishingTrend")).isEqualTo(List.of(
            Map.of("date", "2026-06-10", "publishedCount", 2L),
            Map.of("date", "2026-06-15", "publishedCount", 6L)
        ));
    }

    private PublicationTrendRow trendRow(LocalDate date, long publishedCount) {
        return new PublicationTrendRow() {
            @Override public LocalDate getDate() { return date; }
            @Override public long getPublishedCount() { return publishedCount; }
        };
    }
}
