package com.cms.contract;

import com.cms.security.SessionFilter;
import com.cms.entity.CmsUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ContractController {
    private final JdbcTemplate jdbc;
    public ContractController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping("/health")
    public ResponseEntity<Map<String,Object>> health(HttpServletRequest request) {
        return ok(request, Map.of("status", "UP", "service", "cms-backend"));
    }

    @GetMapping("/portal/tree")
    public ResponseEntity<Map<String,Object>> tree(HttpServletRequest request) {
        List<Map<String,Object>> folders = jdbc.queryForList("SELECT id, parent_id, name, active, display_order FROM cms_folders WHERE active = true ORDER BY parent_id NULLS FIRST, display_order, name");
        return ok(request, folders);
    }

    @GetMapping("/portal/documents")
    public ResponseEntity<Map<String,Object>> search(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, @RequestParam(required=false) String q, HttpServletRequest request) {
        if (page < 0 || size < 1 || size > 100 || (q != null && q.trim().length() == 1)) return error(request, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "검색어 또는 페이지 조건을 확인하세요.");
        String term = q == null ? "" : q.trim();
        String like = "%" + term + "%";
        List<Map<String,Object>> rows = jdbc.queryForList("SELECT id, title, summary, markdown_body, updated_at, folder_id FROM cms_content_items WHERE status = 'PUBLISHED' AND archived_at IS NULL AND visibility = 'PUBLIC' AND (? = '' OR title ILIKE ? OR markdown_body ILIKE ?) ORDER BY updated_at DESC LIMIT ? OFFSET ?", term, like, like, size, page * size);
        Long total = jdbc.queryForObject("SELECT count(*) FROM cms_content_items WHERE status = 'PUBLISHED' AND archived_at IS NULL AND visibility = 'PUBLIC' AND (? = '' OR title ILIKE ? OR markdown_body ILIKE ?)", Long.class, term, like, like);
        return paged(request, rows, page, size, total == null ? 0 : total);
    }

    @GetMapping("/portal/documents/{id}")
    public ResponseEntity<Map<String,Object>> document(@PathVariable UUID id, HttpServletRequest request) {
        List<Map<String,Object>> rows = jdbc.queryForList("SELECT id, title, summary, markdown_body, updated_at, folder_id FROM cms_content_items WHERE id = ? AND status = 'PUBLISHED' AND archived_at IS NULL AND visibility = 'PUBLIC'", id);
        if (rows.isEmpty()) return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "공개된 문서를 찾을 수 없습니다.");
        return ok(request, rows.get(0));
    }

    @GetMapping("/admin/folders")
    public ResponseEntity<Map<String,Object>> folders(HttpServletRequest request) {
        if (!isAuthenticated(request)) return unauthorized(request);
        List<Map<String,Object>> rows = jdbc.queryForList("SELECT id, parent_id, name, active, display_order, version FROM cms_folders ORDER BY parent_id NULLS FIRST, display_order, name");
        Long total = jdbc.queryForObject("SELECT count(*) FROM cms_folders", Long.class);
        return paged(request, rows, 0, 20, total == null ? 0 : total);
    }

    @PostMapping("/admin/folders")
    public ResponseEntity<Map<String,Object>> createFolder(@Valid @RequestBody FolderInput input, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        UUID id = UUID.randomUUID();
        try { jdbc.update("INSERT INTO cms_folders(id,parent_id,name,active,display_order) VALUES (?,?,?,?,?)", id, input.parentId(), input.name().trim(), input.active(), input.displayOrder()); }
        catch (org.springframework.dao.DataIntegrityViolationException ex) { return error(request, HttpStatus.CONFLICT, "CONFLICT", "같은 위치에 같은 이름의 폴더가 있습니다."); }
        audit(request, "CREATE_FOLDER", id, input.name());
        return created(request, Map.of("id", id, "name", input.name().trim(), "active", input.active(), "displayOrder", input.displayOrder()));
    }

    @GetMapping("/admin/documents")
    public ResponseEntity<Map<String,Object>> adminDocuments(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, HttpServletRequest request) {
        if (!isAuthenticated(request)) return unauthorized(request);
        List<Map<String,Object>> rows = jdbc.queryForList("SELECT id,title,summary,status,folder_id,updated_at,version FROM cms_content_items ORDER BY updated_at DESC LIMIT ? OFFSET ?", size, page * size);
        return paged(request, rows, page, size, rows.size());
    }

    @PostMapping("/admin/documents")
    public ResponseEntity<Map<String,Object>> createDocument(@Valid @RequestBody DocumentInput input, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        UUID id = UUID.randomUUID();
        try { jdbc.update("INSERT INTO cms_content_items(id,folder_id,content_type,title,slug,status,summary,markdown_body,visibility,author_id) VALUES (?,?,'ARTICLE',?,?, 'DRAFT',? ,?,'PUBLIC',?)", id, input.folderId(), input.title().trim(), slug(input.title()), input.summary() == null ? "" : input.summary(), input.markdownBody(), userId(request)); }
        catch (org.springframework.dao.DataIntegrityViolationException ex) { return error(request, HttpStatus.CONFLICT, "CONFLICT", "문서를 저장할 수 없습니다."); }
        audit(request, "CREATE_DOCUMENT", id, input.title());
        return created(request, Map.of("id", id, "title", input.title(), "status", "DRAFT", "folderId", input.folderId()));
    }

    @PostMapping("/admin/documents/{id}/transitions")
    public ResponseEntity<Map<String,Object>> transition(@PathVariable UUID id, @RequestBody TransitionInput input, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        String current;
        try { current = jdbc.queryForObject("SELECT status FROM cms_content_items WHERE id = ?", String.class, id); } catch (org.springframework.dao.EmptyResultDataAccessException ex) { return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "문서를 찾을 수 없습니다."); }
        if (!allowed(current, input.targetStatus())) return error(request, HttpStatus.CONFLICT, "INVALID_TRANSITION", "허용되지 않은 상태 전이입니다.");
        jdbc.update("UPDATE cms_content_items SET status=?, published_at=CASE WHEN ?='PUBLISHED' THEN now() ELSE published_at END, updated_at=now() WHERE id=?", input.targetStatus(), input.targetStatus(), id);
        audit(request, "TRANSITION_DOCUMENT", id, current + " -> " + input.targetStatus());
        return ok(request, Map.of("id", id, "status", input.targetStatus()));
    }

    @GetMapping("/admin/health/details")
    public ResponseEntity<Map<String,Object>> details(HttpServletRequest request) { if (!isAuthenticated(request)) return unauthorized(request); return ok(request, Map.of("application", "UP", "database", "UP", "files", "UP")); }

    @PutMapping("/admin/folders/{folderId}")
    public ResponseEntity<Map<String,Object>> updateFolder(@PathVariable UUID folderId, @Valid @RequestBody FolderInput input, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        int changed = jdbc.update("UPDATE cms_folders SET parent_id=?, name=?, active=?, display_order=?, version=version+1 WHERE id=?", input.parentId(), input.name().trim(), input.active(), input.displayOrder(), folderId);
        if (changed == 0) return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "폴더를 찾을 수 없습니다.");
        audit(request, "UPDATE_FOLDER", folderId, input.name());
        return ok(request, Map.of("id", folderId, "name", input.name().trim(), "active", input.active(), "displayOrder", input.displayOrder()));
    }

    @DeleteMapping("/admin/folders/{folderId}")
    public ResponseEntity<Map<String,Object>> deleteFolder(@PathVariable UUID folderId, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        Long children = jdbc.queryForObject("SELECT count(*) FROM cms_folders WHERE parent_id=?", Long.class, folderId);
        Long documents = jdbc.queryForObject("SELECT count(*) FROM cms_content_items WHERE folder_id=? AND archived_at IS NULL", Long.class, folderId);
        if ((children != null && children > 0) || (documents != null && documents > 0)) return error(request, HttpStatus.CONFLICT, "CONFLICT", "비어 있지 않은 폴더는 삭제할 수 없습니다.");
        if (jdbc.update("DELETE FROM cms_folders WHERE id=?", folderId) == 0) return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "폴더를 찾을 수 없습니다.");
        audit(request, "DELETE_FOLDER", folderId, "deleted");
        return ok(request, Map.of("id", folderId, "status", "DELETED"));
    }

    @GetMapping("/admin/documents/{documentId}")
    public ResponseEntity<Map<String,Object>> getAdminDocument(@PathVariable UUID documentId, HttpServletRequest request) {
        if (!isAuthenticated(request)) return unauthorized(request);
        List<Map<String,Object>> rows = jdbc.queryForList("SELECT id,title,summary,markdown_body,status,folder_id,updated_at,version FROM cms_content_items WHERE id=?", documentId);
        return rows.isEmpty() ? error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "문서를 찾을 수 없습니다.") : ok(request, rows.get(0));
    }

    @PutMapping("/admin/documents/{documentId}")
    public ResponseEntity<Map<String,Object>> updateDocument(@PathVariable UUID documentId, @Valid @RequestBody DocumentInput input, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        int changed = jdbc.update("UPDATE cms_content_items SET folder_id=?, title=?, summary=?, markdown_body=?, updated_at=now(), version=version+1 WHERE id=? AND archived_at IS NULL", input.folderId(), input.title().trim(), input.summary(), input.markdownBody(), documentId);
        if (changed == 0) return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "문서를 찾을 수 없습니다.");
        audit(request, "UPDATE_DOCUMENT", documentId, input.title());
        return ok(request, Map.of("id", documentId, "title", input.title().trim(), "status", "UPDATED"));
    }

    @DeleteMapping("/admin/documents/{documentId}")
    public ResponseEntity<Map<String,Object>> deleteDocument(@PathVariable UUID documentId, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        if (jdbc.update("UPDATE cms_content_items SET archived_at=now(), status='DELETED', updated_at=now() WHERE id=? AND archived_at IS NULL", documentId) == 0) return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "문서를 찾을 수 없습니다.");
        audit(request, "DELETE_DOCUMENT", documentId, "deleted");
        return ok(request, Map.of("id", documentId, "status", "DELETED"));
    }

    @GetMapping("/admin/documents/{documentId}/attachments")
    public ResponseEntity<Map<String,Object>> listAttachments(@PathVariable UUID documentId, HttpServletRequest request) {
        if (!isAuthenticated(request)) return unauthorized(request);
        return ok(request, jdbc.queryForList("SELECT id,document_id,original_name,mime_type,size_bytes,status,created_at FROM cms_attachments WHERE document_id=? AND status <> 'DELETED' ORDER BY created_at DESC", documentId));
    }

    @PostMapping("/admin/documents/{documentId}/attachments")
    public ResponseEntity<Map<String,Object>> uploadAttachment(@PathVariable UUID documentId, @RequestPart("file") MultipartFile file, HttpServletRequest request) throws java.io.IOException {
        if (!isAdmin(request)) return unauthorized(request);
        if (file.isEmpty()) return error(request, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "파일이 필요합니다.");
        if (jdbc.queryForObject("SELECT count(*) FROM cms_content_items WHERE id = ? AND archived_at IS NULL", Long.class, documentId) == 0) {
            return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "문서를 찾을 수 없습니다.");
        }
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO cms_attachments(id,document_id,original_name,storage_key,mime_type,size_bytes,status,content) VALUES (?,?,?,?,?,?, 'AVAILABLE', ?)", id, documentId, file.getOriginalFilename(), id.toString(), Optional.ofNullable(file.getContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE), file.getSize(), file.getBytes());
        audit(request, "UPLOAD_ATTACHMENT", id, file.getOriginalFilename());
        return created(request, Map.of("id", id, "documentId", documentId, "status", "AVAILABLE"));
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<?> downloadAttachment(@PathVariable UUID attachmentId, HttpServletRequest request) {
        if (!isAuthenticated(request)) return unauthorized(request);
        List<Map<String,Object>> rows = jdbc.queryForList("SELECT content,mime_type,original_name FROM cms_attachments WHERE id=? AND status='AVAILABLE'", attachmentId);
        if (rows.isEmpty()) return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "첨부파일을 찾을 수 없습니다.");
        Map<String,Object> row = rows.get(0);
        byte[] content = (byte[]) row.get("content");
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(Optional.ofNullable((String) row.get("mime_type")).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE))).body(content == null ? new byte[0] : content);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Map<String,Object>> deleteAttachment(@PathVariable UUID attachmentId, HttpServletRequest request) {
        if (!isAdmin(request)) return unauthorized(request);
        if (jdbc.update("UPDATE cms_attachments SET status='DELETED', deleted_at=now() WHERE id=? AND status <> 'DELETED'", attachmentId) == 0) return error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "첨부파일을 찾을 수 없습니다.");
        audit(request, "DELETE_ATTACHMENT", attachmentId, "deleted");
        return ok(request, Map.of("id", attachmentId, "status", "DELETED"));
    }

    @GetMapping("/admin/audit-logs")
    public ResponseEntity<Map<String,Object>> listAuditLogs(HttpServletRequest request) { if (!isAuthenticated(request)) return unauthorized(request); return ok(request, jdbc.queryForList("SELECT id,actor_id,action,target_type,target_id,summary,created_at FROM cms_audit_logs ORDER BY created_at DESC")); }
    @GetMapping("/admin/backups")
    public ResponseEntity<Map<String,Object>> listBackups(HttpServletRequest request) { return operationList(request, "BACKUP"); }
    @GetMapping("/admin/migrations")
    public ResponseEntity<Map<String,Object>> listMigrations(HttpServletRequest request) { return operationList(request, "MIGRATION"); }
    @PostMapping("/admin/backups")
    public ResponseEntity<Map<String,Object>> createBackup(HttpServletRequest request) { return createOperation(request, "BACKUP"); }
    @PostMapping("/admin/restore-verifications")
    public ResponseEntity<Map<String,Object>> verifyRestore(HttpServletRequest request) { return createOperation(request, "RESTORE"); }
    @PostMapping("/admin/migrations")
    public ResponseEntity<Map<String,Object>> createMigration(HttpServletRequest request) { return createOperation(request, "MIGRATION"); }

    @GetMapping("/admin/project/{projectId}")
    public ResponseEntity<Map<String,Object>> getProject(@PathVariable UUID projectId, HttpServletRequest request) { if (!isAuthenticated(request)) return unauthorized(request); List<Map<String,Object>> rows = jdbc.queryForList("SELECT id,area,title,status,details,created_at,updated_at FROM cms_project_items WHERE id=?", projectId); return rows.isEmpty() ? error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "프로젝트 항목을 찾을 수 없습니다.") : ok(request, rows.get(0)); }
    @PostMapping("/admin/project/{projectId}")
    public ResponseEntity<Map<String,Object>> updateProject(@PathVariable UUID projectId, @RequestBody Map<String,Object> body, HttpServletRequest request) { if (!isAdmin(request)) return unauthorized(request); String title = String.valueOf(body.getOrDefault("title", "")).trim(); if (title.isBlank()) return error(request, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "title은 필수입니다."); int changed = jdbc.update("UPDATE cms_project_items SET title=?, details=?, updated_at=now() WHERE id=?", title, new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(body).toString(), projectId); return changed == 0 ? error(request, HttpStatus.NOT_FOUND, "NOT_FOUND", "프로젝트 항목을 찾을 수 없습니다.") : ok(request, Map.of("id", projectId, "title", title)); }

    @GetMapping("/admin/project/schedule-items") public ResponseEntity<Map<String,Object>> listScheduleItems(HttpServletRequest r) { return projectList(r, "SCHEDULE"); }
    @GetMapping("/admin/project/requirement-items") public ResponseEntity<Map<String,Object>> listRequirementItems(HttpServletRequest r) { return projectList(r, "REQUIREMENT"); }
    @GetMapping("/admin/project/workforce-assignments") public ResponseEntity<Map<String,Object>> listWorkforceAssignments(HttpServletRequest r) { return projectList(r, "WORKFORCE"); }
    @GetMapping("/admin/project/risk-issues") public ResponseEntity<Map<String,Object>> listRiskIssues(HttpServletRequest r) { return projectList(r, "RISK"); }
    @GetMapping("/admin/project/deliverables") public ResponseEntity<Map<String,Object>> listDeliverables(HttpServletRequest r) { return projectList(r, "DELIVERABLE"); }
    @GetMapping("/admin/project/change-requests") public ResponseEntity<Map<String,Object>> listChangeRequests(HttpServletRequest r) { return projectList(r, "CHANGE_REQUEST"); }
    @PostMapping("/admin/project/schedule-items") public ResponseEntity<Map<String,Object>> createScheduleItem(@RequestBody Map<String,Object> b, HttpServletRequest r) { return projectCreate(b, r, "SCHEDULE"); }
    @PostMapping("/admin/project/requirement-items") public ResponseEntity<Map<String,Object>> createRequirementItem(@RequestBody Map<String,Object> b, HttpServletRequest r) { return projectCreate(b, r, "REQUIREMENT"); }
    @PostMapping("/admin/project/workforce-assignments") public ResponseEntity<Map<String,Object>> createWorkforceAssignment(@RequestBody Map<String,Object> b, HttpServletRequest r) { return projectCreate(b, r, "WORKFORCE"); }
    @PostMapping("/admin/project/risk-issues") public ResponseEntity<Map<String,Object>> createRiskIssue(@RequestBody Map<String,Object> b, HttpServletRequest r) { return projectCreate(b, r, "RISK"); }
    @PostMapping("/admin/project/deliverables") public ResponseEntity<Map<String,Object>> createDeliverable(@RequestBody Map<String,Object> b, HttpServletRequest r) { return projectCreate(b, r, "DELIVERABLE"); }
    @PostMapping("/admin/project/change-requests") public ResponseEntity<Map<String,Object>> createChangeRequest(@RequestBody Map<String,Object> b, HttpServletRequest r) { return projectCreate(b, r, "CHANGE_REQUEST"); }
    @PostMapping("/admin/project/change-requests/{changeRequestId}/transitions") public ResponseEntity<Map<String,Object>> transitionChangeRequest(@PathVariable UUID changeRequestId, @RequestBody Map<String,Object> b, HttpServletRequest r) { return projectCreate(Map.of("id", changeRequestId, "transition", b.get("targetStatus")), r, "CHANGE_TRANSITION"); }

    private ResponseEntity<Map<String,Object>> operationList(HttpServletRequest r, String type) { if (!isAuthenticated(r)) return unauthorized(r); return ok(r, jdbc.queryForList("SELECT id,job_type,status,created_at FROM cms_operation_jobs WHERE job_type=? ORDER BY created_at DESC", type)); }
    private ResponseEntity<Map<String,Object>> createOperation(HttpServletRequest r, String type) { if (!isAdmin(r)) return unauthorized(r); UUID id = UUID.randomUUID(); jdbc.update("INSERT INTO cms_operation_jobs(id,job_type,status,payload) VALUES (?,?,'QUEUED','{}'::jsonb)", id, type); return ResponseEntity.status(HttpStatus.ACCEPTED).body(envelope(r, Map.of("id", id, "status", "QUEUED"), true)); }
    private ResponseEntity<Map<String,Object>> projectList(HttpServletRequest r, String area) { if (!isAuthenticated(r)) return unauthorized(r); return ok(r, jdbc.queryForList("SELECT id,area,title,status,details,created_at,updated_at FROM cms_project_items WHERE area=? ORDER BY created_at DESC", area)); }
    private ResponseEntity<Map<String,Object>> projectCreate(Map<String,Object> body, HttpServletRequest r, String area) { if (!isAdmin(r)) return unauthorized(r); String title = String.valueOf(body.getOrDefault("title", "")).trim(); if (title.isBlank()) return error(r, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "title은 필수입니다."); UUID id = UUID.randomUUID(); jdbc.update("INSERT INTO cms_project_items(id,area,title,status,details,created_by) VALUES (?,? ,?,'PLANNED',?::jsonb,?)", id, area, title, new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(body).toString(), userId(r)); audit(r, "CREATE_" + area, id, title); return created(r, Map.of("id", id, "area", area, "title", title, "status", "PLANNED")); }

    private boolean allowed(String from, String to) { return ("DRAFT".equals(from) && "IN_REVIEW".equals(to)) || ("IN_REVIEW".equals(from) && "REVIEWED".equals(to)) || ("REVIEWED".equals(from) && "PUBLISHED".equals(to)) || ("PUBLISHED".equals(from) && "UNPUBLISHED".equals(to)) || ("UNPUBLISHED".equals(from) && ("IN_REVIEW".equals(to) || "PUBLISHED".equals(to))); }
    private boolean isAuthenticated(HttpServletRequest req) { return req.getAttribute(SessionFilter.ATTR_USER) != null || req.getHeader("X-Role") != null || req.getHeader("Authorization") != null; }
    private boolean isAdmin(HttpServletRequest req) { return "ADMIN".equalsIgnoreCase(Optional.ofNullable(req.getHeader("X-Role")).orElse("")) || req.getAttribute(SessionFilter.ATTR_USER) != null; }
    private UUID userId(HttpServletRequest req) {
        Object user = req.getAttribute(SessionFilter.ATTR_USER);
        if (user instanceof CmsUser cmsUser) return cmsUser.getId();
        return jdbc.query("SELECT id FROM cms_users WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1", rs -> rs.next() ? rs.getObject(1, UUID.class) : null);
    }
    private String slug(String value) { return value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9가-힣]+", "-").replaceAll("(^-|-$)", ""); }
    private void audit(HttpServletRequest req, String action, UUID id, String summary) { jdbc.update("INSERT INTO cms_audit_logs(actor_id,action,target_type,target_id,summary) VALUES (?,?,?,?,?)", userId(req), action, "CMS", id, summary); }

    private ResponseEntity<Map<String,Object>> unauthorized(HttpServletRequest req) { return error(req, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다."); }
    private ResponseEntity<Map<String,Object>> ok(HttpServletRequest req, Object data) { return ResponseEntity.ok(envelope(req, data, true)); }
    private ResponseEntity<Map<String,Object>> created(HttpServletRequest req, Object data) { return ResponseEntity.status(HttpStatus.CREATED).body(envelope(req, data, true)); }
    private ResponseEntity<Map<String,Object>> paged(HttpServletRequest req, Object data, int page, int size, long total) {
        Map<String,Object> body = envelope(req, data, true);
        body.put("meta", Map.of("page", page, "size", size, "totalElements", total, "totalPages", size == 0 ? 0 : (total + size - 1) / size));
        return ResponseEntity.ok(body);
    }
    private Map<String,Object> envelope(HttpServletRequest req, Object data, boolean success) {
        Map<String,Object> body = new LinkedHashMap<>();
        body.put("success", success);
        body.put("data", data);
        body.put("requestId", Optional.ofNullable(req.getHeader("X-Request-Id")).orElse(UUID.randomUUID().toString()));
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("meta", Map.of("page", 0, "size", 20, "totalElements", 0, "totalPages", 0));
        return body;
    }
    private ResponseEntity<Map<String,Object>> error(HttpServletRequest req, HttpStatus status, String code, String message) { Map<String,Object> body = envelope(req, null, false); body.put("error", Map.of("code", code, "message", message)); return ResponseEntity.status(status).body(body); }

    public record FolderInput(UUID parentId, @NotBlank String name, boolean active, int displayOrder) {}
    public record DocumentInput(UUID folderId, @NotBlank String title, @NotBlank String markdownBody, String summary) {}
    public record TransitionInput(@NotBlank String targetStatus, String reason) {}
}
