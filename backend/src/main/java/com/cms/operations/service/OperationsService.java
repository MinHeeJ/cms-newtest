package com.cms.operations.service;

import com.cms.operations.dto.PageResponse;
import com.cms.operations.mapper.OperationsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class OperationsService {
    private final OperationsMapper mapper;

    public Map<String,Object> health() {
        return Map.of("status", "UP", "service", "professor-evaluation-operations");
    }

    public PageResponse<Map<String,Object>> listVerifications(String status, String organizationId, String ownerId, int page, int size, ActorContext actor) {
        String scope = organizationId == null || organizationId.isBlank() ? actor.scope() : organizationId;
        requireScope(actor, scope);
        return PageResponse.of(mapper.listVerifications(blankToNull(status), scope, blankToNull(ownerId), size, page * size), page, size, mapper.countVerifications(blankToNull(status), scope, blankToNull(ownerId)));
    }

    @Transactional
    public Map<String,Object> decideVerification(UUID recordId, Map<String,Object> body, ActorContext actor) {
        requireText(body, "decisionType");
        requireText(body, "opinion");
        requireText(body, "evidence");
        Map<String,Object> current = requireFound(mapper.findVerification(recordId), "VERIFICATION_NOT_FOUND", "대상 실적을 찾을 수 없습니다.");
        requireScope(actor, String.valueOf(current.get("organizationId")));
        String decision = String.valueOf(body.get("decisionType"));
        String status = switch (decision) {
            case "CERTIFY" -> "CERTIFIED";
            case "REJECT" -> "REJECTED";
            case "CANCEL_CERTIFICATION" -> "CANCELED";
            default -> throw validation("허용되지 않는 인증 처리구분입니다.");
        };
        mapper.updateVerification(recordId, status, decision, String.valueOf(body.get("opinion")), String.valueOf(body.get("evidence")), actor.actorId());
        return requireFound(mapper.findVerification(recordId), "VERIFICATION_NOT_FOUND", "대상 실적을 찾을 수 없습니다.");
    }

    public PageResponse<Map<String,Object>> listPayments(String approvalStatus, String applicantId, int page, int size, ActorContext actor) {
        return PageResponse.of(mapper.listPayments(blankToNull(approvalStatus), actor.scope(), blankToNull(applicantId), size, page * size), page, size, mapper.countPayments(blankToNull(approvalStatus), actor.scope(), blankToNull(applicantId)));
    }

    @Transactional
    public Map<String,Object> decidePayment(UUID applicationId, Map<String,Object> body, ActorContext actor) {
        requireRole(actor, "APPROVER");
        requireText(body, "decisionType");
        Map<String,Object> current = requireFound(mapper.findPayment(applicationId), "PAYMENT_NOT_FOUND", "지급승인 대상을 찾을 수 없습니다.");
        requireScope(actor, String.valueOf(current.get("organizationId")));
        String decision = String.valueOf(body.get("decisionType"));
        String status = switch (decision) {
            case "APPROVE" -> "APPROVED";
            case "REJECT" -> "REJECTED";
            case "CANCEL_APPROVAL" -> "CANCELED";
            default -> throw validation("허용되지 않는 지급승인 처리구분입니다.");
        };
        mapper.updatePayment(applicationId, status, text(body, "reason"), actor.actorId());
        Map<String,Object> updated = mapper.listPayments(null, String.valueOf(current.get("organizationId")), null, 100, 0).stream()
            .filter(row -> applicationId.equals(row.get("applicationId"))).findFirst().orElseGet(() -> mapper.findPayment(applicationId));
        updated.put("financialTransferExecuted", false);
        return updated;
    }

    public PageResponse<Map<String,Object>> listReasons(String businessType, Boolean active, int page, int size) {
        return PageResponse.of(mapper.listReasons(blankToNull(businessType), active, size, page * size), page, size, mapper.countReasons(blankToNull(businessType), active));
    }

    @Transactional
    public Map<String,Object> createReason(Map<String,Object> body) {
        requireText(body, "businessType");
        requireText(body, "reasonCode");
        requireText(body, "standardMessage");
        if (!body.containsKey("allowAdditionalComment")) throw validation("추가 의견 허용 여부는 필수입니다.");
        String businessType = String.valueOf(body.get("businessType"));
        String code = String.valueOf(body.get("reasonCode"));
        if (mapper.countReasonDuplicates(businessType, code, null) > 0) {
            throw new OperationException(HttpStatus.CONFLICT, "CONFLICT", "업무유형별 반려사유 코드가 이미 존재합니다.");
        }
        UUID id = UUID.randomUUID();
        mapper.insertReason(id, businessType, code, String.valueOf(body.get("standardMessage")), Boolean.parseBoolean(String.valueOf(body.get("allowAdditionalComment"))));
        return mapper.listReasons(businessType, null, 100, 0).stream().filter(row -> id.equals(row.get("reasonId"))).findFirst().orElseGet(() -> fallbackId("reasonId", id));
    }

    @Transactional
    public Map<String,Object> updateReason(UUID reasonId, Map<String,Object> body) {
        requireText(body, "businessType");
        requireText(body, "reasonCode");
        requireText(body, "standardMessage");
        String businessType = String.valueOf(body.get("businessType"));
        String code = String.valueOf(body.get("reasonCode"));
        if (mapper.countReasonDuplicates(businessType, code, reasonId) > 0) {
            throw new OperationException(HttpStatus.CONFLICT, "CONFLICT", "업무유형별 반려사유 코드가 이미 존재합니다.");
        }
        int changed = mapper.updateReason(reasonId, businessType, code, String.valueOf(body.get("standardMessage")), Boolean.parseBoolean(String.valueOf(body.getOrDefault("allowAdditionalComment", "false"))), Boolean.parseBoolean(String.valueOf(body.getOrDefault("active", "true"))));
        if (changed == 0) throw new OperationException(HttpStatus.NOT_FOUND, "NOT_FOUND", "반려사유를 찾을 수 없습니다.");
        return mapper.listReasons(businessType, null, 100, 0).stream().filter(row -> reasonId.equals(row.get("reasonId"))).findFirst().orElseGet(() -> fallbackId("reasonId", reasonId));
    }

    public PageResponse<Map<String,Object>> listAppeals(String result, String applicantId, int page, int size) {
        return PageResponse.of(mapper.listAppeals(blankToNull(result), blankToNull(applicantId), size, page * size), page, size, mapper.countAppeals(blankToNull(result), blankToNull(applicantId)));
    }

    @Transactional
    public Map<String,Object> reviewAppeal(UUID appealId, Map<String,Object> body, ActorContext actor) {
        requireText(body, "reviewerOpinion");
        requireText(body, "processingResult");
        String result = String.valueOf(body.get("processingResult"));
        if (!Set.of("ACCEPTED", "REJECTED", "PARTIAL").contains(result)) throw validation("허용되지 않는 처리결과입니다.");
        int changed = mapper.reviewAppeal(appealId, String.valueOf(body.get("reviewerOpinion")), result, actor.actorId());
        if (changed == 0) throw new OperationException(HttpStatus.NOT_FOUND, "NOT_FOUND", "이의신청 건을 찾을 수 없습니다.");
        return mapper.findAppeal(appealId);
    }

    @Transactional
    public Map<String,Object> generateBatch(Map<String,Object> body, ActorContext actor) {
        requireText(body, "evaluationArea");
        requireText(body, "generationCriteria");
        int year = intValue(body, "evaluationYear");
        String target = "organizations=" + body.getOrDefault("organizationIds", List.of()) + ";targets=" + body.getOrDefault("targetUserIds", List.of());
        UUID id = UUID.randomUUID();
        mapper.insertBatch(id, "GENERATE", year, String.valueOf(body.get("evaluationArea")), target, String.valueOf(body.get("generationCriteria")), 1, 1, 0, 0, actor.actorId(), null);
        return mapper.findBatch(id);
    }

    public Map<String,Object> getBatch(UUID batchId) {
        return requireFound(mapper.findBatch(batchId), "BATCH_NOT_FOUND", "배치 결과를 찾을 수 없습니다.");
    }

    public PageResponse<Map<String,Object>> previewDelete(int year, String area, UUID generationBatchId, int page, int size) {
        List<Map<String,Object>> items = mapper.deletePreview(year, area, generationBatchId, size, page * size);
        return PageResponse.of(items, page, size, items.size());
    }

    @Transactional
    public Map<String,Object> deleteMaterials(Map<String,Object> body, ActorContext actor) {
        requireText(body, "evaluationArea");
        requireText(body, "generationBatchId");
        requireText(body, "deleteReason");
        int year = intValue(body, "evaluationYear");
        String area = String.valueOf(body.get("evaluationArea"));
        UUID generationBatchId = UUID.fromString(String.valueOf(body.get("generationBatchId")));
        int deleted = mapper.softDeleteMaterials(year, area, generationBatchId, String.valueOf(body.get("deleteReason")));
        UUID id = UUID.randomUUID();
        mapper.insertBatch(id, "DELETE", year, area, "generationBatchId=" + generationBatchId, null, deleted, deleted, 0, 0, actor.actorId(), String.valueOf(body.get("deleteReason")));
        return mapper.findBatch(id);
    }

    @Transactional
    public Map<String,Object> recalculateScores(Map<String,Object> body, ActorContext actor) {
        requireText(body, "evaluationArea");
        requireText(body, "formulaVersion");
        Object targets = body.get("targetUserIds");
        if (!(targets instanceof List<?>) || ((List<?>) targets).isEmpty()) throw validation("대상자는 한 명 이상 필요합니다.");
        int year = intValue(body, "evaluationYear");
        UUID id = UUID.randomUUID();
        mapper.insertBatch(id, "RECALCULATE", year, String.valueOf(body.get("evaluationArea")), "targets=" + targets, String.valueOf(body.get("formulaVersion")), ((List<?>) targets).size(), ((List<?>) targets).size(), 0, 0, actor.actorId(), null);
        return mapper.findBatch(id);
    }

    public PageResponse<Map<String,Object>> scoreDiff(UUID batchId, int page, int size) {
        List<Map<String,Object>> items = mapper.scoreDiff(batchId, size, page * size);
        return PageResponse.of(items, page, size, items.size());
    }

    public PageResponse<Map<String,Object>> listFinal(Integer year, String status, int page, int size, ActorContext actor) {
        return PageResponse.of(mapper.listFinalEvaluations(year, actor.scope(), blankToNull(status), size, page * size), page, size, mapper.countFinalEvaluations(year, actor.scope(), blankToNull(status)));
    }

    @Transactional
    public Map<String,Object> confirmFinal(UUID evaluationId, ActorContext actor) {
        requireRole(actor, "COLLEGE_MANAGER");
        Map<String,Object> current = requireFound(mapper.findFinalEvaluation(evaluationId), "FINAL_EVALUATION_NOT_FOUND", "최종평가를 찾을 수 없습니다.");
        requireScope(actor, String.valueOf(current.get("organizationId")));
        mapper.confirmFinal(evaluationId, actor.actorId());
        return mapper.listFinalEvaluations(null, String.valueOf(current.get("organizationId")), null, 100, 0).stream().filter(row -> evaluationId.equals(row.get("evaluationId"))).findFirst().orElse(current);
    }

    @Transactional
    public Map<String,Object> cancelFinal(UUID evaluationId, Map<String,Object> body, ActorContext actor) {
        requireRole(actor, "CANCEL_MANAGER");
        requireText(body, "cancelReason");
        Map<String,Object> current = requireFound(mapper.findFinalEvaluation(evaluationId), "FINAL_EVALUATION_NOT_FOUND", "최종평가를 찾을 수 없습니다.");
        requireScope(actor, String.valueOf(current.get("organizationId")));
        mapper.cancelFinal(evaluationId, actor.actorId(), String.valueOf(body.get("cancelReason")));
        return mapper.listFinalEvaluations(null, String.valueOf(current.get("organizationId")), null, 100, 0).stream().filter(row -> evaluationId.equals(row.get("evaluationId"))).findFirst().orElse(current);
    }

    public PageResponse<Map<String,Object>> listBatchResults(UUID batchId, String jobType, Integer year, int page, int size) {
        List<Map<String,Object>> rows = mapper.listBatchResults(batchId, blankToNull(jobType), year, size, page * size);
        for (Map<String,Object> row : rows) {
            Object id = row.get("batchId");
            if (id instanceof UUID uuid) row.put("errorDetails", mapper.resultDetails(uuid));
        }
        return PageResponse.of(rows, page, size, mapper.countBatchResults(batchId, blankToNull(jobType), year));
    }

    private void requireScope(ActorContext actor, String organizationId) {
        if (!actor.scope().equals(organizationId) && !actor.roles().contains("ADMIN")) {
            throw new OperationException(HttpStatus.FORBIDDEN, "PERMISSION_DENIED", "권한 또는 데이터 범위가 없습니다.");
        }
    }

    private void requireRole(ActorContext actor, String role) {
        if (!actor.hasRole(role)) throw new OperationException(HttpStatus.FORBIDDEN, "PERMISSION_DENIED", "권한 또는 데이터 범위가 없습니다.");
    }

    private Map<String,Object> requireFound(Map<String,Object> row, String code, String message) {
        if (row == null || row.isEmpty()) throw new OperationException(HttpStatus.NOT_FOUND, code, message);
        return new LinkedHashMap<>(row);
    }

    private Map<String,Object> fallbackId(String key, UUID id) {
        Map<String,Object> fallback = new LinkedHashMap<>();
        fallback.put(key, id);
        return fallback;
    }

    private void requireText(Map<String,Object> body, String field) {
        if (text(body, field) == null) throw validation(field + " 값은 필수입니다.");
    }

    private String text(Map<String,Object> body, String field) {
        Object value = body == null ? null : body.get(field);
        if (value == null || String.valueOf(value).isBlank()) return null;
        return String.valueOf(value);
    }

    private int intValue(Map<String,Object> body, String field) {
        Object value = body == null ? null : body.get(field);
        if (value == null) throw validation(field + " 값은 필수입니다.");
        if (value instanceof Number number) return number.intValue();
        return Integer.parseInt(String.valueOf(value));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private OperationException validation(String message) {
        return new OperationException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }
}
