package com.example.cms.security;

import com.example.cms.config.CmsProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtPropertiesValidatorTest {
    @Test
    void rejectsNonAlphanumericSecret() {
        CmsProperties properties = new CmsProperties();
        JwtPropertiesValidator validator = new JwtPropertiesValidator(properties);

        assertThatThrownBy(() -> validator.validate("abc-123-INVALID-SECRET-1234567890"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("only English letters and numbers");
    }

    @Test
    void rejectsShortSecret() {
        CmsProperties properties = new CmsProperties();
        JwtPropertiesValidator validator = new JwtPropertiesValidator(properties);

        assertThatThrownBy(() -> validator.validate("ShortSecret123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at least 32");
    }
}
