package com.cms.operations.controller;

import com.cms.operations.dto.ApiResponse;
import com.cms.operations.service.ActorContext;
import com.cms.operations.service.OperationException;
import com.cms.operations.service.OperationsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class OperationsController {
    private final OperationsService service;

    @GetMapping("/api/health")
    public ApiResponse<Map<String,Object>> health() { return ApiResponse.ok(service.health()); }

    @GetMapping("/api/verifications")
    public ApiResponse<?> listVerifications(@RequestParam(required=false) String status, @RequestParam(required=false) String organizationId, @RequestParam(required=false) String ownerId, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, HttpServletRequest request) {
        return ApiResponse.ok(service.listVerifications(status, organizationId, ownerId, page, size, actor(request)));
    }

    @PostMapping("/api/verifications/{recordId}/decision")
    public ApiResponse<?> decideVerification(@PathVariable UUID recordId, @RequestBody Map<String,Object> body, HttpServletRequest request) {
        return ApiResponse.ok(service.decideVerification(recordId, body, actor(request)));
    }

    @GetMapping("/api/payment-approvals")
    public ApiResponse<?> listPayments(@RequestParam(required=false) String approvalStatus, @RequestParam(required=false) String applicantId, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, HttpServletRequest request) {
        return ApiResponse.ok(service.listPayments(approvalStatus, applicantId, page, size, actor(request)));
    }

    @PostMapping("/api/payment-approvals/{applicationId}/decision")
    public ApiResponse<?> decidePayment(@PathVariable UUID applicationId, @RequestBody Map<String,Object> body, HttpServletRequest request) {
        return ApiResponse.ok(service.decidePayment(applicationId, body, actor(request)));
    }

    @GetMapping("/api/rejection-reasons")
    public ApiResponse<?> listReasons(@RequestParam(required=false) String businessType, @RequestParam(required=false) Boolean active, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return ApiResponse.ok(service.listReasons(businessType, active, page, size));
    }

    @PostMapping("/api/rejection-reasons")
    public ResponseEntity<ApiResponse<?>> createReason(@RequestBody Map<String,Object> body) {
        return ResponseEntity.created(URI.create("/api/rejection-reasons")).body(ApiResponse.ok(service.createReason(body)));
    }

    @PutMapping("/api/rejection-reasons/{reasonId}")
    public ApiResponse<?> updateReason(@PathVariable UUID reasonId, @RequestBody Map<String,Object> body) {
        return ApiResponse.ok(service.updateReason(reasonId, body));
    }

    @GetMapping("/api/appeal-opinions")
    public ApiResponse<?> listAppeals(@RequestParam(required=false) String processingResult, @RequestParam(required=false) String applicantId, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return ApiResponse.ok(service.listAppeals(processingResult, applicantId, page, size));
    }

    @PostMapping("/api/appeal-opinions/{appealId}/review")
    public ApiResponse<?> reviewAppeal(@PathVariable UUID appealId, @RequestBody Map<String,Object> body, HttpServletRequest request) {
        return ApiResponse.ok(service.reviewAppeal(appealId, body, actor(request)));
    }

    @PostMapping("/api/evaluation-batches/generate")
    public ResponseEntity<ApiResponse<?>> generateBatch(@RequestBody Map<String,Object> body, HttpServletRequest request) {
        return ResponseEntity.accepted().body(ApiResponse.ok(service.generateBatch(body, actor(request))));
    }

    @GetMapping("/api/evaluation-batches/{batchId}")
    public ApiResponse<?> getBatch(@PathVariable UUID batchId) { return ApiResponse.ok(service.getBatch(batchId)); }

    @GetMapping("/api/evaluation-batches/delete-preview")
    public ApiResponse<?> previewDelete(@RequestParam int evaluationYear, @RequestParam String evaluationArea, @RequestParam UUID generationBatchId, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return ApiResponse.ok(service.previewDelete(evaluationYear, evaluationArea, generationBatchId, page, size));
    }

    @PostMapping("/api/evaluation-batches/delete")
    public ResponseEntity<ApiResponse<?>> deleteMaterials(@RequestBody Map<String,Object> body, HttpServletRequest request) {
        return ResponseEntity.accepted().body(ApiResponse.ok(service.deleteMaterials(body, actor(request))));
    }

    @PostMapping("/api/evaluation-batches/recalculate")
    public ResponseEntity<ApiResponse<?>> recalculate(@RequestBody Map<String,Object> body, HttpServletRequest request) {
        return ResponseEntity.accepted().body(ApiResponse.ok(service.recalculateScores(body, actor(request))));
    }

    @GetMapping("/api/evaluation-batches/{batchId}/score-diff")
    public ApiResponse<?> scoreDiff(@PathVariable UUID batchId, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return ApiResponse.ok(service.scoreDiff(batchId, page, size));
    }

    @GetMapping("/api/final-evaluations")
    public ApiResponse<?> listFinal(@RequestParam(required=false) Integer evaluationYear, @RequestParam(required=false) String confirmationStatus, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, HttpServletRequest request) {
        return ApiResponse.ok(service.listFinal(evaluationYear, confirmationStatus, page, size, actor(request)));
    }

    @PostMapping("/api/final-evaluations/{evaluationId}/confirm")
    public ApiResponse<?> confirmFinal(@PathVariable UUID evaluationId, HttpServletRequest request) { return ApiResponse.ok(service.confirmFinal(evaluationId, actor(request))); }

    @PostMapping("/api/final-evaluations/{evaluationId}/cancel")
    public ApiResponse<?> cancelFinal(@PathVariable UUID evaluationId, @RequestBody Map<String,Object> body, HttpServletRequest request) { return ApiResponse.ok(service.cancelFinal(evaluationId, body, actor(request))); }

    @GetMapping("/api/batch-results")
    public ApiResponse<?> listBatchResults(@RequestParam(required=false) UUID batchId, @RequestParam(required=false) String jobType, @RequestParam(required=false) Integer evaluationYear, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return ApiResponse.ok(service.listBatchResults(batchId, jobType, evaluationYear, page, size));
    }

    @ExceptionHandler(OperationException.class)
    public ResponseEntity<ApiResponse<Void>> handleOperation(OperationException ex) {
        return ResponseEntity.status(ex.status()).body(ApiResponse.error(ex.code(), ex.getMessage(), ex.details()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadInput(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "요청 형식이 올바르지 않습니다.", java.util.List.of(ex.getMessage())));
    }

    private ActorContext actor(HttpServletRequest request) { return ActorContext.from(request); }
}
