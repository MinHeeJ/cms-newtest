package com.noticeboard;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MissingOperationLiteralContractTest {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate jdbc;
  @Autowired UserRepository users;
  @Autowired JwtService jwt;

  private String adminToken;
  private String userToken;
  private String otherToken;

  @BeforeEach
  void setUp() {
    jdbc.update("DELETE FROM notifications");
    jdbc.update("DELETE FROM comments");
    jdbc.update("DELETE FROM notices");
    jdbc.update("DELETE FROM users");
    jdbc.execute("ALTER TABLE users ALTER COLUMN id RESTART WITH 1");
    jdbc.execute("ALTER TABLE notices ALTER COLUMN id RESTART WITH 1");
    jdbc.execute("ALTER TABLE comments ALTER COLUMN id RESTART WITH 1");
    jdbc.execute("ALTER TABLE notifications ALTER COLUMN id RESTART WITH 1");
    jdbc.update("INSERT INTO users(id, email, password_hash, nickname, role, created_at, updated_at) VALUES (1, 'admin-literal@example.com', 'unused', '관리자', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
    jdbc.update("INSERT INTO users(id, email, password_hash, nickname, role, created_at, updated_at) VALUES (2, 'user-literal@example.com', 'unused', '작성자', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
    jdbc.update("INSERT INTO users(id, email, password_hash, nickname, role, created_at, updated_at) VALUES (3, 'other-literal@example.com', 'unused', '타인', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
    jdbc.update("INSERT INTO notices(id, title, content, author_id, published, view_count, created_at, updated_at) VALUES (1, '공개 공지', '본문', 1, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
    jdbc.update("INSERT INTO notices(id, title, content, author_id, published, view_count, created_at, updated_at) VALUES (2, '비공개 공지', '숨김', 1, false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
    jdbc.update("INSERT INTO comments(id, notice_id, author_id, content, created_at, updated_at) VALUES (1, 1, 2, '원본 댓글', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
    jdbc.update("INSERT INTO notifications(id, user_id, type, message, reference_id, is_read, created_at) VALUES (1, 1, 'NEW_COMMENT', '새 댓글 알림', 1, false, CURRENT_TIMESTAMP)");
    jdbc.execute("ALTER TABLE users ALTER COLUMN id RESTART WITH 4");
    jdbc.execute("ALTER TABLE notices ALTER COLUMN id RESTART WITH 3");
    jdbc.execute("ALTER TABLE comments ALTER COLUMN id RESTART WITH 2");
    jdbc.execute("ALTER TABLE notifications ALTER COLUMN id RESTART WITH 2");
    adminToken = jwt.issue(users.findById(1L).orElseThrow());
    userToken = jwt.issue(users.findById(2L).orElseThrow());
    otherToken = jwt.issue(users.findById(3L).orElseThrow());
  }

  @Test
  void openapi_fixture_is_loaded_from_contracts_classpath_resource() throws Exception {
    var openapi = new ClassPathResource("contracts/openapi.yaml");
    org.junit.jupiter.api.Assertions.assertTrue(openapi.exists());
    org.junit.jupiter.api.Assertions.assertTrue(openapi.contentLength() > 0);
  }

  @Test
  void get_api_admin_users_lists_users_with_keyword_and_requires_admin() throws Exception {
    mvc.perform(get("/api/admin/users").param("keyword", "literal").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.items[*].email", hasItems("admin-literal@example.com", "user-literal@example.com", "other-literal@example.com")))
      .andExpect(jsonPath("$.data.page.total_elements").value(3));

    mvc.perform(get("/api/admin/users").param("keyword", "literal").header("Authorization", "Bearer " + userToken))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.error").value("FORBIDDEN"));
  }

  @Test
  void patch_api_admin_users_id_role_updates_role_and_validates_role_body() throws Exception {
    mvc.perform(patch("/api/admin/users/2/role").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"ADMIN\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value(2))
      .andExpect(jsonPath("$.data.role").value("ADMIN"));

    mvc.perform(patch("/api/admin/users/999/role").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"USER\"}"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error").value("NOT_FOUND"));
  }

  @Test
  void get_api_notices_id_returns_detail_increments_views_and_hides_unpublished_from_public() throws Exception {
    mvc.perform(get("/api/notices/1"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value(1))
      .andExpect(jsonPath("$.data.title").value("공개 공지"))
      .andExpect(jsonPath("$.data.view_count").value(1));

    mvc.perform(get("/api/notices/2"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error").value("NOT_FOUND"));
  }

  @Test
  void put_api_notices_id_updates_notice_and_rejects_invalid_body() throws Exception {
    mvc.perform(put("/api/notices/1").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"수정 공지\",\"content\":\"수정 본문\",\"published\":false}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value(1))
      .andExpect(jsonPath("$.data.title").value("수정 공지"))
      .andExpect(jsonPath("$.data.published").value(false));

    mvc.perform(put("/api/notices/1").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"\",\"content\":\"본문\",\"published\":true}"))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.success").value(false));
  }

  @Test
  void delete_api_notices_id_removes_notice_and_cascades_comments() throws Exception {
    mvc.perform(delete("/api/notices/1").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true));

    mvc.perform(get("/api/notices/1"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error").value("NOT_FOUND"));

    mvc.perform(get("/api/notices/1/comments"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error").value("NOT_FOUND"));
  }

  @Test
  void get_api_notices_id_comments_lists_comments_and_returns_not_found_for_missing_notice() throws Exception {
    mvc.perform(get("/api/notices/1/comments"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items", hasSize(1)))
      .andExpect(jsonPath("$.data.items[0].content").value("원본 댓글"))
      .andExpect(jsonPath("$.data.page.total_elements").value(1));

    mvc.perform(get("/api/notices/999/comments"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error").value("NOT_FOUND"));
  }

  @Test
  void post_api_notices_id_comments_creates_comment_and_notification_side_effect() throws Exception {
    mvc.perform(post("/api/notices/1/comments").header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"새 댓글\"}"))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.notice_id").value(1))
      .andExpect(jsonPath("$.data.author_id").value(2))
      .andExpect(jsonPath("$.data.content").value("새 댓글"));

    mvc.perform(get("/api/notifications?isRead=false").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.unread_count", greaterThanOrEqualTo(1)))
      .andExpect(jsonPath("$.data.items[*].type", hasItem("NEW_COMMENT")));
  }

  @Test
  void put_api_comments_id_updates_owner_comment_and_forbids_other_user() throws Exception {
    mvc.perform(put("/api/comments/1").header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"댓글 수정\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value(1))
      .andExpect(jsonPath("$.data.content").value("댓글 수정"));

    mvc.perform(put("/api/comments/1").header("Authorization", "Bearer " + otherToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"권한 없는 수정\"}"))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.error").value("FORBIDDEN"));
  }

  @Test
  void delete_api_comments_id_removes_comment_for_owner_and_returns_not_found_after_delete() throws Exception {
    mvc.perform(delete("/api/comments/1").header("Authorization", "Bearer " + userToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true));

    mvc.perform(put("/api/comments/1").header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"삭제 후 수정\"}"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error").value("NOT_FOUND"));
  }

  @Test
  void patch_api_notifications_id_read_marks_single_notification_and_blocks_other_user() throws Exception {
    mvc.perform(patch("/api/notifications/1/read").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value(1))
      .andExpect(jsonPath("$.data.is_read").value(true));

    mvc.perform(patch("/api/notifications/1/read").header("Authorization", "Bearer " + otherToken))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.error").value("FORBIDDEN"));
  }
}
