package com.noticeboard;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

record SignupRequest(@Email(message = "이메일 형식이 올바르지 않습니다.") @NotBlank String email, @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.") String password, @NotBlank(message = "닉네임은 필수입니다.") String nickname) {}
record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
record UpdateMeRequest(@NotBlank(message = "닉네임은 필수입니다.") String nickname) {}
record NoticeRequest(@NotBlank(message = "제목은 필수입니다.") String title, @NotBlank(message = "내용은 필수입니다.") String content, Boolean published) {}
record CommentRequest(@NotBlank(message = "댓글 내용은 필수입니다.") String content) {}
record RoleUpdateRequest(@NotNull UserRole role) {}

@RestController
@RequestMapping("/api")
class ApiController {
  private final AppService app;
  ApiController(AppService app) { this.app = app; }

  @GetMapping("/health") ApiResponse<Map<String, String>> health() { return ApiResponse.ok(Map.of("status", "UP")); }
  @PostMapping("/auth/signup") ResponseEntity<ApiResponse<Map<String, Object>>> signup(@Valid @RequestBody SignupRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(user(app.signup(r)))); }
  @PostMapping("/auth/login") ApiResponse<Map<String, String>> login(@Valid @RequestBody LoginRequest r) { return ApiResponse.ok(Map.of("token", app.login(r))); }
  @GetMapping("/auth/me") ApiResponse<Map<String, Object>> me(Principal p) { return ApiResponse.ok(user(app.current(p.getName()))); }
  @PutMapping("/auth/me") ApiResponse<Map<String, Object>> updateMe(Principal p, @Valid @RequestBody UpdateMeRequest r) { return ApiResponse.ok(user(app.updateMe(p.getName(), r))); }

  @GetMapping("/notices") ApiResponse<Map<String, Object>> notices(Principal p, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "created_at") String sort) {
    return ApiResponse.ok(noticePage(app.listNotices(p == null ? null : p.getName(), page, size, keyword, sort)));
  }
  @GetMapping("/notices/{id}") ApiResponse<Map<String, Object>> notice(Principal p, @PathVariable Long id) { return ApiResponse.ok(notice(app.getNotice(p == null ? null : p.getName(), id))); }
  @PostMapping("/notices") ResponseEntity<ApiResponse<Map<String, Object>>> createNotice(Principal p, @Valid @RequestBody NoticeRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(notice(app.createNotice(p.getName(), r)))); }
  @PutMapping("/notices/{id}") ApiResponse<Map<String, Object>> updateNotice(@PathVariable Long id, @Valid @RequestBody NoticeRequest r) { return ApiResponse.ok(notice(app.updateNotice(id, r))); }
  @DeleteMapping("/notices/{id}") ApiResponse<Object> deleteNotice(@PathVariable Long id) { app.deleteNotice(id); return ApiResponse.empty(); }

  @GetMapping("/notices/{id}/comments") ApiResponse<Map<String, Object>> comments(@PathVariable Long id, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { return ApiResponse.ok(commentPage(app.listComments(id, page, size))); }
  @PostMapping("/notices/{id}/comments") ResponseEntity<ApiResponse<Map<String, Object>>> createComment(Principal p, @PathVariable Long id, @Valid @RequestBody CommentRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(comment(app.createComment(p.getName(), id, r)))); }
  @PutMapping("/comments/{id}") ApiResponse<Map<String, Object>> updateComment(Principal p, @PathVariable Long id, @Valid @RequestBody CommentRequest r) { return ApiResponse.ok(comment(app.updateComment(p.getName(), id, r))); }
  @DeleteMapping("/comments/{id}") ApiResponse<Object> deleteComment(Principal p, @PathVariable Long id) { app.deleteComment(p.getName(), id); return ApiResponse.empty(); }

  @GetMapping("/notifications") ApiResponse<Map<String, Object>> notifications(Principal p, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) Boolean isRead) { return ApiResponse.ok(notificationPage(app.listNotifications(p.getName(), page, size, isRead), app.unreadCount(p.getName()))); }
  @PatchMapping("/notifications/{id}/read") ApiResponse<Map<String, Object>> read(Principal p, @PathVariable Long id) { return ApiResponse.ok(notification(app.markRead(p.getName(), id))); }
  @PatchMapping("/notifications/read-all") ApiResponse<List<Map<String, Object>>> readAll(Principal p) { return ApiResponse.ok(app.markAllRead(p.getName()).stream().map(this::notification).toList()); }

  @GetMapping("/admin/users") ApiResponse<Map<String, Object>> adminUsers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "") String keyword) { return ApiResponse.ok(userPage(app.listUsers(page, size, keyword))); }
  @PatchMapping("/admin/users/{id}/role") ApiResponse<Map<String, Object>> role(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest r) { return ApiResponse.ok(user(app.updateRole(id, r))); }

  Map<String, Object> user(AppUser u) { return map("id", u.id, "email", u.email, "nickname", u.nickname, "role", u.role.name(), "created_at", u.createdAt, "updated_at", u.updatedAt); }
  Map<String, Object> notice(Notice n) { return map("id", n.id, "title", n.title, "content", n.content, "author_id", n.author.id, "author_nickname", n.author.nickname, "published", n.published, "view_count", n.viewCount, "created_at", n.createdAt, "updated_at", n.updatedAt); }
  Map<String, Object> comment(Comment c) { return map("id", c.id, "notice_id", c.notice.id, "author_id", c.author.id, "author_nickname", c.author.nickname, "content", c.content, "created_at", c.createdAt, "updated_at", c.updatedAt); }
  Map<String, Object> notification(NotificationItem n) { return map("id", n.id, "user_id", n.user.id, "type", n.type.name(), "message", n.message, "reference_id", n.referenceId == null ? 0 : n.referenceId, "is_read", n.read, "created_at", n.createdAt); }
  Map<String, Object> meta(Page<?> p) { return map("page", p.getNumber(), "size", p.getSize(), "total_elements", p.getTotalElements(), "total_pages", p.getTotalPages()); }
  Map<String, Object> noticePage(Page<Notice> p) { return map("items", p.getContent().stream().map(this::notice).toList(), "page", meta(p)); }
  Map<String, Object> commentPage(Page<Comment> p) { return map("items", p.getContent().stream().map(this::comment).toList(), "page", meta(p)); }
  Map<String, Object> notificationPage(Page<NotificationItem> p, long unread) { return map("items", p.getContent().stream().map(this::notification).toList(), "page", meta(p), "unread_count", unread); }
  Map<String, Object> userPage(Page<AppUser> p) { return map("items", p.getContent().stream().map(this::user).toList(), "page", meta(p)); }
  Map<String, Object> map(Object... kv) { LinkedHashMap<String, Object> m = new LinkedHashMap<>(); for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]); return m; }
}

@org.springframework.context.annotation.Configuration
class SeedConfig {
  @Bean CommandLineRunner seed(UserRepository users, PasswordEncoder encoder, @Value("${app.admin-email}") String email, @Value("${app.admin-password}") String password, @Value("${app.admin-nickname}") String nickname) {
    return args -> { if (!users.existsByEmail(email)) { AppUser u = new AppUser(); u.email = email; u.passwordHash = encoder.encode(password); u.nickname = nickname; u.role = UserRole.ADMIN; users.save(u); } };
  }
}
