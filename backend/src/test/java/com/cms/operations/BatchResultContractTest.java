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
class BatchResultContractTest {
    @Autowired MockMvc mvc;

    @Test void listBatchResultsIsReadOnlyAndValidatesCountInvariant() throws Exception {
        mvc.perform(get("/api/batch-results").param("evaluationYear", "2026"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[0].totalCount").value(3))
            .andExpect(jsonPath("$.data.items[0].countInvariantValid").value(true))
            .andExpect(jsonPath("$.data.items[0].errorDetails[0].errorCode").exists());
    }

    @Test void healthUsesApiResponseEnvelope() throws Exception {
        mvc.perform(get("/api/health"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").value("UP"));
    }
}
