package com.example.cms.security;

import com.example.cms.config.CmsProperties;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    @Test
    void createsAndParsesRoleAuthority() {
        CmsProperties properties = new CmsProperties();
        properties.getJwt().setSecret("Abc123Abc123Abc123Abc123Abc12399");
        JwtTokenProvider provider = new JwtTokenProvider(properties);

        String token = provider.createToken("admin", "ADMIN");
        Authentication authentication = provider.authentication(token);

        assertThat(provider.isValid(token)).isTrue();
        assertThat(authentication.getName()).isEqualTo("admin");
        assertThat(authentication.getAuthorities()).extracting("authority").contains("ROLE_ADMIN");
    }
}
