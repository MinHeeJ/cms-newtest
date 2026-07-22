package com.noticeboard;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class AppService {
  private final UserRepository users; private final NoticeRepository notices; private final CommentRepository comments; private final NotificationRepository notifications; private final PasswordEncoder encoder; private final JwtService jwt;
  AppService(UserRepository users, NoticeRepository notices, CommentRepository comments, NotificationRepository notifications, PasswordEncoder encoder, JwtService jwt) {
    this.users = users; this.notices = notices; this.comments = comments; this.notifications = notifications; this.encoder = encoder; this.jwt = jwt;
  }
  AppUser current(String email) { return users.findByEmail(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다.")); }
  boolean isAdmin(String email) { return email != null && users.findByEmail(email).map(u -> u.role == UserRole.ADMIN).orElse(false); }
  @Transactional AppUser signup(SignupRequest r) {
    if (users.existsByEmail(r.email())) throw new ApiException(HttpStatus.BAD_REQUEST, "DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다.");
    AppUser u = new AppUser(); u.email = r.email(); u.passwordHash = encoder.encode(r.password()); u.nickname = r.nickname(); u.role = UserRole.USER; return users.save(u);
  }
  String login(LoginRequest r) {
    AppUser u = users.findByEmail(r.email()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "이메일 또는 비밀번호가 올바르지 않습니다."));
    if (!encoder.matches(r.password(), u.passwordHash)) throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "이메일 또는 비밀번호가 올바르지 않습니다.");
    return jwt.issue(u);
  }
  @Transactional AppUser updateMe(String email, UpdateMeRequest r) { AppUser u = current(email); u.nickname = r.nickname(); return u; }
  Page<Notice> listNotices(String email, int page, int size, String keyword, String sort) { return notices.search(isAdmin(email), keyword == null ? "" : keyword, page(page, size, sort)); }
  @Transactional Notice getNotice(String email, Long id) {
    Notice n = notices.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "공지를 찾을 수 없습니다."));
    if (!n.published && !isAdmin(email)) throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "공지를 찾을 수 없습니다.");
    n.viewCount += 1; return n;
  }
  @Transactional Notice createNotice(String email, NoticeRequest r) { Notice n = new Notice(); n.author = current(email); n.title = r.title(); n.content = r.content(); n.published = r.published() == null || r.published(); return notices.save(n); }
  @Transactional Notice updateNotice(Long id, NoticeRequest r) { Notice n = notice(id); n.title = r.title(); n.content = r.content(); n.published = r.published() == null || r.published(); return n; }
  @Transactional void deleteNotice(Long id) { notices.delete(notice(id)); }
  Page<Comment> listComments(Long noticeId, int page, int size) { if (!notices.existsById(noticeId)) throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "공지를 찾을 수 없습니다."); return comments.findByNoticeId(noticeId, PageRequest.of(page, size, Sort.by("createdAt").ascending())); }
  @Transactional Comment createComment(String email, Long noticeId, CommentRequest r) {
    Notice n = notice(noticeId); AppUser author = current(email); Comment c = new Comment(); c.notice = n; c.author = author; c.content = r.content(); Comment saved = comments.save(c);
    if (!n.author.id.equals(author.id)) { NotificationItem item = new NotificationItem(); item.user = n.author; item.type = NotificationType.NEW_COMMENT; item.message = author.nickname + "님이 공지에 댓글을 남겼습니다."; item.referenceId = n.id; notifications.save(item); }
    return saved;
  }
  @Transactional Comment updateComment(String email, Long id, CommentRequest r) { Comment c = comment(id); AppUser u = current(email); if (!c.author.id.equals(u.id)) throw forbidden(); c.content = r.content(); return c; }
  @Transactional void deleteComment(String email, Long id) { Comment c = comment(id); AppUser u = current(email); if (!c.author.id.equals(u.id) && u.role != UserRole.ADMIN) throw forbidden(); comments.delete(c); }
  Page<NotificationItem> listNotifications(String email, int page, int size, Boolean isRead) { AppUser u = current(email); Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending()); return isRead == null ? notifications.findByUserId(u.id, p) : notifications.findByUserIdAndRead(u.id, isRead, p); }
  long unreadCount(String email) { return notifications.countByUserIdAndRead(current(email).id, false); }
  @Transactional NotificationItem markRead(String email, Long id) { AppUser u = current(email); NotificationItem n = notifications.findById(id).orElseThrow(() -> notFound("알림을 찾을 수 없습니다.")); if (!n.user.id.equals(u.id)) throw forbidden(); n.read = true; return n; }
  @Transactional List<NotificationItem> markAllRead(String email) { AppUser u = current(email); List<NotificationItem> all = notifications.findByUserId(u.id, PageRequest.of(0, 1000)).getContent(); all.forEach(n -> n.read = true); return all; }
  Page<AppUser> listUsers(int page, int size, String keyword) { Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending()); return keyword == null || keyword.isBlank() ? users.findAll(p) : users.search(keyword, p); }
  @Transactional AppUser updateRole(Long id, RoleUpdateRequest r) { AppUser u = users.findById(id).orElseThrow(() -> notFound("사용자를 찾을 수 없습니다.")); u.role = r.role(); return u; }
  Notice notice(Long id) { return notices.findById(id).orElseThrow(() -> notFound("공지를 찾을 수 없습니다.")); }
  Comment comment(Long id) { return comments.findById(id).orElseThrow(() -> notFound("댓글을 찾을 수 없습니다.")); }
  ApiException notFound(String message) { return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", message); }
  ApiException forbidden() { return new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "권한이 없습니다."); }
  Pageable page(int page, int size, String sort) { String s = sort == null ? "created_at" : sort; String prop = switch (s) { case "title" -> "title"; case "view_count" -> "viewCount"; default -> "createdAt"; }; return PageRequest.of(page, size, Sort.by(prop).descending()); }
}
