package com.example.community.repository;

import com.example.community.domain.AuditEvent;
import com.example.community.domain.Community;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityTypes;
import com.example.community.domain.MediaAsset;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class CommunityCreationRepositories {
    @PersistenceContext
    private EntityManager entityManager;

    public void persist(Object entity) {
        entityManager.persist(entity);
    }

    public Optional<CommunityCreationRequest> findRequest(UUID requestId) {
        return Optional.ofNullable(entityManager.find(CommunityCreationRequest.class, requestId));
    }

    public Optional<Community> findCommunity(UUID communityId) {
        return Optional.ofNullable(entityManager.find(Community.class, communityId));
    }

    public Optional<MediaAsset> findMediaAsset(UUID mediaAssetId) {
        return Optional.ofNullable(entityManager.find(MediaAsset.class, mediaAssetId));
    }

    public boolean existsCommunitySlug(String normalizedSlug) {
        Long count = entityManager.createQuery(
                        "select count(c) from Community c where c.slug = :slug and c.status = :status", Long.class)
                .setParameter("slug", normalizedSlug)
                .setParameter("status", CommunityTypes.CommunityStatus.ACTIVE)
                .getSingleResult();
        return count > 0;
    }

    public boolean existsSubmittedRequestSlug(String normalizedSlug, UUID excludingRequestId) {
        Long count = entityManager.createQuery(
                        """
                        select count(r) from CommunityCreationRequest r
                        where r.slug = :slug
                          and r.id <> :requestId
                          and r.status in (:statuses)
                        """,
                        Long.class)
                .setParameter("slug", normalizedSlug)
                .setParameter("requestId", excludingRequestId)
                .setParameter(
                        "statuses",
                        List.of(
                                CommunityTypes.CreationRequestStatus.PENDING_REVIEW,
                                CommunityTypes.CreationRequestStatus.APPROVED,
                                CommunityTypes.CreationRequestStatus.LAUNCHED))
                .getSingleResult();
        return count > 0;
    }

    public List<CommunityCreationRequest> findReviewQueue(
            CommunityTypes.CreationRequestStatus status,
            CommunityTypes.RiskLevel riskLevel,
            UUID categoryId,
            int page,
            int size) {
        String jpql =
                """
                select r from CommunityCreationRequest r
                where (:status is null or r.status = :status)
                  and (:riskLevel is null or r.riskLevel = :riskLevel)
                  and (:categoryId is null or r.categoryId = :categoryId)
                  and r.status in (:reviewStatuses)
                order by r.submittedAt desc nulls last, r.updatedAt desc
                """;
        return entityManager.createQuery(jpql, CommunityCreationRequest.class)
                .setParameter("status", status)
                .setParameter("riskLevel", riskLevel)
                .setParameter("categoryId", categoryId)
                .setParameter(
                        "reviewStatuses",
                        List.of(
                                CommunityTypes.CreationRequestStatus.PENDING_REVIEW,
                                CommunityTypes.CreationRequestStatus.APPROVED,
                                CommunityTypes.CreationRequestStatus.REJECTED,
                                CommunityTypes.CreationRequestStatus.CHANGE_REQUESTED))
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    public long countReviewQueue(
            CommunityTypes.CreationRequestStatus status,
            CommunityTypes.RiskLevel riskLevel,
            UUID categoryId) {
        String jpql =
                """
                select count(r) from CommunityCreationRequest r
                where (:status is null or r.status = :status)
                  and (:riskLevel is null or r.riskLevel = :riskLevel)
                  and (:categoryId is null or r.categoryId = :categoryId)
                  and r.status in (:reviewStatuses)
                """;
        return entityManager.createQuery(jpql, Long.class)
                .setParameter("status", status)
                .setParameter("riskLevel", riskLevel)
                .setParameter("categoryId", categoryId)
                .setParameter(
                        "reviewStatuses",
                        List.of(
                                CommunityTypes.CreationRequestStatus.PENDING_REVIEW,
                                CommunityTypes.CreationRequestStatus.APPROVED,
                                CommunityTypes.CreationRequestStatus.REJECTED,
                                CommunityTypes.CreationRequestStatus.CHANGE_REQUESTED))
                .getSingleResult();
    }

    public List<AuditEvent> findAuditEvents(String subjectType, UUID subjectId) {
        return entityManager.createQuery(
                        """
                        select e from AuditEvent e
                        where e.subjectType = :subjectType and e.subjectId = :subjectId
                        order by e.createdAt asc
                        """,
                        AuditEvent.class)
                .setParameter("subjectType", subjectType)
                .setParameter("subjectId", subjectId)
                .getResultList();
    }
}
