package com.cms.operations.mapper;

import org.apache.ibatis.annotations.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Mapper
public interface OperationsMapper {
    @Select("""
        SELECT record_id AS "recordId", source_achievement_id AS "sourceAchievementId", owner_id AS "ownerId", owner_name AS "ownerName",
               organization_id AS "organizationId", evaluation_area AS "evaluationArea", verification_status AS "verificationStatus",
               decision_type AS "decisionType", opinion, evidence, processed_by AS "processedBy", processed_at AS "processedAt", version
        FROM verification_records
        WHERE (#{status} IS NULL OR verification_status = #{status})
          AND (#{organizationId} IS NULL OR organization_id = #{organizationId})
          AND (#{ownerId} IS NULL OR owner_id = #{ownerId})
        ORDER BY updated_at DESC LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> listVerifications(String status, String organizationId, String ownerId, int size, int offset);

    @Select("SELECT count(*) FROM verification_records WHERE (#{status} IS NULL OR verification_status = #{status}) AND (#{organizationId} IS NULL OR organization_id = #{organizationId}) AND (#{ownerId} IS NULL OR owner_id = #{ownerId})")
    long countVerifications(String status, String organizationId, String ownerId);

    @Select("""
        SELECT record_id AS "recordId", organization_id AS "organizationId", verification_status AS "verificationStatus" FROM verification_records WHERE record_id = #{recordId}
        """)
    Map<String,Object> findVerification(UUID recordId);

    @Update("UPDATE verification_records SET verification_status=#{status}, decision_type=#{decisionType}, opinion=#{opinion}, evidence=#{evidence}, processed_by=#{actorId}, processed_at=now(), version=version+1, updated_at=now() WHERE record_id=#{recordId}")
    void updateVerification(UUID recordId, String status, String decisionType, String opinion, String evidence, String actorId);

    @Select("""
        SELECT application_id AS "applicationId", applicant_id AS "applicantId", applicant_name AS "applicantName", organization_id AS "organizationId",
               requested_amount AS "requestedAmount", payment_amount AS "paymentAmount", bank_name || ' ****-**-' || account_last4 AS "maskedAccount",
               linked_achievement AS "linkedAchievement", approval_status AS "approvalStatus", decision_reason AS "decisionReason",
               processed_by AS "processedBy", processed_at AS "processedAt", financial_transfer_executed AS "financialTransferExecuted", version
        FROM payment_approvals
        WHERE (#{approvalStatus} IS NULL OR approval_status = #{approvalStatus}) AND (#{scope} IS NULL OR organization_id = #{scope}) AND (#{applicantId} IS NULL OR applicant_id = #{applicantId})
        ORDER BY updated_at DESC LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> listPayments(String approvalStatus, String scope, String applicantId, int size, int offset);

    @Select("SELECT count(*) FROM payment_approvals WHERE (#{approvalStatus} IS NULL OR approval_status = #{approvalStatus}) AND (#{scope} IS NULL OR organization_id = #{scope}) AND (#{applicantId} IS NULL OR applicant_id = #{applicantId})")
    long countPayments(String approvalStatus, String scope, String applicantId);

    @Select("""
        SELECT application_id AS "applicationId", organization_id AS "organizationId", approval_status AS "approvalStatus" FROM payment_approvals WHERE application_id = #{applicationId}
        """)
    Map<String,Object> findPayment(UUID applicationId);

    @Update("UPDATE payment_approvals SET approval_status=#{status}, decision_reason=#{reason}, processed_by=#{actorId}, processed_at=now(), financial_transfer_executed=false, version=version+1, updated_at=now() WHERE application_id=#{applicationId}")
    void updatePayment(UUID applicationId, String status, String reason, String actorId);

    @Select("""
        SELECT reason_id AS "reasonId", business_type AS "businessType", reason_code AS "reasonCode", standard_message AS "standardMessage", allow_additional_comment AS "allowAdditionalComment", active, CASE WHEN active THEN 'ACTIVE' ELSE 'INACTIVE' END AS "state", version FROM rejection_reasons WHERE (#{businessType} IS NULL OR business_type=#{businessType}) AND (#{active} IS NULL OR active=#{active}) ORDER BY business_type, reason_code LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> listReasons(String businessType, Boolean active, int size, int offset);

    @Select("SELECT count(*) FROM rejection_reasons WHERE (#{businessType} IS NULL OR business_type=#{businessType}) AND (#{active} IS NULL OR active=#{active})")
    long countReasons(String businessType, Boolean active);

    @Select("SELECT count(*) FROM rejection_reasons WHERE business_type=#{businessType} AND reason_code=#{reasonCode} AND (#{reasonId} IS NULL OR reason_id <> #{reasonId})")
    int countReasonDuplicates(String businessType, String reasonCode, UUID reasonId);

    @Insert("INSERT INTO rejection_reasons (reason_id, business_type, reason_code, standard_message, allow_additional_comment, active) VALUES (#{reasonId}, #{businessType}, #{reasonCode}, #{standardMessage}, #{allowAdditionalComment}, true)")
    void insertReason(UUID reasonId, String businessType, String reasonCode, String standardMessage, boolean allowAdditionalComment);

    @Update("UPDATE rejection_reasons SET business_type=#{businessType}, reason_code=#{reasonCode}, standard_message=#{standardMessage}, allow_additional_comment=#{allowAdditionalComment}, active=#{active}, version=version+1, updated_at=now() WHERE reason_id=#{reasonId}")
    int updateReason(UUID reasonId, String businessType, String reasonCode, String standardMessage, boolean allowAdditionalComment, boolean active);

    @Select("""
        SELECT appeal_id AS "appealId", applicant_id AS "applicantId", applicant_name AS "applicantName", application_content AS "applicationContent", applicant_opinion AS "applicantOpinion", reviewer_opinion AS "reviewerOpinion", processing_result AS "processingResult", processed_by AS "processedBy", processed_at AS "processedAt", version FROM appeal_opinions WHERE (#{processingResult} IS NULL OR processing_result=#{processingResult}) AND (#{applicantId} IS NULL OR applicant_id=#{applicantId}) ORDER BY updated_at DESC LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> listAppeals(String processingResult, String applicantId, int size, int offset);

    @Select("SELECT count(*) FROM appeal_opinions WHERE (#{processingResult} IS NULL OR processing_result=#{processingResult}) AND (#{applicantId} IS NULL OR applicant_id=#{applicantId})")
    long countAppeals(String processingResult, String applicantId);

    @Update("UPDATE appeal_opinions SET reviewer_opinion=#{reviewerOpinion}, processing_result=#{processingResult}, processed_by=#{actorId}, processed_at=now(), version=version+1, updated_at=now() WHERE appeal_id=#{appealId}")
    int reviewAppeal(UUID appealId, String reviewerOpinion, String processingResult, String actorId);

    @Select("""
        SELECT appeal_id AS "appealId", applicant_id AS "applicantId", applicant_name AS "applicantName", application_content AS "applicationContent", applicant_opinion AS "applicantOpinion", reviewer_opinion AS "reviewerOpinion", processing_result AS "processingResult", processed_by AS "processedBy", processed_at AS "processedAt" FROM appeal_opinions WHERE appeal_id=#{appealId}
        """)
    Map<String,Object> findAppeal(UUID appealId);

    @Insert("INSERT INTO evaluation_batches (batch_id, job_type, evaluation_year, evaluation_area, target_condition, generation_criteria, status, total_count, success_count, failed_count, excluded_count, requested_by, reason) VALUES (#{batchId}, #{jobType}, #{year}, #{area}, #{targetCondition}, #{criteria}, 'SUCCEEDED', #{total}, #{success}, #{failed}, #{excluded}, #{actorId}, #{reason})")
    void insertBatch(UUID batchId, String jobType, int year, String area, String targetCondition, String criteria, int total, int success, int failed, int excluded, String actorId, String reason);

    @Select("""
        SELECT batch_id AS "batchId", job_type AS "jobType", evaluation_year AS "evaluationYear", evaluation_area AS "evaluationArea", target_condition AS "targetCondition", generation_criteria AS "generationCriteria", status, total_count AS "totalCount", success_count AS "successCount", failed_count AS "failedCount", excluded_count AS "excludedCount", requested_by AS "requestedBy", requested_at AS "requestedAt", reason FROM evaluation_batches WHERE batch_id=#{batchId}
        """)
    Map<String,Object> findBatch(UUID batchId);

    @Select("""
        SELECT material_id AS "materialId", target_user_id AS "targetUserId", target_user_name AS "targetUserName", generation_batch_id AS "generationBatchId", material_status AS "materialStatus", true AS deletable FROM evaluation_materials WHERE evaluation_year=#{year} AND evaluation_area=#{area} AND generation_batch_id=#{batchId} AND material_status='ACTIVE' ORDER BY created_at DESC LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> deletePreview(int year, String area, UUID batchId, int size, int offset);

    @Update("UPDATE evaluation_materials SET material_status='DELETED', deleted_reason=#{reason}, deleted_at=now() WHERE evaluation_year=#{year} AND evaluation_area=#{area} AND generation_batch_id=#{batchId} AND material_status='ACTIVE'")
    int softDeleteMaterials(int year, String area, UUID batchId, String reason);

    @Select("""
        SELECT diff_id AS "diffId", batch_id AS "batchId", target_user_id AS "targetUserId", evaluation_area AS "evaluationArea", before_score AS "beforeScore", after_score AS "afterScore", formula_version AS "formulaVersion" FROM score_recalculation_diffs WHERE batch_id=#{batchId} ORDER BY created_at DESC LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> scoreDiff(UUID batchId, int size, int offset);

    @Select("""
        SELECT evaluation_id AS "evaluationId", evaluation_year AS "evaluationYear", organization_id AS "organizationId", target_user_id AS "targetUserId", target_user_name AS "targetUserName", final_score AS "finalScore", result_grade AS "resultGrade", confirmation_status AS "confirmationStatus", confirmed_by AS "confirmedBy", confirmed_at AS "confirmedAt", canceled_by AS "canceledBy", canceled_at AS "canceledAt", cancel_reason AS "cancelReason", version FROM final_evaluations WHERE (#{year} IS NULL OR evaluation_year=#{year}) AND (#{scope} IS NULL OR organization_id=#{scope}) AND (#{status} IS NULL OR confirmation_status=#{status}) ORDER BY target_user_name LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> listFinalEvaluations(Integer year, String scope, String status, int size, int offset);

    @Select("SELECT count(*) FROM final_evaluations WHERE (#{year} IS NULL OR evaluation_year=#{year}) AND (#{scope} IS NULL OR organization_id=#{scope}) AND (#{status} IS NULL OR confirmation_status=#{status})")
    long countFinalEvaluations(Integer year, String scope, String status);

    @Select("""
        SELECT evaluation_id AS "evaluationId", organization_id AS "organizationId", final_score AS "finalScore", confirmation_status AS "confirmationStatus" FROM final_evaluations WHERE evaluation_id=#{evaluationId}
        """)
    Map<String,Object> findFinalEvaluation(UUID evaluationId);

    @Update("UPDATE final_evaluations SET confirmation_status='CONFIRMED', confirmed_by=#{actorId}, confirmed_at=now(), version=version+1 WHERE evaluation_id=#{evaluationId}")
    void confirmFinal(UUID evaluationId, String actorId);

    @Update("UPDATE final_evaluations SET confirmation_status='CANCELED', canceled_by=#{actorId}, canceled_at=now(), cancel_reason=#{reason}, version=version+1 WHERE evaluation_id=#{evaluationId}")
    void cancelFinal(UUID evaluationId, String actorId, String reason);

    @Select("""
        SELECT result_id AS "resultId", batch_id AS "batchId", job_type AS "jobType", target_identifier AS "targetIdentifier", result_status AS "resultStatus", error_code AS "errorCode", error_message AS "errorMessage" FROM batch_results WHERE batch_id=#{batchId}
        """)
    List<Map<String,Object>> resultDetails(UUID batchId);

    @Select("""
        SELECT b.batch_id AS "batchId", b.job_type AS "jobType", b.evaluation_year AS "evaluationYear", b.evaluation_area AS "evaluationArea", b.target_condition AS "targetCondition", b.status,
               b.total_count AS "totalCount", b.success_count AS "successCount", b.failed_count AS "failedCount", b.excluded_count AS "excludedCount",
               (b.total_count = b.success_count + b.failed_count + b.excluded_count) AS "countInvariantValid"
        FROM evaluation_batches b
        WHERE (#{batchId} IS NULL OR b.batch_id=#{batchId}) AND (#{jobType} IS NULL OR b.job_type=#{jobType}) AND (#{year} IS NULL OR b.evaluation_year=#{year})
        ORDER BY b.requested_at DESC LIMIT #{size} OFFSET #{offset}
        """)
    List<Map<String,Object>> listBatchResults(UUID batchId, String jobType, Integer year, int size, int offset);

    @Select("SELECT count(*) FROM evaluation_batches WHERE (#{batchId} IS NULL OR batch_id=#{batchId}) AND (#{jobType} IS NULL OR job_type=#{jobType}) AND (#{year} IS NULL OR evaluation_year=#{year})")
    long countBatchResults(UUID batchId, String jobType, Integer year);
}
