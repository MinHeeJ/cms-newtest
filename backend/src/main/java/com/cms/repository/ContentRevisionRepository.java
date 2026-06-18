package com.cms.repository;
import com.cms.entity.ContentRevision;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface ContentRevisionRepository extends JpaRepository<ContentRevision, UUID> {
    List<ContentRevision> findByContentItemIdOrderByRevisionNumberDesc(UUID contentItemId);
    int countByContentItemId(UUID contentItemId);
}
