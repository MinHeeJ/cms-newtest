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
class AppealOpinionControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test void reviewAppealOpinionStoresReviewerOpinionResultAndTimestampOnSameAppeal() throws Exception {
        mvc.perform(post("/api/appeal-opinions/30000000-0000-4000-8000-000000000001/review")
                .header("X-Actor-Id", "reviewer-01")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reviewerOpinion", "일부 인정합니다.", "processingResult", "PARTIAL"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.appealId").value("30000000-0000-4000-8000-000000000001"))
            .andExpect(jsonPath("$.data.reviewerOpinion").value("일부 인정합니다."))
            .andExpect(jsonPath("$.data.processingResult").value("PARTIAL"))
            .andExpect(jsonPath("$.data.processedAt").exists());
    }

    @Test void reviewAppealOpinionRejectsMissingReviewerOpinion() throws Exception {
        mvc.perform(post("/api/appeal-opinions/30000000-0000-4000-8000-000000000001/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("processingResult", "ACCEPTED"))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }
}
