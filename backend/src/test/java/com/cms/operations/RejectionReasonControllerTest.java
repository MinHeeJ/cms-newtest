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
class RejectionReasonControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test void listCreateAndUpdateRejectionReasonByBusinessType() throws Exception {
        mvc.perform(get("/api/rejection-reasons").param("businessType", "VERIFICATION"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[0].businessType").value("VERIFICATION"));

        String created = mvc.perform(post("/api/rejection-reasons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("businessType", "PAYMENT", "reasonCode", "PAY-DOC", "standardMessage", "계좌 증빙 보완", "allowAdditionalComment", true))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.allowAdditionalComment").value(true))
            .andReturn().getResponse().getContentAsString();
        assertThat(created).contains("PAY-DOC");
    }

    @Test void createRejectionReasonRejectsDuplicateBusinessTypeCode() throws Exception {
        Map<String,Object> body = Map.of("businessType", "VERIFICATION", "reasonCode", "VERIFY-DOC", "standardMessage", "중복", "allowAdditionalComment", true);
        mvc.perform(post("/api/rejection-reasons").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error.code").value("CONFLICT"));
    }
}
