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
class VerificationControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test void openApiFixtureIsAvailableOnClasspath() { assertThat(new ClassPathResource("contracts/openapi.yaml").exists()).isTrue(); }

    @Test void listVerificationsReturnsOnlyActorScopeRecords() throws Exception {
        mvc.perform(get("/api/verifications").header("X-Actor-Scope", "ORG-001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.items[0].organizationId").value("ORG-001"));
    }

    @Test void decideVerificationPersistsOpinionEvidenceAndRejectsOutOfScope() throws Exception {
        mvc.perform(post("/api/verifications/10000000-0000-4000-8000-000000000001/decision")
                .header("X-Actor-Id", "staff-01").header("X-Actor-Scope", "ORG-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("decisionType", "CERTIFY", "opinion", "근거 확인", "evidence", "증빙 PDF"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.verificationStatus").value("CERTIFIED"))
            .andExpect(jsonPath("$.data.opinion").value("근거 확인"))
            .andExpect(jsonPath("$.data.evidence").value("증빙 PDF"));

        mvc.perform(post("/api/verifications/10000000-0000-4000-8000-000000000002/decision")
                .header("X-Actor-Scope", "ORG-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("decisionType", "CERTIFY", "opinion", "범위 밖", "evidence", "증빙"))))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error.code").value("PERMISSION_DENIED"));
    }

    @Test void decideVerificationRequiresOpinionAndEvidence() throws Exception {
        mvc.perform(post("/api/verifications/10000000-0000-4000-8000-000000000001/decision")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("decisionType", "REJECT"))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }
}
