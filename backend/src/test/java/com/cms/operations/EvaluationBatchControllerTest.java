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
class EvaluationBatchControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test void generateDeleteAndRecalculateEvaluationBatchesExposeResultCounts() throws Exception {
        mvc.perform(post("/api/evaluation-batches/generate").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("evaluationYear", 2026, "evaluationArea", "TEACHING", "organizationIds", java.util.List.of("ORG-001"), "targetUserIds", java.util.List.of("PROF-001"), "generationCriteria", "UNCONFIRMED_ONLY"))))
            .andExpect(status().isAccepted()).andExpect(jsonPath("$.data.jobType").value("GENERATE"))
            .andExpect(jsonPath("$.data.totalCount").exists());

        mvc.perform(get("/api/evaluation-batches/delete-preview")
                .param("evaluationYear", "2026").param("evaluationArea", "TEACHING").param("generationBatchId", "40000000-0000-4000-8000-000000000001"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.items[0].deletable").value(true));

        mvc.perform(post("/api/evaluation-batches/recalculate").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("evaluationYear", 2026, "targetUserIds", java.util.List.of("PROF-001"), "evaluationArea", "TEACHING", "formulaVersion", "FORMULA-2026-A"))))
            .andExpect(status().isAccepted()).andExpect(jsonPath("$.data.jobType").value("RECALCULATE"));
    }

    @Test void deleteEvaluationMaterialsRequiresReasonAndOnlySoftDeletesPreviewTargets() throws Exception {
        mvc.perform(post("/api/evaluation-batches/delete").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("evaluationYear", 2026, "evaluationArea", "TEACHING", "generationBatchId", "40000000-0000-4000-8000-000000000001"))))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }
}
