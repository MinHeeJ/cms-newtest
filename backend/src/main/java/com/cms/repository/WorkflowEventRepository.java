package com.cms.repository;
import com.cms.entity.WorkflowEvent;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface WorkflowEventRepository extends JpaRepository<WorkflowEvent, UUID> {
    List<WorkflowEvent> findTop8ByOrderByCreatedAtDesc();
    @Query("SELECT e FROM WorkflowEvent e WHERE " +
           "(:actorId IS NULL OR e.actor.id = :actorId) AND " +
           "(:targetType IS NULL OR e.targetType = :targetType) " +
           "ORDER BY e.createdAt DESC")
    Page<WorkflowEvent> search(@Param("actorId") UUID actorId,
                               @Param("targetType") String targetType,
                               Pageable pageable);
}
