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
class FinalEvaluationControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test void listConfirmAndCancelFinalEvaluationPreservesScoreAndAudit() throws Exception {
        mvc.perform(get("/api/final-evaluations").header("X-Actor-Scope", "ORG-001"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.items[0].finalScore").value(92.5));

        mvc.perform(post("/api/final-evaluations/50000000-0000-4000-8000-000000000001/confirm")
                .header("X-Actor-Role", "COLLEGE_MANAGER").header("X-Actor-Scope", "ORG-001").header("X-Actor-Id", "manager-01"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.confirmationStatus").value("CONFIRMED"))
            .andExpect(jsonPath("$.data.finalScore").value(92.5));

        mvc.perform(post("/api/final-evaluations/50000000-0000-4000-8000-000000000001/cancel")
                .header("X-Actor-Role", "CANCEL_MANAGER").header("X-Actor-Scope", "ORG-001").header("X-Actor-Id", "cancel-01")
                .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(Map.of("cancelReason", "위원회 재검토"))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.confirmationStatus").value("CANCELED"))
            .andExpect(jsonPath("$.data.cancelReason").value("위원회 재검토"));
    }

    @Test void finalEvaluationActionsRejectMissingRoleOrCancelReason() throws Exception {
        mvc.perform(post("/api/final-evaluations/50000000-0000-4000-8000-000000000002/confirm").header("X-Actor-Role", "STAFF"))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/final-evaluations/50000000-0000-4000-8000-000000000001/cancel")
                .header("X-Actor-Role", "CANCEL_MANAGER").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isBadRequest());
    }
}
