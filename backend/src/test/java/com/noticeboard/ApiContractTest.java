package com.noticeboard;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiContractTest {
  @Autowired MockMvc mvc;

  @Test
  void openapi_contract_fixture_is_on_classpath() throws Exception {
    var resource = new ClassPathResource("contracts/openapi.yaml");
    assert resource.exists();
  }

  @Test
  void health_returns_api_response_envelope() throws Exception {
    mvc.perform(get("/api/health"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.status").value("UP"))
      .andExpect(jsonPath("$.error").doesNotExist())
      .andExpect(jsonPath("$.message").doesNotExist());
  }

  @Test
  void signup_login_me_and_duplicate_email_follow_contract() throws Exception {
    String signup = "{\"email\":\"user1@example.com\",\"password\":\"Pass!2345\",\"nickname\":\"사용자\"}";
    mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(signup))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.email").value("user1@example.com"))
      .andExpect(jsonPath("$.data.role").value("USER"));

    mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(signup))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.success").value(false))
      .andExpect(jsonPath("$.error").value("DUPLICATE_EMAIL"));

    String token = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"email\":\"user1@example.com\",\"password\":\"Pass!2345\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.token", not(emptyString())))
      .andReturn().getResponse().getContentAsString().replaceAll(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*", "$1");

    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.nickname").value("사용자"));

    mvc.perform(put("/api/auth/me").header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
        .content("{\"nickname\":\"수정닉\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.nickname").value("수정닉"));
  }

  @Test
  void admin_notice_crud_public_filter_detail_and_user_forbidden() throws Exception {
    String adminToken = login("admin@example.com", "Admin!2345");
    String userToken = signupAndLogin("reader@example.com", "Reader!2345", "독자");

    String publicNotice = mvc.perform(post("/api/notices").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"공개 공지\",\"content\":\"검색 본문\",\"published\":true}"))
      .andExpect(status().isCreated()).andExpect(jsonPath("$.data.title").value("공개 공지"))
      .andReturn().getResponse().getContentAsString();
    String id = publicNotice.replaceAll(".*\\\"id\\\":([0-9]+).*", "$1");

    mvc.perform(post("/api/notices").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"비공개 공지\",\"content\":\"숨김\",\"published\":false}"))
      .andExpect(status().isCreated());

    mvc.perform(get("/api/notices?keyword=공지&sort=created_at"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items[*].published", everyItem(is(true))));

    mvc.perform(get("/api/notices?keyword=비공개").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items", hasSize(1)));

    mvc.perform(get("/api/notices/" + id))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.view_count").value(1));

    mvc.perform(put("/api/notices/" + id).header("Authorization", "Bearer " + adminToken).contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"수정 공지\",\"content\":\"수정 본문\",\"published\":true}"))
      .andExpect(status().isOk()).andExpect(jsonPath("$.data.title").value("수정 공지"));

    mvc.perform(post("/api/notices").header("Authorization", "Bearer " + userToken).contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"권한 없음\",\"content\":\"본문\",\"published\":true}"))
      .andExpect(status().isForbidden()).andExpect(jsonPath("$.error").value("FORBIDDEN"));
  }

  @Test
  void comments_create_notifications_and_authorization_rules_work() throws Exception {
    String adminToken = login("admin@example.com", "Admin!2345");
    String userToken = signupAndLogin("commenter@example.com", "Comment!2345", "댓글러");
    String otherToken = signupAndLogin("other@example.com", "Other!2345", "타인");
    String notice = mvc.perform(post("/api/notices").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"댓글 공지\",\"content\":\"본문\",\"published\":true}"))
      .andReturn().getResponse().getContentAsString();
    String noticeId = notice.replaceAll(".*\\\"id\\\":([0-9]+).*", "$1");

    String comment = mvc.perform(post("/api/notices/" + noticeId + "/comments").header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"첫 댓글\"}"))
      .andExpect(status().isCreated()).andExpect(jsonPath("$.data.content").value("첫 댓글"))
      .andReturn().getResponse().getContentAsString();
    String commentId = comment.replaceAll(".*\\\"id\\\":([0-9]+).*", "$1");

    mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk()).andExpect(jsonPath("$.data.items[0].type").value("NEW_COMMENT"));

    mvc.perform(put("/api/comments/" + commentId).header("Authorization", "Bearer " + otherToken).contentType(MediaType.APPLICATION_JSON)
        .content("{\"content\":\"탈취\"}"))
      .andExpect(status().isForbidden());

    mvc.perform(put("/api/comments/" + commentId).header("Authorization", "Bearer " + userToken).contentType(MediaType.APPLICATION_JSON)
        .content("{\"content\":\"수정 댓글\"}"))
      .andExpect(status().isOk()).andExpect(jsonPath("$.data.content").value("수정 댓글"));

    mvc.perform(delete("/api/comments/" + commentId).header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
  }

  @Test
  void admin_user_list_role_update_and_notification_read_all_are_scoped() throws Exception {
    String adminToken = login("admin@example.com", "Admin!2345");
    String userToken = signupAndLogin("roleuser@example.com", "Role!2345", "역할사용자");
    String users = mvc.perform(get("/api/admin/users?keyword=roleuser").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk()).andExpect(jsonPath("$.data.items", hasSize(1)))
      .andReturn().getResponse().getContentAsString();
    String userId = users.replaceAll(".*\\\"id\\\":([0-9]+).*", "$1");

    mvc.perform(patch("/api/admin/users/" + userId + "/role").header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"ADMIN\"}"))
      .andExpect(status().isForbidden());

    mvc.perform(patch("/api/admin/users/" + userId + "/role").header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"ADMIN\"}"))
      .andExpect(status().isOk()).andExpect(jsonPath("$.data.role").value("ADMIN"));

    mvc.perform(patch("/api/notifications/read-all").header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
  }

  String signupAndLogin(String email, String password, String nickname) throws Exception {
    mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
      .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"nickname\":\"" + nickname + "\"}"))
      .andExpect(status().isCreated());
    return login(email, password);
  }

  String login(String email, String password) throws Exception {
    return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
      .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()
      .replaceAll(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*", "$1");
  }
}
