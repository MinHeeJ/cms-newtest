package com.cms.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiV1ControllerContractTest {
    private static final String ADMIN_ID = "11111111-1111-4111-8111-111111111111";
    private static final Cookie ADMIN_SESSION = new Cookie("CMS_SESSION_USER_ID", ADMIN_ID);
    private static final String CONTENT_ID = "66666666-6666-4666-8666-666666666666";
    private static final String REVISION_ID = "77777777-7777-4777-8777-777777777777";
    private static final String TAXONOMY_ID = "55555555-5555-4555-8555-555555555555";
    private static final String MENU_ID = "88888888-8888-4888-8888-888888888888";
    private static final String USER_ID = "33333333-3333-4333-8333-333333333333";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void apiV1ContractFixtureIsLoadedFromClasspathResource() throws Exception {
        ClassPathResource openApi = new ClassPathResource("contracts/openapi.yaml");
        assertThat(openApi.exists()).isTrue();
        assertThat(openApi.getContentAsString(java.nio.charset.StandardCharsets.UTF_8)).contains("/api/v1/content");
    }

    @Test
    void authSessionEndpointsExposeCookieBackedUserAndUnauthorizedNegativeCase() throws Exception {
        mvc.perform(get("/api/v1/auth/session"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.statusCode").value(401));

        mvc.perform(post("/api/v1/auth/session")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", "admin@example.com"))))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("CMS_SESSION_USER_ID"))
            .andExpect(jsonPath("$.user.email").value("admin@example.com"))
            .andExpect(jsonPath("$.permissions").isArray());

        mvc.perform(get("/api/v1/auth/session").cookie(ADMIN_SESSION))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.id").value(ADMIN_ID))
            .andExpect(jsonPath("$.user.roles", org.hamcrest.Matchers.hasItem("ADMIN")));

        mvc.perform(delete("/api/v1/auth/session"))
            .andExpect(status().isNoContent())
            .andExpect(cookie().maxAge("CMS_SESSION_USER_ID", 0));
    }

    @Test
    void contentReadEndpointsReturnDbBackedPagedDetailRevisionPreviewAndNotFoundContracts() throws Exception {
        mvc.perform(get("/api/v1/content").param("status", "PUBLISHED").param("page", "1").param("pageSize", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[*].id", org.hamcrest.Matchers.hasItem(CONTENT_ID)))
            .andExpect(jsonPath("$.pageInfo.totalItems").exists());

        mvc.perform(get("/api/v1/content/{id}", CONTENT_ID))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(CONTENT_ID))
            .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mvc.perform(get("/api/v1/content/{id}", "00000000-0000-4000-8000-000000000000"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.statusCode").value(404));

        mvc.perform(get("/api/v1/content/{id}/revisions", CONTENT_ID))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", org.hamcrest.Matchers.hasItem(REVISION_ID)))
            .andExpect(jsonPath("$[*].revisionNumber", org.hamcrest.Matchers.hasItem(1)));

        mvc.perform(post("/api/v1/content/{id}/preview", CONTENT_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("title", "미리보기 제목", "summary", "요약", "markdownBody", "# 미리보기"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("미리보기 제목"))
            .andExpect(jsonPath("$.html").value(org.hamcrest.Matchers.containsString("미리보기 제목")));
    }

    @Test
    void contentWriteEndpointsPersistWorkflowTransitionsAndScheduleSideEffects() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String createBody = json(Map.of(
            "contentType", "ARTICLE",
            "title", "계약 테스트 초안 " + suffix,
            "slug", "contract-draft-" + suffix,
            "summary", "계약 테스트 요약",
            "markdownBody", "# 계약 테스트",
            "visibility", "PUBLIC",
            "categoryIds", List.of("44444444-4444-4444-8444-444444444444"),
            "tagIds", List.of("55555555-5555-4555-8555-555555555555")
        ));

        JsonNode created = read(mvc.perform(post("/api/v1/content").cookie(ADMIN_SESSION)
                .contentType(MediaType.APPLICATION_JSON).content(createBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("DRAFT"))
            .andExpect(jsonPath("$.author.id").value(ADMIN_ID)));
        String contentId = created.path("id").asText();

        mvc.perform(patch("/api/v1/content/{id}", contentId).cookie(ADMIN_SESSION)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("contentType", "ARTICLE", "title", "수정된 제목 " + suffix, "slug", "contract-draft-" + suffix, "summary", "수정 요약", "markdownBody", "# 수정", "visibility", "PUBLIC", "changeSummary", "계약 테스트 수정"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("수정된 제목 " + suffix))
            .andExpect(jsonPath("$.revisionsCount").value(1));

        mvc.perform(post("/api/v1/content/{id}/submit", contentId).cookie(ADMIN_SESSION))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IN_REVIEW"));

        mvc.perform(post("/api/v1/content/{id}/review", contentId).cookie(ADMIN_SESSION)
                .contentType(MediaType.APPLICATION_JSON).content(json(Map.of("decision", "APPROVE", "comment", "승인"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("APPROVED"));

        mvc.perform(post("/api/v1/content/{id}/publish", contentId).cookie(ADMIN_SESSION))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PUBLISHED"))
            .andExpect(jsonPath("$.publishedAt").exists());

        mvc.perform(post("/api/v1/content/{id}/unpublish", contentId).cookie(ADMIN_SESSION))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DRAFT"));

        mvc.perform(post("/api/v1/content/{id}/schedule", contentId).cookie(ADMIN_SESSION)
                .contentType(MediaType.APPLICATION_JSON).content(json(Map.of("scheduledAt", "2026-08-01T00:00:00Z"))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.contentItemId").value(contentId))
            .andExpect(jsonPath("$.status").value("PENDING"));

        mvc.perform(post("/api/v1/content/{id}/archive", contentId).cookie(ADMIN_SESSION))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ARCHIVED"));

        mvc.perform(delete("/api/v1/content/{id}", contentId).cookie(ADMIN_SESSION).param("confirm", "true"))
            .andExpect(status().isNoContent());

        mvc.perform(post("/api/v1/content/{id}/revisions/{revisionId}/restore", CONTENT_ID, REVISION_ID).cookie(ADMIN_SESSION))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(CONTENT_ID))
            .andExpect(jsonPath("$.title").value("첫 번째 CMS 소식"));
    }

    @Test
    void mediaEndpointsPersistUploadPatchDeleteAndValidationContracts() throws Exception {
        JsonNode uploaded = read(mvc.perform(post("/api/v1/media").cookie(ADMIN_SESSION)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("fileName", "contract.png", "mimeType", "image/png", "sizeBytes", 1024, "altText", "계약 이미지"))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.fileName").value("contract.png"))
            .andExpect(jsonPath("$.uploadedBy.id").value(ADMIN_ID)));
        String mediaId = uploaded.path("id").asText();

        mvc.perform(get("/api/v1/media").param("page", "1").param("pageSize", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items").isArray())
            .andExpect(jsonPath("$.pageInfo.totalItems").exists());

        mvc.perform(patch("/api/v1/media/{id}", mediaId).cookie(ADMIN_SESSION)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("fileName", "contract-renamed.png", "altText", "수정 대체텍스트", "caption", "캡션"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fileName").value("contract-renamed.png"))
            .andExpect(jsonPath("$.altText").value("수정 대체텍스트"));

        mvc.perform(delete("/api/v1/media/{id}", mediaId).param("confirm", "false"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.statusCode").value(400));

        mvc.perform(delete("/api/v1/media/{id}", mediaId).param("confirm", "true"))
            .andExpect(status().isNoContent());
    }

    @Test
    void taxonomyEndpointsExposeFilteringPersistenceAndDeleteValidation() throws Exception {
        mvc.perform(get("/api/v1/taxonomy").param("type", "TAG"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].type", org.hamcrest.Matchers.hasItem("TAG")));

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        JsonNode created = read(mvc.perform(post("/api/v1/taxonomy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("type", "TAG", "name", "계약태그", "slug", "contract-tag-" + suffix, "description", "계약 태그", "sortOrder", 2))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").value("contract-tag-" + suffix)));
        String taxonomyId = created.path("id").asText();

        mvc.perform(patch("/api/v1/taxonomy/{id}", taxonomyId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("type", "TAG", "name", "수정태그", "slug", "contract-tag-" + suffix, "description", "수정됨", "sortOrder", 3))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("수정태그"));

        mvc.perform(delete("/api/v1/taxonomy/{id}", taxonomyId).param("confirm", "false"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.statusCode").value(400));

        mvc.perform(delete("/api/v1/taxonomy/{id}", taxonomyId).param("confirm", "true"))
            .andExpect(status().isNoContent());

        mvc.perform(patch("/api/v1/taxonomy/{id}", TAXONOMY_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("type", "TAG", "name", "CMS", "slug", "cms", "description", "CMS 운영 태그", "sortOrder", 1))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(TAXONOMY_ID));
    }

    @Test
    void navigationMenuEndpointsPersistCreateAndPatchSideEffects() throws Exception {
        mvc.perform(get("/api/v1/navigation/menus"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", org.hamcrest.Matchers.hasItem(MENU_ID)))
            .andExpect(jsonPath("$[0].items[0].label").exists());

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        JsonNode created = read(mvc.perform(post("/api/v1/navigation/menus")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("key", "contract-" + suffix, "label", "계약 메뉴", "isActive", true, "items", List.of(Map.of("label", "외부", "targetType", "URL", "url", "/contract", "sortOrder", 1, "isVisible", true))))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.key").value("contract-" + suffix))
            .andExpect(jsonPath("$.items[0].url").value("/contract")));
        String menuId = created.path("id").asText();

        mvc.perform(patch("/api/v1/navigation/menus/{id}", menuId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("key", "contract-" + suffix, "label", "수정 메뉴", "isActive", false, "items", List.of(Map.of("label", "수정", "targetType", "URL", "url", "/updated", "sortOrder", 2, "isVisible", true))))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.label").value("수정 메뉴"))
            .andExpect(jsonPath("$.isActive").value(false))
            .andExpect(jsonPath("$.items[0].url").value("/updated"));
    }

    @Test
    void usersDashboardAndAuditEndpointsReturnDbBackedPagingAndPermissionSideEffects() throws Exception {
        mvc.perform(get("/api/v1/users").param("page", "1").param("pageSize", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].email").exists())
            .andExpect(jsonPath("$.pageInfo.totalItems").exists());

        mvc.perform(patch("/api/v1/users/{id}/roles", USER_ID).cookie(ADMIN_SESSION)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("roles", List.of("AUTHOR", "EDITOR"), "reason", "계약 테스트 권한 변경"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(USER_ID))
            .andExpect(jsonPath("$.roles", org.hamcrest.Matchers.hasItem("EDITOR")));

        mvc.perform(get("/api/v1/dashboard/metrics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.contentCounts.published").exists())
            .andExpect(jsonPath("$.recentActivity").isArray())
            .andExpect(jsonPath("$.publishingTrend").isArray());

        mvc.perform(get("/api/v1/audit/events").param("targetType", "USER").param("page", "1").param("pageSize", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items").isArray())
            .andExpect(jsonPath("$.pageInfo.totalItems").exists());
    }

    private JsonNode read(org.springframework.test.web.servlet.ResultActions actions) throws Exception {
        return objectMapper.readTree(actions.andReturn().getResponse().getContentAsString());
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }
}
