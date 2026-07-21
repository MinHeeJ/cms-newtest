package com.cms;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class CmsController {
  private final CmsService service;
  public CmsController(CmsService service) { this.service = service; }

  @GetMapping("/health")
  public ApiResponse<Map<String,Object>> health() {
    String database = service.ping() == 1 ? "UP" : "DOWN";
    return ApiResponse.ok(Map.of("status", "UP", "service", "cms-backend", "dependencies", Map.of("database", database, "storage", "UP")));
  }

  @GetMapping("/portal/tree")
  public ApiResponse<Map<String,Object>> portalTree() {
    List<Map<String,Object>> folders = service.folders().stream().filter(f -> Boolean.TRUE.equals(f.get("active"))).<Map<String,Object>>map(LinkedHashMap::new).toList();
    List<Map<String,Object>> docs = service.publishedDocuments();
    for (Map<String,Object> folder : folders) {
      Object folderId = folder.get("folderId");
      List<Map<String,Object>> children = docs.stream().filter(d -> Objects.equals(String.valueOf(d.get("folderId")), String.valueOf(folderId))).toList();
      folder.put("documents", children);
    }
    return ApiResponse.ok(Map.of("folders", folders));
  }

  @GetMapping("/search")
  public ApiResponse<Map<String,Object>> search(@RequestParam(required = false) String q, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    if (q == null || q.trim().length() < 2) throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "검색어는 2자 이상 입력하세요.");
    int safeSize = Math.min(Math.max(size, 1), 100);
    return ApiResponse.ok(Map.of("query", q.trim(), "items", service.search(q.trim(), safeSize, Math.max(page, 0) * safeSize), "page", page, "size", safeSize));
  }

  @GetMapping("/portal/documents/{documentId}")
  public ApiResponse<Map<String,Object>> portalDocument(@PathVariable String documentId) {
    Map<String,Object> document = service.portalDocument(documentId);
    if (document == null) throw notFound("문서를 찾을 수 없거나 공개 대상이 아닙니다.");
    document.put("renderedHtml", renderMarkdown(String.valueOf(document.get("markdownBody"))));
    document.put("attachments", service.attachments(documentId));
    return ApiResponse.ok(document);
  }

  @GetMapping("/admin/tree")
  public ApiResponse<Map<String,Object>> adminTree() {
    return ApiResponse.ok(Map.of("folders", service.folders(), "documents", service.documents(100, 0)));
  }

  @GetMapping("/admin/folders")
  public ApiResponse<Map<String,Object>> folders(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
    return ApiResponse.ok(page(service.folders(), page, size));
  }

  @PostMapping("/admin/folders")
  @Transactional
  public ResponseEntity<ApiResponse<Map<String,Object>>> createFolder(@RequestBody Map<String,Object> body) {
    String name = required(body, "name", "폴더명은 필수입니다.");
    Map<String,Object> row = new HashMap<>(body);
    row.put("name", name);
    row.putIfAbsent("active", true);
    row.put("actor", actor(body));
    Map<String,Object> saved = service.insertFolder(row);
    audit("CREATE", "FOLDER", saved.get("folderId"), "폴더 생성");
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
  }

  @PatchMapping("/admin/folders/{folderId}")
  @Transactional
  public ApiResponse<Map<String,Object>> updateFolder(@PathVariable String folderId, @RequestBody Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(body); row.put("folderId", folderId); row.put("actor", actor(body));
    if (service.updateFolder(row) == 0) throw notFound("폴더를 찾을 수 없습니다.");
    audit("UPDATE", "FOLDER", folderId, "폴더 수정");
    return ApiResponse.ok(service.folders().stream().filter(f -> folderId.equals(String.valueOf(f.get("folderId")))).findFirst().orElse(Map.of("folderId", folderId)));
  }

  @DeleteMapping("/admin/folders/{folderId}")
  @Transactional
  public ApiResponse<Map<String,Object>> deleteFolder(@PathVariable String folderId, @RequestBody(required = false) Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(); row.put("folderId", folderId); row.put("actor", actor(body));
    if (service.deleteFolder(row) == 0) throw new ApiException(HttpStatus.CONFLICT, "CONFLICT", "하위 콘텐츠가 있거나 폴더를 찾을 수 없습니다.");
    audit("DELETE", "FOLDER", folderId, "폴더 삭제");
    return ApiResponse.ok(Map.of("folderId", folderId, "deleted", true));
  }

  @GetMapping("/admin/documents")
  public ApiResponse<Map<String,Object>> documents(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    int safeSize = Math.min(Math.max(size, 1), 100);
    return ApiResponse.ok(Map.of("items", service.documents(safeSize, Math.max(page, 0) * safeSize), "page", page, "size", safeSize));
  }

  @PostMapping("/admin/documents")
  @Transactional
  public ResponseEntity<ApiResponse<Map<String,Object>>> createDocument(@RequestBody Map<String,Object> body) {
    required(body, "folderId", "폴더는 필수입니다."); required(body, "title", "제목은 필수입니다."); required(body, "markdownBody", "본문은 필수입니다.");
    Map<String,Object> row = new HashMap<>(body); row.put("actor", actor(body));
    Map<String,Object> saved = service.insertDocument(row);
    audit("CREATE", "DOCUMENT", saved.get("documentId"), "문서 생성");
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
  }

  @PatchMapping("/admin/documents/{documentId}")
  @Transactional
  public ApiResponse<Map<String,Object>> updateDocument(@PathVariable String documentId, @RequestBody Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(body); row.put("documentId", documentId); row.put("actor", actor(body));
    if (service.updateDocument(row) == 0) throw notFound("문서를 찾을 수 없습니다.");
    audit("UPDATE", "DOCUMENT", documentId, "문서 수정");
    return ApiResponse.ok(service.document(documentId));
  }

  @DeleteMapping("/admin/documents/{documentId}")
  @Transactional
  public ApiResponse<Map<String,Object>> deleteDocument(@PathVariable String documentId, @RequestBody(required = false) Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(); row.put("documentId", documentId); row.put("actor", actor(body));
    if (service.deleteDocument(row) == 0) throw notFound("문서를 찾을 수 없습니다.");
    audit("DELETE", "DOCUMENT", documentId, "문서 논리삭제");
    return ApiResponse.ok(Map.of("documentId", documentId, "deleted", true));
  }

  @PostMapping("/admin/documents/{documentId}/publish")
  @Transactional
  public ApiResponse<Map<String,Object>> publish(@PathVariable String documentId, @RequestBody(required = false) Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(); row.put("documentId", documentId); row.put("actor", actor(body));
    if (service.publish(row) == 0) throw new ApiException(HttpStatus.CONFLICT, "CONFLICT", "발행 가능한 문서 상태가 아닙니다.");
    audit("PUBLISH", "DOCUMENT", documentId, "문서 발행");
    return ApiResponse.ok(service.document(documentId));
  }

  @PostMapping("/admin/documents/{documentId}/unpublish")
  @Transactional
  public ApiResponse<Map<String,Object>> unpublish(@PathVariable String documentId, @RequestBody(required = false) Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(); row.put("documentId", documentId); row.put("actor", actor(body));
    if (service.unpublish(row) == 0) throw new ApiException(HttpStatus.CONFLICT, "CONFLICT", "게시중단 가능한 문서 상태가 아닙니다.");
    audit("UNPUBLISH", "DOCUMENT", documentId, "문서 게시중단");
    return ApiResponse.ok(service.document(documentId));
  }

  @PatchMapping("/admin/sort-order")
  @Transactional
  public ResponseEntity<ApiResponse<Map<String,Object>>> sortOrder(@RequestBody Map<String,Object> body) {
    service.audit(new HashMap<>(Map.of("actor", actor(body), "action", "SORT_ORDER", "targetType", "CMS_TREE", "targetId", "sort-order", "detail", String.valueOf(body == null ? Map.of() : body))));
    return ResponseEntity.accepted().body(ApiResponse.ok(Map.of("accepted", true, "message", "정렬 변경 요청이 접수되었습니다.")));
  }

  @PostMapping("/documents/{documentId}/render")
  public ApiResponse<Map<String,Object>> render(@PathVariable String documentId, @RequestBody(required = false) Map<String,Object> body) {
    Map<String,Object> document = service.document(documentId);
    if (document == null) throw notFound("문서를 찾을 수 없습니다.");
    return ApiResponse.ok(Map.of("documentId", documentId, "renderedHtml", renderMarkdown(String.valueOf(document.get("markdownBody")))));
  }

  @PostMapping("/documents/{documentId}/attachments")
  @Transactional
  public ResponseEntity<ApiResponse<Map<String,Object>>> uploadAttachment(@PathVariable String documentId, @RequestBody Map<String,Object> body) {
    if (service.document(documentId) == null) throw notFound("문서를 찾을 수 없습니다.");
    String fileName = required(body, "fileName", "파일명은 필수입니다.");
    long sizeBytes = Long.parseLong(String.valueOf(body.getOrDefault("sizeBytes", "0")));
    if (sizeBytes <= 0 || sizeBytes > 50L * 1024L * 1024L) throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "파일 크기는 1바이트 이상 50MB 이하여야 합니다.");
    if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "파일명에 경로 문자를 사용할 수 없습니다.");
    Map<String,Object> row = new HashMap<>(body); row.put("documentId", documentId); row.put("actor", actor(body)); row.putIfAbsent("contentType", "application/octet-stream");
    Map<String,Object> saved = service.insertAttachment(row);
    audit("UPLOAD", "ATTACHMENT", saved.get("attachmentId"), "첨부 업로드");
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
  }

  @GetMapping("/documents/{documentId}/attachments")
  public ApiResponse<Map<String,Object>> attachments(@PathVariable String documentId) {
    return ApiResponse.ok(Map.of("items", service.attachments(documentId)));
  }

  @GetMapping("/attachments/{attachmentId}/download")
  public ApiResponse<Map<String,Object>> download(@PathVariable String attachmentId) {
    Map<String,Object> attachment = service.attachment(attachmentId);
    if (attachment == null) throw notFound("첨부파일을 찾을 수 없습니다.");
    return ApiResponse.ok(attachment);
  }

  @DeleteMapping("/attachments/{attachmentId}")
  @Transactional
  public ApiResponse<Map<String,Object>> deleteAttachment(@PathVariable String attachmentId, @RequestBody(required = false) Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(); row.put("attachmentId", attachmentId); row.put("actor", actor(body));
    if (service.deleteAttachment(row) == 0) throw notFound("첨부파일을 찾을 수 없습니다.");
    audit("DELETE", "ATTACHMENT", attachmentId, "첨부 삭제");
    return ApiResponse.ok(Map.of("attachmentId", attachmentId, "deleted", true));
  }

  @PostMapping("/documents/{documentId}/import-pdf")
  public ResponseEntity<ApiResponse<Map<String,Object>>> importPdf(@PathVariable String documentId, @RequestBody(required = false) Map<String,Object> body) {
    if (service.document(documentId) == null) throw notFound("문서를 찾을 수 없습니다.");
    return ResponseEntity.accepted().body(ApiResponse.ok(Map.of("documentId", documentId, "status", "REQUESTED", "message", "PDF 변환은 텍스트와 링크 추출 범위에서 비동기로 처리됩니다.")));
  }

  @GetMapping("/admin/audit-logs")
  public ApiResponse<Map<String,Object>> auditLogs(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) { return ApiResponse.ok(Map.of("items", service.auditLogs(size, page * size), "page", page, "size", size)); }
  @GetMapping("/admin/backups")
  public ApiResponse<Map<String,Object>> backups(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    return ApiResponse.ok(Map.of("items", service.jobs("BACKUP", size, page * size), "page", page, "size", size));
  }

  @PostMapping("/admin/backups")
  @Transactional
  public ResponseEntity<ApiResponse<Map<String,Object>>> backup(@RequestBody(required=false) Map<String,Object> body) {
    Map<String,Object> row = jobRow("BACKUP", "REQUESTED", body);
    Map<String,Object> saved = service.insertJob(row);
    audit("REQUEST", "BACKUP", saved.get("jobId"), "BACKUP 작업 요청");
    return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.ok(saved));
  }

  @PostMapping("/admin/backups/{backupId}/restore")
  @Transactional
  public ResponseEntity<ApiResponse<Map<String,Object>>> restore(@PathVariable String backupId) {
    if (service.restore(backupId)==0) throw notFound("백업 작업을 찾을 수 없습니다.");
    audit("RESTORE", "BACKUP", backupId, "복구 요청");
    return ResponseEntity.accepted().body(ApiResponse.ok(Map.of("jobId", backupId, "status", "RESTORE_REQUESTED")));
  }

  @PostMapping("/admin/migrations")
  @Transactional
  public ResponseEntity<ApiResponse<Map<String,Object>>> migration(@RequestBody(required=false) Map<String,Object> body) {
    Map<String,Object> row = jobRow("MIGRATION", "REQUESTED", body);
    Map<String,Object> saved = service.insertJob(row);
    audit("REQUEST", "MIGRATION", saved.get("jobId"), "MIGRATION 작업 요청");
    return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.ok(saved));
  }

  @GetMapping("/admin/migrations/{migrationId}")
  public ApiResponse<Map<String,Object>> migration(@PathVariable String migrationId) {
    Map<String,Object> job=service.job(migrationId);
    if(job==null) throw notFound("이관 작업을 찾을 수 없습니다.");
    return ApiResponse.ok(job);
  }

  @GetMapping("/admin/schedules") public ApiResponse<Map<String,Object>> schedules(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) { return ApiResponse.ok(Map.of("items", service.projects("SCHEDULE", size, page * size), "page", page, "size", size)); }
  @PostMapping("/admin/schedules") @Transactional public ResponseEntity<ApiResponse<Map<String,Object>>> schedule(@RequestBody Map<String,Object> body) { Map<String,Object> saved = service.createProjectRecord("SCHEDULE", body); audit("CREATE", "SCHEDULE", saved.get("recordId"), "SCHEDULE 생성"); return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved)); }
  @PatchMapping("/admin/schedules/{scheduleId}") @Transactional public ApiResponse<Map<String,Object>> patchSchedule(@PathVariable String scheduleId, @RequestBody Map<String,Object> body) { if (!service.updateProjectRecord("SCHEDULE", scheduleId, body)) throw notFound("대상을 찾을 수 없습니다."); audit("UPDATE", "SCHEDULE", scheduleId, "SCHEDULE 수정"); return ApiResponse.ok(Map.of("recordId", scheduleId, "updated", true)); }
  @GetMapping("/admin/scope-items") public ApiResponse<Map<String,Object>> scopes(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) { return ApiResponse.ok(Map.of("items", service.projects("SCOPE", size, page * size), "page", page, "size", size)); }
  @PostMapping("/admin/scope-items") @Transactional public ResponseEntity<ApiResponse<Map<String,Object>>> scope(@RequestBody Map<String,Object> body) { Map<String,Object> saved = service.createProjectRecord("SCOPE", body); audit("CREATE", "SCOPE", saved.get("recordId"), "SCOPE 생성"); return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved)); }
  @PatchMapping("/admin/scope-items/{scopeItemId}") @Transactional public ApiResponse<Map<String,Object>> patchScope(@PathVariable String scopeItemId, @RequestBody Map<String,Object> body) { if (!service.updateProjectRecord("SCOPE", scopeItemId, body)) throw notFound("대상을 찾을 수 없습니다."); audit("UPDATE", "SCOPE", scopeItemId, "SCOPE 수정"); return ApiResponse.ok(Map.of("recordId", scopeItemId, "updated", true)); }
  @GetMapping("/admin/staff") public ApiResponse<Map<String,Object>> staff(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) { return ApiResponse.ok(Map.of("items", service.projects("STAFF", size, page * size), "page", page, "size", size)); }
  @PostMapping("/admin/staff") @Transactional public ResponseEntity<ApiResponse<Map<String,Object>>> staffPost(@RequestBody Map<String,Object> body) { Map<String,Object> saved = service.createProjectRecord("STAFF", body); audit("CREATE", "STAFF", saved.get("recordId"), "STAFF 생성"); return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved)); }
  @PatchMapping("/admin/staff/{staffId}") @Transactional public ApiResponse<Map<String,Object>> patchStaff(@PathVariable String staffId, @RequestBody Map<String,Object> body) { if (!service.updateProjectRecord("STAFF", staffId, body)) throw notFound("대상을 찾을 수 없습니다."); audit("UPDATE", "STAFF", staffId, "STAFF 수정"); return ApiResponse.ok(Map.of("recordId", staffId, "updated", true)); }
  @GetMapping("/admin/risks") public ApiResponse<Map<String,Object>> risks(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) { return ApiResponse.ok(Map.of("items", service.projects("RISK", size, page * size), "page", page, "size", size)); }
  @PostMapping("/admin/risks") @Transactional public ResponseEntity<ApiResponse<Map<String,Object>>> risk(@RequestBody Map<String,Object> body) { Map<String,Object> saved = service.createProjectRecord("RISK", body); audit("CREATE", "RISK", saved.get("recordId"), "RISK 생성"); return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved)); }
  @PatchMapping("/admin/risks/{riskId}") @Transactional public ApiResponse<Map<String,Object>> patchRisk(@PathVariable String riskId, @RequestBody Map<String,Object> body) { if (!service.updateProjectRecord("RISK", riskId, body)) throw notFound("대상을 찾을 수 없습니다."); audit("UPDATE", "RISK", riskId, "RISK 수정"); return ApiResponse.ok(Map.of("recordId", riskId, "updated", true)); }
  @GetMapping("/admin/deliverables") public ApiResponse<Map<String,Object>> deliverables(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) { return ApiResponse.ok(Map.of("items", service.projects("DELIVERABLE", size, page * size), "page", page, "size", size)); }
  @PostMapping("/admin/deliverables") @Transactional public ResponseEntity<ApiResponse<Map<String,Object>>> deliverable(@RequestBody Map<String,Object> body) { Map<String,Object> saved = service.createProjectRecord("DELIVERABLE", body); audit("CREATE", "DELIVERABLE", saved.get("recordId"), "DELIVERABLE 생성"); return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved)); }
  @PatchMapping("/admin/deliverables/{deliverableId}") @Transactional public ApiResponse<Map<String,Object>> patchDeliverable(@PathVariable String deliverableId, @RequestBody Map<String,Object> body) { if (!service.updateProjectRecord("DELIVERABLE", deliverableId, body)) throw notFound("대상을 찾을 수 없습니다."); audit("UPDATE", "DELIVERABLE", deliverableId, "DELIVERABLE 수정"); return ApiResponse.ok(Map.of("recordId", deliverableId, "updated", true)); }
  @GetMapping("/admin/change-requests") public ApiResponse<Map<String,Object>> changes(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) { return ApiResponse.ok(Map.of("items", service.projects("CHANGE", size, page * size), "page", page, "size", size)); }
  @PostMapping("/admin/change-requests") @Transactional public ResponseEntity<ApiResponse<Map<String,Object>>> change(@RequestBody Map<String,Object> body) { Map<String,Object> saved = service.createProjectRecord("CHANGE", body); audit("CREATE", "CHANGE", saved.get("recordId"), "CHANGE 생성"); return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved)); }
  @PatchMapping("/admin/change-requests/{changeRequestId}") @Transactional public ApiResponse<Map<String,Object>> patchChange(@PathVariable String changeRequestId, @RequestBody Map<String,Object> body) { if (!service.updateProjectRecord("CHANGE", changeRequestId, body)) throw notFound("대상을 찾을 수 없습니다."); audit("UPDATE", "CHANGE", changeRequestId, "CHANGE 수정"); return ApiResponse.ok(Map.of("recordId", changeRequestId, "updated", true)); }

  private Map<String,Object> jobRow(String type, String status, Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(body == null ? Map.of() : body);
    row.put("jobType", type);
    row.put("status", status);
    row.put("requestedBy", String.valueOf(row.getOrDefault("requestedBy", "system")));
    row.put("detail", String.valueOf(row));
    return row;
  }

  private ApiResponse<Map<String,Object>> projectPage(String module, int page, int size) {
    return ApiResponse.ok(Map.of("items", service.projects(module, size, page * size), "page", page, "size", size));
  }

  private ResponseEntity<ApiResponse<Map<String,Object>>> createProjectRecord(String module, Map<String,Object> body) {
    required(body, "title", "제목은 필수입니다.");
    required(body, "owner", "담당자는 필수입니다.");
    Map<String,Object> row = new HashMap<>(body);
    row.put("module", module);
    row.putIfAbsent("status", defaultStatus(module));
    Map<String,Object> saved = service.insertProject(row);
    audit("CREATE", module, saved.get("recordId"), module + " 생성");
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
  }

  private ApiResponse<Map<String,Object>> updateProjectRecord(String module, String id, Map<String,Object> body) {
    Map<String,Object> row = new HashMap<>(body);
    row.put("module", module);
    row.put("recordId", id);
    if (service.updateProject(row) == 0) throw notFound("대상을 찾을 수 없습니다.");
    audit("UPDATE", module, id, module + " 수정");
    return ApiResponse.ok(Map.of("recordId", id, "updated", true));
  }
  private ApiException notFound(String message) { return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", message); }
  private String required(Map<String,Object> body, String key, String message) { Object value = body == null ? null : body.get(key); if (value == null || String.valueOf(value).isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message); return String.valueOf(value).trim(); }
  private String actor(Map<String,Object> body) { return body == null ? "system" : String.valueOf(body.getOrDefault("actor", "system")); }
  private void audit(String action, String targetType, Object targetId, String detail) { service.audit(new HashMap<>(Map.of("actor", "system", "action", action, "targetType", targetType, "targetId", String.valueOf(targetId), "detail", detail))); }
  private Map<String,Object> page(List<Map<String,Object>> items, int page, int size) { int safeSize=Math.min(Math.max(size,1),100); return Map.of("items", items.stream().skip((long)Math.max(page,0)*safeSize).limit(safeSize).toList(), "page", page, "size", safeSize, "total", items.size()); }
  private String defaultStatus(String module) { return switch(module) { case "SCHEDULE" -> "PLANNED"; case "SCOPE" -> "REGISTERED"; case "STAFF" -> "ACTIVE"; case "RISK" -> "REGISTERED"; case "DELIVERABLE" -> "DRAFT"; case "CHANGE" -> "REQUESTED"; default -> "REQUESTED"; }; }
  private String renderMarkdown(String markdown) { return markdown.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replaceAll("(?m)^# (.+)$", "<h1>$1</h1>").replace("\n", "<br>"); }
}
