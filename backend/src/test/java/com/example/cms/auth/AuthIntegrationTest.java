package com.example.cms.auth;

import com.example.cms.auth.dto.LoginRequest;
import com.example.cms.config.CmsProperties;
import com.example.cms.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthIntegrationTest {

    @Test
    void loginIssuesAdminTokenAndContext() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        AuthService authService = new AuthService(tokenProvider(), encoder);

        var response = authService.login(new LoginRequest("admin", "admin123"), encoder);

        assertThat(response.token()).isNotBlank();
        assertThat(response.profile().adminAccess()).isTrue();
        assertThat(authService.profile("user", "USER").defaultPath()).isEqualTo("/portal");
    }

    @Test
    void loginRejectsInvalidCredentials() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        AuthService authService = new AuthService(tokenProvider(), encoder);

        assertThatThrownBy(() -> authService.login(new LoginRequest("admin", "bad"), encoder))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("올바르지");
    }

    private JwtTokenProvider tokenProvider() {
        CmsProperties properties = new CmsProperties();
        properties.getJwt().setSecret("Abc123Abc123Abc123Abc123Abc12399");
        return new JwtTokenProvider(properties);
    }
}
