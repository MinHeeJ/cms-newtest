package com.cms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
  "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration"
})
@AutoConfigureMockMvc
class CmsApiContractTest {
  private static final String ABSENT_ID = "00000000-0000-0000-0000-000000000000";

  @Autowired MockMvc mvc;

  @MockBean CmsMapper cmsMapper;

  @Test void openapi_contract_fixture_is_loaded_from_classpath() throws Exception {
    ClassPathResource contract = new ClassPathResource("contracts/openapi.yaml");
    String yaml = contract.getContentAsString(StandardCharsets.UTF_8);
    assertTrue(yaml.contains("/api/admin/documents"));
    assertTrue(yaml.contains("/api/portal/tree"));
    assertTrue(yaml.contains("operationId:"));
  }

  @Test void health_uses_envelope_and_database_dependency_signal() throws Exception {
    mvc.perform(get("/api/health"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.status").value("UP"))
      .andExpect(jsonPath("$.data.service").value("cms-backend"))
      .andExpect(jsonPath("$.data.dependencies.database").exists());
  }

  @Test void portal_tree_search_and_document_visibility_contracts() throws Exception {
    mvc.perform(get("/api/portal/tree"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.folders").isArray())
      .andExpect(jsonPath("$.data.folders[*].active", everyItem(is(true))));

    mvc.perform(get("/api/search").param("q", "cms"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.query").value("cms"))
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/search").param("q", " "))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.success").value(false))
      .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
      .andExpect(jsonPath("$.error.message", not(containsString("Exception"))))
      .andExpect(jsonPath("$.error.traceId").exists());

    mvc.perform(get("/api/portal/documents/00000000-0000-0000-0000-000000000000"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.success").value(false))
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
  }

  @Test void admin_read_endpoints_return_enveloped_page_or_tree_contracts() throws Exception {
    mvc.perform(get("/api/admin/tree"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.folders").isArray())
      .andExpect(jsonPath("$.data.documents").isArray());

    mvc.perform(get("/api/admin/folders"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray())
      .andExpect(jsonPath("$.data.page").value(0));

    mvc.perform(get("/api/admin/documents"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray())
      .andExpect(jsonPath("$.data.size").value(20));

    mvc.perform(get("/api/admin/audit-logs"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/admin/backups"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/admin/schedules"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/admin/scope-items"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/admin/staff"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/admin/risks"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/admin/deliverables"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/admin/change-requests"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());
  }

  @Test void folder_write_update_delete_contracts_include_side_effect_visibility() throws Exception {
    String folder = mvc.perform(post("/api/admin/folders")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"name":"계약 폴더","active":true,"sortOrder":7}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.folderId").exists())
      .andExpect(jsonPath("$.data.name").value("계약 폴더"))
      .andReturn().getResponse().getContentAsString();
    String folderId = JsonPathReader.read(folder, "folderId");

    mvc.perform(patch("/api/admin/folders/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"name":"없는 폴더"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(patch("/api/admin/folders/" + folderId)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"name":"계약 폴더 수정","active":false}
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.name").value("계약 폴더 수정"))
      .andExpect(jsonPath("$.data.active").value(false));

    mvc.perform(delete("/api/admin/folders/00000000-0000-0000-0000-000000000000"))
      .andExpect(status().isConflict())
      .andExpect(jsonPath("$.success").value(false))
      .andExpect(jsonPath("$.error.code").value("CONFLICT"));

    mvc.perform(delete("/api/admin/folders/" + folderId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.folderId").value(folderId))
      .andExpect(jsonPath("$.data.deleted").value(true));
  }

  @Test void document_lifecycle_controls_portal_filtering_and_state_transitions() throws Exception {
    String folder = mvc.perform(post("/api/admin/folders")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"name":"문서 계약 폴더","active":true}
          """))
      .andExpect(status().isCreated())
      .andReturn().getResponse().getContentAsString();
    String folderId = JsonPathReader.read(folder, "folderId");

    mvc.perform(post("/api/admin/documents")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"본문 누락"}
          """))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));

    String created = mvc.perform(post("/api/admin/documents")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"folderId\":\"" + folderId + "\",\"title\":\"계약 테스트 문서\",\"markdownBody\":\"# 문서\\n본문\"}"))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.status").value("DRAFT"))
      .andReturn().getResponse().getContentAsString();
    String documentId = JsonPathReader.read(created, "documentId");

    mvc.perform(get("/api/portal/documents/" + documentId))
      .andExpect(status().isNotFound());

    mvc.perform(patch("/api/admin/documents/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"없는 문서"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(patch("/api/admin/documents/" + documentId)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"계약 테스트 문서 수정","markdownBody":"# 수정"}
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.title").value("계약 테스트 문서 수정"));

    mvc.perform(post("/api/admin/documents/00000000-0000-0000-0000-000000000000/publish")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isConflict())
      .andExpect(jsonPath("$.error.code").value("CONFLICT"));

    mvc.perform(post("/api/admin/documents/" + documentId + "/publish")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.status").value("PUBLISHED"));

    mvc.perform(post("/api/documents/00000000-0000-0000-0000-000000000000/render")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/documents/" + documentId + "/render")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.renderedHtml", containsString("<h1>")));

    mvc.perform(get("/api/portal/documents/" + documentId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.title").value("계약 테스트 문서 수정"))
      .andExpect(jsonPath("$.data.renderedHtml").exists());

    mvc.perform(post("/api/admin/documents/00000000-0000-0000-0000-000000000000/unpublish")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isConflict())
      .andExpect(jsonPath("$.error.code").value("CONFLICT"));

    mvc.perform(post("/api/admin/documents/" + documentId + "/unpublish")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.status").value("UNPUBLISHED"));

    mvc.perform(delete("/api/admin/documents/00000000-0000-0000-0000-000000000000"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(delete("/api/admin/documents/" + documentId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.deleted").value(true));
  }

  @Test void attachment_upload_list_download_delete_contracts_cover_validation_and_side_effects() throws Exception {
    String documentId = JsonPathReader.seedPublishedDocument(mvc);

    mvc.perform(post("/api/documents/00000000-0000-0000-0000-000000000000/attachments")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"fileName":"guide.pdf","contentType":"application/pdf","sizeBytes":2048}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/documents/" + documentId + "/attachments")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"fileName":"../bad.pdf","contentType":"application/pdf","sizeBytes":2048}
          """))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));

    String uploaded = mvc.perform(post("/api/documents/" + documentId + "/attachments")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"fileName":"guide.pdf","contentType":"application/pdf","sizeBytes":2048}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.fileName").value("guide.pdf"))
      .andExpect(jsonPath("$.data.storageKey").exists())
      .andReturn().getResponse().getContentAsString();
    String attachmentId = JsonPathReader.read(uploaded, "attachmentId");

    mvc.perform(get("/api/documents/00000000-0000-0000-0000-000000000000/attachments"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items").isArray());

    mvc.perform(get("/api/documents/" + documentId + "/attachments"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items[*].attachmentId", hasItem(attachmentId)));

    mvc.perform(get("/api/attachments/00000000-0000-0000-0000-000000000000/download"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(get("/api/attachments/" + attachmentId + "/download"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.downloadName").value("guide.pdf"));

    mvc.perform(delete("/api/attachments/00000000-0000-0000-0000-000000000000"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(delete("/api/attachments/" + attachmentId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.deleted").value(true));
  }

  @Test void operation_jobs_backup_restore_and_migration_contracts_show_db_side_effects() throws Exception {
    String backup = mvc.perform(post("/api/admin/backups")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"requestedBy":"운영자"}
          """))
      .andExpect(status().isAccepted())
      .andExpect(jsonPath("$.data.jobType").value("BACKUP"))
      .andExpect(jsonPath("$.data.status").value("REQUESTED"))
      .andReturn().getResponse().getContentAsString();
    String backupId = JsonPathReader.read(backup, "jobId");

    mvc.perform(get("/api/admin/backups"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items[*].jobId", hasItem(backupId)));

    mvc.perform(post("/api/admin/backups/00000000-0000-0000-0000-000000000000/restore")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/admin/backups/" + backupId + "/restore")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isAccepted())
      .andExpect(jsonPath("$.data.status").value("RESTORE_REQUESTED"));

    String migration = mvc.perform(post("/api/admin/migrations")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"requestedBy":"이관담당"}
          """))
      .andExpect(status().isAccepted())
      .andExpect(jsonPath("$.data.jobType").value("MIGRATION"))
      .andExpect(jsonPath("$.data.status").value("REQUESTED"))
      .andReturn().getResponse().getContentAsString();
    String migrationId = JsonPathReader.read(migration, "jobId");

    mvc.perform(get("/api/admin/migrations/00000000-0000-0000-0000-000000000000"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(get("/api/admin/migrations/" + migrationId))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.jobId").value(migrationId))
      .andExpect(jsonPath("$.data.jobType").value("MIGRATION"));
  }

  @Test void project_modules_create_patch_read_and_validation_contracts() throws Exception {
    mvc.perform(post("/api/admin/schedules")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"분석","owner":"PM","status":"PLANNED"}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.module").value("SCHEDULE"))
      .andExpect(jsonPath("$.data.status").value("PLANNED"));

    mvc.perform(patch("/api/admin/schedules/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"status":"IN_PROGRESS"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/admin/scope-items")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"범위 기준","owner":"BA"}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.module").value("SCOPE"))
      .andExpect(jsonPath("$.data.status").value("REGISTERED"));

    mvc.perform(patch("/api/admin/scope-items/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"status":"REVIEWING"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/admin/staff")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"프론트엔드","owner":"리드"}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.module").value("STAFF"))
      .andExpect(jsonPath("$.data.status").value("ACTIVE"));

    mvc.perform(patch("/api/admin/staff/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"status":"INACTIVE"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/admin/risks")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"품질 위험","owner":"QA","severity":"HIGH"}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.module").value("RISK"))
      .andExpect(jsonPath("$.data.status").value("REGISTERED"));

    mvc.perform(patch("/api/admin/risks/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"status":"ACTIONING"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/admin/deliverables")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"설계서","owner":"아키텍트"}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.module").value("DELIVERABLE"))
      .andExpect(jsonPath("$.data.status").value("DRAFT"));

    mvc.perform(patch("/api/admin/deliverables/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"approvalState":"SUBMITTED"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/admin/change-requests")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"범위 변경","owner":"PM"}
          """))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.data.module").value("CHANGE"))
      .andExpect(jsonPath("$.data.status").value("REQUESTED"));

    mvc.perform(patch("/api/admin/change-requests/00000000-0000-0000-0000-000000000000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"status":"IMPACT_ANALYSIS"}
          """))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    mvc.perform(post("/api/admin/change-requests")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"title":"담당자 누락"}
          """))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));

    mvc.perform(get("/api/admin/audit-logs"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items", not(empty())));
  }

  @Test void async_sort_pdf_and_missing_attachment_document_contracts() throws Exception {
    mvc.perform(patch("/api/admin/sort-order")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"folderIds":["00000000-0000-0000-0000-000000000000"],"documentIds":[]}
          """))
      .andExpect(status().isAccepted())
      .andExpect(jsonPath("$.data.accepted").value(true));

    mvc.perform(post("/api/documents/00000000-0000-0000-0000-000000000000/import-pdf")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));

    String documentId = JsonPathReader.seedPublishedDocument(mvc);
    mvc.perform(post("/api/documents/" + documentId + "/import-pdf")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isAccepted())
      .andExpect(jsonPath("$.data.documentId").value(documentId))
      .andExpect(jsonPath("$.data.status").value("REQUESTED"));
  }

  @TestConfiguration
  static class ContractTestConfig {
    @Bean
    @Primary
    CmsService cmsService() {
      return new InMemoryCmsService();
    }
  }

  static class InMemoryCmsService extends CmsService {
    private final Map<String, Map<String,Object>> folders = new LinkedHashMap<>();
    private final Map<String, Map<String,Object>> documents = new LinkedHashMap<>();
    private final Map<String, Map<String,Object>> attachments = new LinkedHashMap<>();
    private final Map<String, Map<String,Object>> jobs = new LinkedHashMap<>();
    private final Map<String, Map<String,Object>> projects = new LinkedHashMap<>();
    private final List<Map<String,Object>> audits = new ArrayList<>();

    InMemoryCmsService() { super(null); }

    @Override public int ping() { return 1; }

    @Override public Map<String,Object> insertFolder(Map<String,Object> row) {
      String id = UUID.randomUUID().toString();
      Map<String,Object> saved = mutable("folderId", id, "name", row.get("name"), "parentFolderId", row.get("parentFolderId"), "active", row.getOrDefault("active", true), "sortOrder", row.getOrDefault("sortOrder", 0), "deleted", false, "createdAt", OffsetDateTime.now().toString());
      folders.put(id, saved);
      return saved;
    }
    @Override public List<Map<String,Object>> folders() { return undeleted(folders); }
    @Override public int updateFolder(Map<String,Object> row) {
      Map<String,Object> folder = folders.get(String.valueOf(row.get("folderId")));
      if (folder == null || Boolean.TRUE.equals(folder.get("deleted"))) return 0;
      putIfPresent(folder, row, "name", "active", "parentFolderId", "sortOrder");
      return 1;
    }
    @Override public int deleteFolder(Map<String,Object> row) {
      Map<String,Object> folder = folders.get(String.valueOf(row.get("folderId")));
      if (folder == null || Boolean.TRUE.equals(folder.get("deleted"))) return 0;
      boolean hasChildren = documents.values().stream().anyMatch(d -> Objects.equals(d.get("folderId"), folder.get("folderId")) && !Boolean.TRUE.equals(d.get("deleted")));
      if (hasChildren) return 0;
      folder.put("deleted", true); folder.put("active", false); return 1;
    }

    @Override public Map<String,Object> insertDocument(Map<String,Object> row) {
      String id = UUID.randomUUID().toString();
      Map<String,Object> saved = mutable("documentId", id, "folderId", row.get("folderId"), "title", row.get("title"), "markdownBody", row.get("markdownBody"), "status", "DRAFT", "version", 1, "displayOrder", row.getOrDefault("displayOrder", 0), "deleted", false, "createdAt", OffsetDateTime.now().toString());
      documents.put(id, saved);
      return saved;
    }
    @Override public List<Map<String,Object>> documents(int size, int offset) { return page(undeleted(documents), size, offset); }
    @Override public Map<String,Object> document(String documentId) {
      Map<String,Object> document = documents.get(documentId);
      return document == null || Boolean.TRUE.equals(document.get("deleted")) ? null : document;
    }
    @Override public int updateDocument(Map<String,Object> row) {
      Map<String,Object> document = document(String.valueOf(row.get("documentId")));
      if (document == null) return 0;
      putIfPresent(document, row, "title", "markdownBody", "folderId");
      document.put("version", ((Number) document.get("version")).intValue() + 1);
      if ("PUBLISHED".equals(document.get("status"))) document.put("status", "REVIEW");
      return 1;
    }
    @Override public int publish(Map<String,Object> row) {
      Map<String,Object> document = document(String.valueOf(row.get("documentId")));
      if (document == null || !Set.of("DRAFT", "REVIEW", "UNPUBLISHED").contains(document.get("status"))) return 0;
      document.put("status", "PUBLISHED"); document.put("publishedAt", OffsetDateTime.now().toString()); return 1;
    }
    @Override public int unpublish(Map<String,Object> row) {
      Map<String,Object> document = document(String.valueOf(row.get("documentId")));
      if (document == null || !"PUBLISHED".equals(document.get("status"))) return 0;
      document.put("status", "UNPUBLISHED"); return 1;
    }
    @Override public int deleteDocument(Map<String,Object> row) {
      Map<String,Object> document = document(String.valueOf(row.get("documentId")));
      if (document == null) return 0;
      document.put("deleted", true); document.put("status", "DELETED"); return 1;
    }
    @Override public Map<String,Object> portalDocument(String documentId) {
      Map<String,Object> document = document(documentId);
      if (document == null || !"PUBLISHED".equals(document.get("status"))) return null;
      Map<String,Object> folder = folders.get(String.valueOf(document.get("folderId")));
      if (folder == null || !Boolean.TRUE.equals(folder.get("active")) || Boolean.TRUE.equals(folder.get("deleted"))) return null;
      Map<String,Object> visible = new LinkedHashMap<>(document);
      visible.put("folderName", folder.get("name"));
      return visible;
    }
    @Override public List<Map<String,Object>> search(String query, int size, int offset) {
      String q = query.toLowerCase(Locale.ROOT);
      List<Map<String,Object>> matches = documents.values().stream().filter(d -> !Boolean.TRUE.equals(d.get("deleted")) && "PUBLISHED".equals(d.get("status")) && (String.valueOf(d.get("title")).toLowerCase(Locale.ROOT).contains(q) || String.valueOf(d.get("markdownBody")).toLowerCase(Locale.ROOT).contains(q))).map(d -> mutable("documentId", d.get("documentId"), "title", d.get("title"), "summary", String.valueOf(d.get("markdownBody")), "folderName", folderName(d))).toList();
      return page(matches, size, offset);
    }
    @Override public List<Map<String,Object>> publishedDocuments() { return documents.values().stream().filter(d -> !Boolean.TRUE.equals(d.get("deleted")) && "PUBLISHED".equals(d.get("status"))).map(d -> mutable("folderId", d.get("folderId"), "documentId", d.get("documentId"), "title", d.get("title"), "status", d.get("status"))).toList(); }

    @Override public Map<String,Object> insertAttachment(Map<String,Object> row) {
      String id = UUID.randomUUID().toString();
      Map<String,Object> saved = mutable("attachmentId", id, "documentId", row.get("documentId"), "fileName", row.get("fileName"), "downloadName", row.get("fileName"), "contentType", row.getOrDefault("contentType", "application/octet-stream"), "sizeBytes", row.get("sizeBytes"), "storageKey", "attachments/" + UUID.randomUUID() + "/" + row.get("fileName"), "status", "AVAILABLE", "deleted", false);
      attachments.put(id, saved);
      return saved;
    }
    @Override public List<Map<String,Object>> attachments(String documentId) { return attachments.values().stream().filter(a -> Objects.equals(a.get("documentId"), documentId) && !Boolean.TRUE.equals(a.get("deleted"))).map(InMemoryCmsService::copy).toList(); }
    @Override public Map<String,Object> attachment(String attachmentId) { Map<String,Object> a = attachments.get(attachmentId); return a == null || Boolean.TRUE.equals(a.get("deleted")) ? null : a; }
    @Override public int deleteAttachment(Map<String,Object> row) { Map<String,Object> a = attachment(String.valueOf(row.get("attachmentId"))); if (a == null) return 0; a.put("deleted", true); a.put("status", "DELETED"); return 1; }

    @Override public Map<String,Object> audit(Map<String,Object> row) { Map<String,Object> saved = new LinkedHashMap<>(row); saved.put("auditLogId", UUID.randomUUID().toString()); saved.put("createdAt", OffsetDateTime.now().toString()); audits.add(saved); return saved; }
    @Override public List<Map<String,Object>> auditLogs(int size, int offset) { return page(audits, size, offset); }
    @Override public Map<String,Object> insertJob(Map<String,Object> row) { String id = UUID.randomUUID().toString(); Map<String,Object> saved = new LinkedHashMap<>(row); saved.put("jobId", id); saved.put("createdAt", OffsetDateTime.now().toString()); jobs.put(id, saved); return saved; }
    @Override public List<Map<String,Object>> jobs(String jobType, int size, int offset) { return page(jobs.values().stream().filter(j -> Objects.equals(j.get("jobType"), jobType)).toList(), size, offset); }
    @Override public Map<String,Object> job(String jobId) { return jobs.get(jobId); }
    @Override public int restore(String jobId) { Map<String,Object> job = jobs.get(jobId); if (job == null || !"BACKUP".equals(job.get("jobType"))) return 0; job.put("status", "RESTORE_REQUESTED"); return 1; }

    @Override public Map<String,Object> insertProject(Map<String,Object> row) { return createProjectRecord(String.valueOf(row.get("module")), row); }
    @Override public List<Map<String,Object>> projects(String module, int size, int offset) { return page(projects.values().stream().filter(p -> Objects.equals(p.get("module"), module)).toList(), size, offset); }
    @Override public int updateProject(Map<String,Object> row) { return updateProjectRecord(String.valueOf(row.get("module")), String.valueOf(row.get("recordId")), row) ? 1 : 0; }
    @Override public Map<String,Object> createProjectRecord(String module, Map<String,Object> body) {
      Object title = body == null ? null : body.get("title"); Object owner = body == null ? null : body.get("owner");
      if (title == null || String.valueOf(title).isBlank()) throw new ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "제목은 필수입니다.");
      if (owner == null || String.valueOf(owner).isBlank()) throw new ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "담당자는 필수입니다.");
      String id = UUID.randomUUID().toString(); Map<String,Object> saved = new LinkedHashMap<>(body); saved.put("recordId", id); saved.put("module", module); saved.putIfAbsent("status", defaultStatus(module)); projects.put(id, saved); return saved;
    }
    @Override public boolean updateProjectRecord(String module, String recordId, Map<String,Object> body) { Map<String,Object> p = projects.get(recordId); if (p == null || !Objects.equals(p.get("module"), module)) return false; p.putAll(body); return true; }

    private String folderName(Map<String,Object> d) { Map<String,Object> f = folders.get(String.valueOf(d.get("folderId"))); return f == null ? null : String.valueOf(f.get("name")); }
    private static void putIfPresent(Map<String,Object> target, Map<String,Object> source, String... keys) { for (String key : keys) if (source.containsKey(key)) target.put(key, source.get(key)); }
    private static List<Map<String,Object>> undeleted(Map<String,Map<String,Object>> map) { return map.values().stream().filter(v -> !Boolean.TRUE.equals(v.get("deleted"))).map(InMemoryCmsService::copy).toList(); }
    private static List<Map<String,Object>> page(List<Map<String,Object>> list, int size, int offset) { return list.stream().skip(Math.max(0, offset)).limit(Math.max(1, size)).map(InMemoryCmsService::copy).toList(); }
    private static Map<String,Object> copy(Map<String,Object> source) { return new LinkedHashMap<>(source); }
    private static Map<String,Object> mutable(Object... kv) { Map<String,Object> m = new LinkedHashMap<>(); for (int i = 0; i < kv.length; i += 2) m.put(String.valueOf(kv[i]), kv[i + 1]); return m; }
    private static String defaultStatus(String module) { return switch(module) { case "SCHEDULE" -> "PLANNED"; case "SCOPE" -> "REGISTERED"; case "STAFF" -> "ACTIVE"; case "RISK" -> "REGISTERED"; case "DELIVERABLE" -> "DRAFT"; case "CHANGE" -> "REQUESTED"; default -> "REQUESTED"; }; }
  }
}
