package com.example.cms.security;

import com.example.cms.config.CmsProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtPropertiesValidatorTest {

    @Test
    void rejectsNonAlphanumericSecret() {
        CmsProperties properties = new CmsProperties();
        JwtPropertiesValidator validator = new JwtPropertiesValidator(properties);

        assertThatThrownBy(() -> validator.validate("abc-123-not-valid-because-symbols"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("alphanumeric");
    }

    @Test
    void acceptsLongAlphanumericSecret() {
        CmsProperties properties = new CmsProperties();
        JwtPropertiesValidator validator = new JwtPropertiesValidator(properties);

        assertThatCode(() -> validator.validate("Abc123Abc123Abc123Abc123Abc12399"))
                .doesNotThrowAnyException();
    }
}
