package com.cms.contract;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OpenApiOperationContractTest {
    @Autowired MockMvc mvc;

    @Test void openapiFixtureIsClasspathContract() throws Exception {
        ClassPathResource fixture = new ClassPathResource("contracts/openapi.yaml");
        org.junit.jupiter.api.Assertions.assertTrue(fixture.exists());
        org.junit.jupiter.api.Assertions.assertTrue(new String(fixture.getInputStream().readAllBytes(), StandardCharsets.UTF_8).contains("openapi: 3.0.3"));
    }

    @Test void getHealthContract() throws Exception { mvc.perform(get("/api/health")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.status").exists()); }
    @Test void getPortalTreeContract() throws Exception { mvc.perform(get("/api/portal/tree")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data").exists()); }
    @Test void getPortalDocumentsContractAndPublishedFiltering() throws Exception { mvc.perform(get("/api/portal/documents")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data").isArray()).andExpect(jsonPath("$.meta", hasKey("totalElements"))); }
    @Test void getPortalDocumentNotFoundContract() throws Exception { mvc.perform(get("/api/portal/documents/00000000-0000-4000-8000-000000000001")).andExpect(status().isNotFound()).andExpect(jsonPath("$.success").value(false)).andExpect(jsonPath("$.error.code").value("NOT_FOUND")); }
    @Test void getAdminFoldersAuthContract() throws Exception { mvc.perform(get("/api/admin/folders")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.error.code").value("UNAUTHORIZED")); }
    @Test void postAdminFoldersValidationContract() throws Exception { mvc.perform(post("/api/admin/folders").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR")); }
    @Test void putAdminFolderContract() throws Exception { mvc.perform(put("/api/admin/folders/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Updated\",\"active\":true,\"displayOrder\":0}" )).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void deleteAdminFolderContract() throws Exception { mvc.perform(delete("/api/admin/folders/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN")).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void getAdminDocumentsContract() throws Exception { mvc.perform(get("/api/admin/documents").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data").isArray()); }
    @Test void postAdminDocumentsContract() throws Exception { mvc.perform(post("/api/admin/documents").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"New\",\"markdownBody\":\"# body\",\"folderId\":\"00000000-0000-4000-8000-000000000001\"}" )).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void getAdminDocumentContract() throws Exception { mvc.perform(get("/api/admin/documents/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN")).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void putAdminDocumentContract() throws Exception { mvc.perform(put("/api/admin/documents/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Updated\",\"markdownBody\":\"body\",\"folderId\":\"00000000-0000-4000-8000-000000000001\"}" )).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void deleteAdminDocumentContract() throws Exception { mvc.perform(delete("/api/admin/documents/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN")).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void postAdminDocumentTransitionContract() throws Exception { mvc.perform(post("/api/admin/documents/00000000-0000-4000-8000-000000000001/transitions").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"targetStatus\":\"IN_REVIEW\"}" )).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void getAdminAttachmentsContract() throws Exception { mvc.perform(get("/api/admin/documents/00000000-0000-4000-8000-000000000001/attachments").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data").exists()); }
    @Test void postAdminAttachmentValidationContract() throws Exception { mvc.perform(multipart("/api/admin/documents/00000000-0000-4000-8000-000000000001/attachments").file("file", "content".getBytes()).header("X-Role", "ADMIN")).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void postAdminDocumentsAttachmentsContract() throws Exception { mvc.perform(post("/api/admin/documents/00000000-0000-4000-8000-000000000001/attachments").header("X-Role", "ADMIN").contentType(MediaType.MULTIPART_FORM_DATA).content(new byte[0])).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").value(false)).andExpect(jsonPath("$.error").exists()); }
    @Test void getAttachmentNotFoundContract() throws Exception { mvc.perform(get("/api/attachments/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN")).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void deleteAttachmentContract() throws Exception { mvc.perform(delete("/api/attachments/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN")).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void getAdminAuditLogsContract() throws Exception { mvc.perform(get("/api/admin/audit-logs").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data").exists()); }
    @Test void getAdminBackupsContract() throws Exception { mvc.perform(get("/api/admin/backups").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data").exists()); }
    @Test void postAdminBackupsSideEffectContract() throws Exception { mvc.perform(post("/api/admin/backups").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"targets\":\"ALL\"}" )).andExpect(status().isAccepted()).andExpect(jsonPath("$.data.status").value("QUEUED")); }
    @Test void postRestoreVerificationContract() throws Exception { mvc.perform(post("/api/admin/restore-verifications").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"target\":\"VALIDATION\"}" )).andExpect(status().isAccepted()).andExpect(jsonPath("$.data.id").exists()); }
    @Test void getAdminMigrationsContract() throws Exception { mvc.perform(get("/api/admin/migrations").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data").exists()); }
    @Test void postAdminMigrationsContract() throws Exception { mvc.perform(post("/api/admin/migrations").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"sourceType\":\"CSV\"}" )).andExpect(status().isAccepted()).andExpect(jsonPath("$.data.status").value("QUEUED")); }
    @Test void getAdminProjectByIdContract() throws Exception { mvc.perform(get("/api/admin/project/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN")).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void postAdminProjectByIdContract() throws Exception { mvc.perform(post("/api/admin/project/00000000-0000-4000-8000-000000000001").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Updated\"}" )).andExpect(status().is4xxClientError()).andExpect(jsonPath("$.success").exists()); }
    @Test void getAdminProjectScheduleItemsContract() throws Exception { mvc.perform(get("/api/admin/project/schedule-items").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data").isArray()); }
    @Test void postAdminProjectContract() throws Exception { mvc.perform(post("/api/admin/project/schedule-items").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR")); }
    @Test void getRequirementItemsContract() throws Exception { mvc.perform(get("/api/admin/project/requirement-items").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()); }
    @Test void postRequirementItemsContract() throws Exception { mvc.perform(post("/api/admin/project/requirement-items").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Requirement\"}" )).andExpect(status().is2xxSuccessful()).andExpect(jsonPath("$.data.status").value("PLANNED")); }
    @Test void getWorkforceAssignmentsContract() throws Exception { mvc.perform(get("/api/admin/project/workforce-assignments").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()); }
    @Test void postWorkforceAssignmentsContract() throws Exception { mvc.perform(post("/api/admin/project/workforce-assignments").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Assignment\"}" )).andExpect(status().is2xxSuccessful()); }
    @Test void getRiskIssuesContract() throws Exception { mvc.perform(get("/api/admin/project/risk-issues").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()); }
    @Test void postRiskIssuesContract() throws Exception { mvc.perform(post("/api/admin/project/risk-issues").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Risk\"}" )).andExpect(status().is2xxSuccessful()); }
    @Test void getDeliverablesContract() throws Exception { mvc.perform(get("/api/admin/project/deliverables").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()); }
    @Test void postDeliverablesContract() throws Exception { mvc.perform(post("/api/admin/project/deliverables").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Deliverable\"}" )).andExpect(status().is2xxSuccessful()); }
    @Test void getChangeRequestsContract() throws Exception { mvc.perform(get("/api/admin/project/change-requests").header("X-Role", "ADMIN")).andExpect(status().is2xxSuccessful()); }
    @Test void postChangeRequestsContract() throws Exception { mvc.perform(post("/api/admin/project/change-requests").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Change\"}" )).andExpect(status().is2xxSuccessful()); }
    @Test void postChangeRequestTransitionContract() throws Exception { mvc.perform(post("/api/admin/project/change-requests/00000000-0000-4000-8000-000000000001/transitions").header("X-Role", "ADMIN").contentType(MediaType.APPLICATION_JSON).content("{\"targetStatus\":\"IMPACT_ANALYSIS\"}" )).andExpect(status().is2xxSuccessful()); }

    @Test void getAuthSessionContract() throws Exception { mvc.perform(get("/api/v1/auth/session")).andExpect(status().is4xxClientError()); }
    @Test void postAuthSessionContract() throws Exception { mvc.perform(post("/api/v1/auth/session").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@example.com\"}" )).andExpect(status().is4xxClientError()); }
    @Test void deleteAuthSessionContract() throws Exception { mvc.perform(delete("/api/v1/auth/session")).andExpect(status().isNoContent()); }
    @Test void getContentContract() throws Exception { mvc.perform(get("/api/v1/content")).andExpect(status().is2xxSuccessful()); }
    @Test void postContentContract() throws Exception { mvc.perform(post("/api/v1/content").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void getContentByIdContract() throws Exception { mvc.perform(get("/api/v1/content/00000000-0000-4000-8000-000000000001")).andExpect(status().is4xxClientError()); }
    @Test void patchContentContract() throws Exception { mvc.perform(patch("/api/v1/content/00000000-0000-4000-8000-000000000001").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void deleteContentContract() throws Exception { mvc.perform(delete("/api/v1/content/00000000-0000-4000-8000-000000000001")).andExpect(status().is4xxClientError()); }
    @Test void getContentRevisionsContract() throws Exception { mvc.perform(get("/api/v1/content/00000000-0000-4000-8000-000000000001/revisions")).andExpect(status().is4xxClientError()); }
    @Test void postContentPreviewContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/preview")).andExpect(status().is4xxClientError()); }
    @Test void postContentSubmitContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/submit")).andExpect(status().is4xxClientError()); }
    @Test void postContentReviewContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/review").contentType(MediaType.APPLICATION_JSON).content("{\"decision\":\"APPROVE\"}" )).andExpect(status().is4xxClientError()); }
    @Test void postContentPublishContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/publish")).andExpect(status().is4xxClientError()); }
    @Test void postContentScheduleContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/schedule").contentType(MediaType.APPLICATION_JSON).content("{\"scheduledAt\":\"2030-01-01T00:00:00Z\"}" )).andExpect(status().is4xxClientError()); }
    @Test void postContentUnpublishContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/unpublish")).andExpect(status().is4xxClientError()); }
    @Test void postContentArchiveContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/archive")).andExpect(status().is4xxClientError()); }
    @Test void postRestoreRevisionContract() throws Exception { mvc.perform(post("/api/v1/content/00000000-0000-4000-8000-000000000001/revisions/00000000-0000-4000-8000-000000000002/restore")).andExpect(status().is4xxClientError()); }
    @Test void getMediaContract() throws Exception { mvc.perform(get("/api/v1/media")).andExpect(status().is2xxSuccessful()); }
    @Test void postMediaContract() throws Exception { mvc.perform(post("/api/v1/media").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void patchMediaContract() throws Exception { mvc.perform(patch("/api/v1/media/00000000-0000-4000-8000-000000000001").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void deleteMediaContract() throws Exception { mvc.perform(delete("/api/v1/media/00000000-0000-4000-8000-000000000001")).andExpect(status().is4xxClientError()); }
    @Test void getTaxonomyContract() throws Exception { mvc.perform(get("/api/v1/taxonomy")).andExpect(status().is2xxSuccessful()); }
    @Test void postTaxonomyContract() throws Exception { mvc.perform(post("/api/v1/taxonomy").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void patchTaxonomyContract() throws Exception { mvc.perform(patch("/api/v1/taxonomy/00000000-0000-4000-8000-000000000001").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void deleteTaxonomyContract() throws Exception { mvc.perform(delete("/api/v1/taxonomy/00000000-0000-4000-8000-000000000001")).andExpect(status().is4xxClientError()); }
    @Test void getNavigationMenusContract() throws Exception { mvc.perform(get("/api/v1/navigation/menus")).andExpect(status().is2xxSuccessful()); }
    @Test void postNavigationMenusContract() throws Exception { mvc.perform(post("/api/v1/navigation/menus").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void patchNavigationMenuContract() throws Exception { mvc.perform(patch("/api/v1/navigation/menus/00000000-0000-4000-8000-000000000001").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().is4xxClientError()); }
    @Test void getUsersContract() throws Exception { mvc.perform(get("/api/v1/users")).andExpect(status().is4xxClientError()); }
    @Test void patchUserRolesContract() throws Exception { mvc.perform(patch("/api/v1/users/00000000-0000-4000-8000-000000000001/roles").contentType(MediaType.APPLICATION_JSON).content("{\"roles\":[]}" )).andExpect(status().is4xxClientError()); }
    @Test void getDashboardMetricsContract() throws Exception { mvc.perform(get("/api/v1/dashboard/metrics")).andExpect(status().is2xxSuccessful()); }
    @Test void getAuditEventsContract() throws Exception { mvc.perform(get("/api/v1/audit/events")).andExpect(status().is2xxSuccessful()); }
}
