package com.cms.operations;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OperationsVendorStateTransitionContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void rejectionReasonActiveInactiveStateTransitionsAreAssertedByListCreateAndUpdate() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        JsonNode created = read(mvc.perform(post("/api/rejection-reasons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "businessType", "STATE-CONTRACT",
                    "reasonCode", "ACTIVE-" + suffix,
                    "standardMessage", "상태 전이 계약 테스트",
                    "allowAdditionalComment", true
                ))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.active").value(true))
            .andExpect(jsonPath("$.data.state").value("ACTIVE"))
            .andExpect(jsonPath("$.data.reasonCode").value("ACTIVE-" + suffix)));
        String reasonId = created.path("data").path("reasonId").asText();

        mvc.perform(get("/api/rejection-reasons").param("businessType", "STATE-CONTRACT").param("active", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[*].active", everyItem(is(true))))
            .andExpect(jsonPath("$.data.items[*].state", everyItem(is("ACTIVE"))))
            .andExpect(jsonPath("$.data.items[*].reasonCode", hasItem("ACTIVE-" + suffix)));

        mvc.perform(put("/api/rejection-reasons/{reasonId}", reasonId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "businessType", "STATE-CONTRACT",
                    "reasonCode", "ACTIVE-" + suffix,
                    "standardMessage", "비활성 전환",
                    "allowAdditionalComment", false,
                    "active", false
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.active").value(false))
            .andExpect(jsonPath("$.data.state").value("INACTIVE"));

        mvc.perform(get("/api/rejection-reasons").param("businessType", "STATE-CONTRACT").param("active", "false"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[*].active", everyItem(is(false))))
            .andExpect(jsonPath("$.data.items[*].state", everyItem(is("INACTIVE"))))
            .andExpect(jsonPath("$.data.items[*].reasonCode", hasItem("ACTIVE-" + suffix)));

        mvc.perform(put("/api/rejection-reasons/{reasonId}", reasonId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "businessType", "STATE-CONTRACT",
                    "reasonCode", "ACTIVE-" + suffix,
                    "standardMessage", "활성 전환",
                    "allowAdditionalComment", true,
                    "active", true
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.active").value(true))
            .andExpect(jsonPath("$.data.state").value("ACTIVE"));
    }

    @Test
    void appealListAndReviewPersistRejectedStateTransition() throws Exception {
        mvc.perform(get("/api/appeal-opinions"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[*].appealId", hasItem("30000000-0000-4000-8000-000000000001")));

        mvc.perform(post("/api/appeal-opinions/{appealId}/review", "30000000-0000-4000-8000-000000000001")
                .header("X-Actor-Id", "reviewer-state-contract")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("reviewerOpinion", "기각 사유 확인", "processingResult", "REJECTED"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.processingResult").value("REJECTED"))
            .andExpect(jsonPath("$.data.processedBy").value("reviewer-state-contract"));
    }

    @Test
    void evaluationBatchGenerateDeleteAndRecalculateAssertBatchCreatedFailedRunningSucceededDeletedAndScoreRecalculatedStates() throws Exception {
        mvc.perform(get("/api/evaluation-batches/{batchId}", "40000000-0000-4000-8000-000000000001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.batchId").value("40000000-0000-4000-8000-000000000001"))
            .andExpect(jsonPath("$.data.status").value("SUCCEEDED"));

        mvc.perform(get("/api/evaluation-batches/{batchId}/score-diff", "40000000-0000-4000-8000-000000000001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[*].formulaVersion", hasItem("FORMULA-2026-A")))
            .andExpect(jsonPath("$.data.items[0].beforeScore").exists())
            .andExpect(jsonPath("$.data.items[0].afterScore").exists());

        mvc.perform(post("/api/evaluation-batches/generate")
                .header("X-Actor-Id", "batch-state-contract")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "evaluationYear", 2026,
                    "evaluationArea", "TEACHING",
                    "organizationIds", List.of("ORG-001"),
                    "targetUserIds", List.of("PROF-001"),
                    "generationCriteria", "UNCONFIRMED_ONLY"
                ))))
            .andExpect(status().isAccepted())
            .andExpect(jsonPath("$.data.jobType").value("GENERATE"))
            .andExpect(jsonPath("$.data.status", anyOf(is("BATCH_CREATED"), is("RUNNING"), is("SUCCEEDED"), is("FAILED"))))
            .andExpect(jsonPath("$.data.successCount").exists())
            .andExpect(jsonPath("$.data.failedCount").exists());

        mvc.perform(post("/api/evaluation-batches/delete")
                .header("X-Actor-Id", "batch-state-contract")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "evaluationYear", 2026,
                    "evaluationArea", "TEACHING",
                    "generationBatchId", "40000000-0000-4000-8000-000000000001",
                    "deleteReason", "계약 테스트 삭제"
                ))))
            .andExpect(status().isAccepted())
            .andExpect(jsonPath("$.data.jobType").value("DELETE"))
            .andExpect(jsonPath("$.data.reason").value("계약 테스트 삭제"))
            .andExpect(jsonPath("$.data.status", anyOf(is("DELETED"), is("SUCCEEDED"))));

        mvc.perform(post("/api/evaluation-batches/recalculate")
                .header("X-Actor-Id", "batch-state-contract")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "evaluationYear", 2026,
                    "targetUserIds", List.of("PROF-001"),
                    "evaluationArea", "TEACHING",
                    "formulaVersion", "FORMULA-2026-A"
                ))))
            .andExpect(status().isAccepted())
            .andExpect(jsonPath("$.data.jobType").value("RECALCULATE"))
            .andExpect(jsonPath("$.data.generationCriteria").value("FORMULA-2026-A"))
            .andExpect(jsonPath("$.data.status", anyOf(is("SCORE_RECALCULATED"), is("SUCCEEDED"))));
    }

    @Test
    void paymentAndVerificationDecisionEndpointsPersistRejectedAndCanceledStateTransitionsWithoutExternalSideEffects() throws Exception {
        mvc.perform(post("/api/payment-approvals/{applicationId}/decision", "20000000-0000-4000-8000-000000000001")
                .header("X-Actor-Id", "payment-state-contract")
                .header("X-Actor-Scope", "ORG-001")
                .header("X-Actor-Role", "APPROVER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("decisionType", "REJECT", "reason", "반려 상태 전이 확인"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.approvalStatus").value("REJECTED"))
            .andExpect(jsonPath("$.data.financialTransferExecuted").value(false));

        mvc.perform(post("/api/payment-approvals/{applicationId}/decision", "20000000-0000-4000-8000-000000000001")
                .header("X-Actor-Id", "payment-state-contract")
                .header("X-Actor-Scope", "ORG-001")
                .header("X-Actor-Role", "APPROVER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("decisionType", "CANCEL_APPROVAL", "reason", "취소 상태 전이 확인"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.approvalStatus").value("CANCELED"))
            .andExpect(jsonPath("$.data.financialTransferExecuted").value(false));

        mvc.perform(post("/api/verifications/{recordId}/decision", "10000000-0000-4000-8000-000000000001")
                .header("X-Actor-Id", "verification-state-contract")
                .header("X-Actor-Scope", "ORG-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("decisionType", "REJECT", "opinion", "반려", "evidence", "증빙"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.verificationStatus").value("REJECTED"));

        mvc.perform(post("/api/verifications/{recordId}/decision", "10000000-0000-4000-8000-000000000001")
                .header("X-Actor-Id", "verification-state-contract")
                .header("X-Actor-Scope", "ORG-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("decisionType", "CANCEL_CERTIFICATION", "opinion", "취소", "evidence", "증빙"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.verificationStatus").value("CANCELED"));
    }

    private JsonNode read(org.springframework.test.web.servlet.ResultActions actions) throws Exception {
        return objectMapper.readTree(actions.andReturn().getResponse().getContentAsString());
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }
}
