package com.cms.repository;
import com.cms.entity.ContentItem;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;
public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {
    boolean existsBySlug(String slug);
    long countByStatus(String status);

    @Query("SELECT c FROM ContentItem c WHERE " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:type IS NULL OR c.contentType = :type)")
    Page<ContentItem> search(@Param("status") String status,
                             @Param("type") String type,
                             Pageable pageable);

    @Query(value = """
        SELECT CAST(published_at AS date) AS date, COUNT(*) AS "publishedCount"
        FROM cms_content_items
        WHERE status = 'PUBLISHED'
          AND published_at IS NOT NULL
          AND published_at >= CURRENT_DATE - INTERVAL '41 days'
        GROUP BY CAST(published_at AS date)
        ORDER BY CAST(published_at AS date)
        """, nativeQuery = true)
    List<PublicationTrendRow> findPublishingTrendSince();

    interface PublicationTrendRow {
        LocalDate getDate();
        long getPublishedCount();
    }
}