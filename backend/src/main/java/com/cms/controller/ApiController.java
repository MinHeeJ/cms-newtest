package com.cms.controller;
import com.cms.entity.CmsUser;
import com.cms.security.SessionFilter;
import com.cms.service.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.util.*;
@RestController
@RequiredArgsConstructor
public class ApiController {
    private final ContentService contentService;
    private final MediaService mediaService;
    private final TaxonomyService taxonomyService;
    private final NavigationService navigationService;
    private final UserService userService;
    private final DashboardService dashboardService;
    private final AuditService auditService;
    private final PermissionService permissionService;
    private final com.cms.service.DtoMapper mapper;

    private CmsUser user(HttpServletRequest req) {
        CmsUser currentUser = (CmsUser) req.getAttribute(SessionFilter.ATTR_USER);
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return currentUser;
    }

    @GetMapping("/health")
    public Map<String,String> health() { return Map.of("status","ok","service","cms-backend"); }

    // Auth
    @GetMapping("/api/v1/auth/session")
    public Map<String,Object> session(HttpServletRequest req) {
        CmsUser u = user(req);
        return Map.of("user", mapper.user(u), "permissions", permissionService.getPermissions(u));
    }
    @PostMapping("/api/v1/auth/session")
    public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String,Object> body) {
        CmsUser authenticated = userService.authenticateByEmail(String.valueOf(body.getOrDefault("email", "")));
        ResponseCookie sessionCookie = ResponseCookie.from(SessionFilter.SESSION_COOKIE, authenticated.getId().toString())
            .httpOnly(true)
            .sameSite("Lax")
            .path("/")
            .maxAge(Duration.ofDays(7))
            .build();
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, sessionCookie.toString())
            .body(Map.of("user", mapper.user(authenticated), "permissions", permissionService.getPermissions(authenticated)));
    }
    @DeleteMapping("/api/v1/auth/session")
    public ResponseEntity<Void> logout() {
        ResponseCookie expiredCookie = ResponseCookie.from(SessionFilter.SESSION_COOKIE, "")
            .httpOnly(true)
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build();
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, expiredCookie.toString()).build();
    }

    // Content
    @GetMapping("/api/v1/content")
    public Map<String,Object> contentList(@RequestParam(required=false) String status,
                                          @RequestParam(required=false) String type,
                                          @RequestParam(required=false) String q,
                                          @RequestParam(defaultValue="1") int page,
                                          @RequestParam(defaultValue="25") int pageSize) {
        return contentService.list(status, type, q, page, pageSize);
    }
    @PostMapping("/api/v1/content")
    public ResponseEntity<Map<String,Object>> contentCreate(@RequestBody Map<String,Object> body, HttpServletRequest req) {
        return ResponseEntity.status(201).body(contentService.create(body, user(req)));
    }
    @GetMapping("/api/v1/content/{id}")
    public Map<String,Object> contentGet(@PathVariable UUID id) { return contentService.get(id); }
    @PatchMapping("/api/v1/content/{id}")
    public Map<String,Object> contentUpdate(@PathVariable UUID id, @RequestBody Map<String,Object> body, HttpServletRequest req) {
        return contentService.update(id, body, user(req));
    }
    @DeleteMapping("/api/v1/content/{id}")
    public ResponseEntity<Void> contentDelete(@PathVariable UUID id, @RequestParam(defaultValue="false") boolean confirm, HttpServletRequest req) {
        contentService.archive(id, user(req)); return ResponseEntity.noContent().build();
    }
    @PostMapping("/api/v1/content/{id}/preview")
    public Map<String,Object> contentPreview(@PathVariable UUID id, @RequestBody(required=false) Map<String,Object> body) {
        return contentService.preview(id, body != null ? body : Map.of());
    }
    @PostMapping("/api/v1/content/{id}/submit")
    public Map<String,Object> contentSubmit(@PathVariable UUID id, HttpServletRequest req) { return contentService.submit(id, user(req)); }
    @PostMapping("/api/v1/content/{id}/review")
    public Map<String,Object> contentReview(@PathVariable UUID id, @RequestBody Map<String,Object> body, HttpServletRequest req) {
        return "APPROVE".equals(body.get("decision")) ? contentService.approve(id, user(req)) : contentService.reject(id, user(req));
    }
    @PostMapping("/api/v1/content/{id}/publish")
    public Map<String,Object> contentPublish(@PathVariable UUID id, HttpServletRequest req) { return contentService.publish(id, user(req)); }
    @PostMapping("/api/v1/content/{id}/schedule")
    public ResponseEntity<Map<String,Object>> contentSchedule(@PathVariable UUID id, @RequestBody Map<String,Object> body, HttpServletRequest req) {
        return ResponseEntity.status(201).body(contentService.schedule(id, (String)body.get("scheduledAt"), user(req)));
    }
    @PostMapping("/api/v1/content/{id}/unpublish")
    public Map<String,Object> contentUnpublish(@PathVariable UUID id, HttpServletRequest req) { return contentService.unpublish(id, user(req)); }
    @PostMapping("/api/v1/content/{id}/archive")
    public Map<String,Object> contentArchive(@PathVariable UUID id, HttpServletRequest req) { return contentService.archive(id, user(req)); }
    @GetMapping("/api/v1/content/{id}/revisions")
    public List<Map<String,Object>> contentRevisions(@PathVariable UUID id) { return contentService.listRevisions(id); }
    @PostMapping("/api/v1/content/{id}/revisions/{revisionId}/restore")
    public ResponseEntity<Map<String,Object>> contentRestore(@PathVariable UUID id, @PathVariable UUID revisionId, HttpServletRequest req) {
        return ResponseEntity.status(201).body(contentService.restoreRevision(id, revisionId, user(req)));
    }

    // Media
    @GetMapping("/api/v1/media")
    public Map<String,Object> mediaList(@RequestParam(defaultValue="1") int page, @RequestParam(defaultValue="25") int pageSize) {
        return mediaService.list(page, pageSize);
    }
    @PostMapping("/api/v1/media")
    public ResponseEntity<Map<String,Object>> mediaUpload(@RequestBody(required=false) Map<String,Object> body, HttpServletRequest req) {
        return ResponseEntity.status(201).body(mediaService.upload(body != null ? body : Map.of(), user(req)));
    }
    @PatchMapping("/api/v1/media/{id}")
    public Map<String,Object> mediaUpdate(@PathVariable UUID id, @RequestBody Map<String,Object> body, HttpServletRequest req) {
        return mediaService.update(id, body, user(req));
    }
    @DeleteMapping("/api/v1/media/{id}")
    public ResponseEntity<Void> mediaDelete(@PathVariable UUID id, @RequestParam(defaultValue="false") boolean confirm) {
        mediaService.delete(id, confirm); return ResponseEntity.noContent().build();
    }

    // Taxonomy
    @GetMapping("/api/v1/taxonomy")
    public List<Map<String,Object>> taxonomyList(@RequestParam(required=false) String type) { return taxonomyService.list(type); }
    @PostMapping("/api/v1/taxonomy")
    public ResponseEntity<Map<String,Object>> taxonomyCreate(@RequestBody Map<String,Object> body) {
        return ResponseEntity.status(201).body(taxonomyService.save(body, null));
    }
    @PatchMapping("/api/v1/taxonomy/{id}")
    public Map<String,Object> taxonomyUpdate(@PathVariable UUID id, @RequestBody Map<String,Object> body) { return taxonomyService.save(body, id); }
    @DeleteMapping("/api/v1/taxonomy/{id}")
    public ResponseEntity<Void> taxonomyDelete(@PathVariable UUID id, @RequestParam(defaultValue="false") boolean confirm) {
        taxonomyService.delete(id, confirm); return ResponseEntity.noContent().build();
    }

    // Navigation
    @GetMapping("/api/v1/navigation/menus")
    public List<Map<String,Object>> navList() { return navigationService.list(); }
    @PostMapping("/api/v1/navigation/menus")
    public ResponseEntity<Map<String,Object>> navCreate(@RequestBody Map<String,Object> body) {
        return ResponseEntity.status(201).body(navigationService.save(body, null));
    }
    @PatchMapping("/api/v1/navigation/menus/{id}")
    public Map<String,Object> navUpdate(@PathVariable UUID id, @RequestBody Map<String,Object> body) { return navigationService.save(body, id); }

    // Users
    @GetMapping("/api/v1/users")
    public Map<String,Object> userList(@RequestParam(defaultValue="1") int page, @RequestParam(defaultValue="25") int pageSize) {
        return userService.list(page, pageSize);
    }
    @PatchMapping("/api/v1/users/{id}/roles")
    public Map<String,Object> userRoles(@PathVariable UUID id, @RequestBody Map<String,Object> body, HttpServletRequest req) {
        return userService.updateRoles(id, (List<String>)body.get("roles"), (String)body.get("reason"), user(req));
    }

    // Dashboard
    @GetMapping("/api/v1/dashboard/metrics")
    public Map<String,Object> dashboard() { return dashboardService.metrics(); }

    // Audit
    @GetMapping("/api/v1/audit/events")
    public Map<String,Object> audit(@RequestParam(required=false) String actorId,
                                    @RequestParam(required=false) String targetType,
                                    @RequestParam(defaultValue="1") int page,
                                    @RequestParam(defaultValue="25") int pageSize) {
        return auditService.list(actorId, targetType, page, pageSize);
    }
}
