package com.example.cms.auth;

import com.example.cms.auth.dto.LoginRequest;
import com.example.cms.auth.dto.LoginResponse;
import com.example.cms.auth.dto.UserRoleProfile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({AuthController.class, ScreenContextController.class})
@AutoConfigureMockMvc(addFilters = false)
class AuthIntegrationTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    AuthService authService;

    @Test
    void loginReturnsTokenAndScreenContext() throws Exception {
        UserRoleProfile profile = UserRoleProfile.of("admin", "CMS 관리자", "ADMIN");
        when(authService.login(any(LoginRequest.class))).thenReturn(new LoginResponse("token", profile));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin", "admin123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", is("token")))
                .andExpect(jsonPath("$.data.profile.defaultRoute", is("/admin")));
    }

    @Test
    void screenContextReturnsRoleProfile() throws Exception {
        when(authService.screenContext(any(Authentication.class)))
                .thenReturn(UserRoleProfile.of("user", "포털 사용자", "USER"));

        mockMvc.perform(get("/api/v1/me/screen-context").principal(() -> "user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.adminAccess", is(false)))
                .andExpect(jsonPath("$.data.portalAccess", is(true)));
    }
}
