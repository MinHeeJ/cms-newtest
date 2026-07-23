package com.cms.operations;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PaymentApprovalControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test void listPaymentApprovalsShowsAmountsMaskedAccountAndLinkedAchievement() throws Exception {
        mvc.perform(get("/api/payment-approvals").header("X-Actor-Scope", "ORG-001").header("X-Actor-Role", "APPROVER"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[0].requestedAmount").exists())
            .andExpect(jsonPath("$.data.items[0].maskedAccount").value("국민 ****-**-1234"))
            .andExpect(jsonPath("$.data.items[0].linkedAchievement").exists());
    }

    @Test void decidePaymentApprovalChangesStatusAndDoesNotExposeFinancialTransferSideEffect() throws Exception {
        mvc.perform(post("/api/payment-approvals/20000000-0000-4000-8000-000000000001/decision")
                .header("X-Actor-Id", "approver-01").header("X-Actor-Scope", "ORG-001").header("X-Actor-Role", "APPROVER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("decisionType", "APPROVE", "reason", "지급 요건 충족"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.approvalStatus").value("APPROVED"))
            .andExpect(jsonPath("$.data.financialTransferExecuted").value(false))
            .andExpect(jsonPath("$.data.processedBy").value("approver-01"));
    }

    @Test void decidePaymentApprovalRejectsActorWithoutApprovalRoleOrScope() throws Exception {
        mvc.perform(post("/api/payment-approvals/20000000-0000-4000-8000-000000000002/decision")
                .header("X-Actor-Scope", "ORG-001").header("X-Actor-Role", "STAFF")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("decisionType", "APPROVE", "reason", "권한 없음"))))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error.message").value("권한 또는 데이터 범위가 없습니다."));
    }
}
