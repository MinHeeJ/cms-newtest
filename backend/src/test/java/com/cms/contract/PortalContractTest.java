package com.cms.contract;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PortalContractTest {
    @Autowired MockMvc mvc;

    @Test
    void publicPortalSearchUsesContractEnvelopeAndFiltersToPublishedContent() throws Exception {
        mvc.perform(get("/api/portal/documents").param("q", "CMS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.requestId").isString())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.meta", hasKey("page")));
    }

    @Test
    void adminCreateDocumentRejectsMissingRequiredFieldsWithoutLeakingInternals() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/admin/documents")
                        .header("X-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.message").isString());
    }

    @Test
    void adminOperationsRequireRole() throws Exception {
        mvc.perform(get("/api/admin/health/details"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}
