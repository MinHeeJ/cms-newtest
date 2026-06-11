package com.cmsnew.community.moderation;

import java.util.Collection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cmsnew.community.common.CommunityEnums.ReportReasonCode;
import com.cmsnew.community.common.CommunityEnums.ReportStatus;
import com.cmsnew.community.common.CommunityEnums.ReportTargetType;

public interface ReportRepository extends JpaRepository<Report, String> {
    boolean existsByReporter_IdAndTargetTypeAndTargetIdAndReasonCodeAndStatusIn(
            String reporterId,
            ReportTargetType targetType,
            String targetId,
            ReportReasonCode reasonCode,
            Collection<ReportStatus> status
    );

    Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(ReportStatus status);
}
