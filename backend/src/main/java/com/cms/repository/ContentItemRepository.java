package com.cms.repository;
import com.cms.entity.ContentItem;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {
    boolean existsBySlug(String slug);
    long countByStatus(String status);
    @Query("SELECT c FROM ContentItem c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:type IS NULL OR c.contentType = :type) AND " +
           "(:q IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<ContentItem> search(@Param("status") String status,
                             @Param("type") String type,
                             @Param("q") String q,
                             Pageable pageable);
}
