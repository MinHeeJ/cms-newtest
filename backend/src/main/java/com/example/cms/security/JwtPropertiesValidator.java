package com.example.cms.security;

import com.example.cms.config.CmsProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class JwtPropertiesValidator {

    private static final Pattern ALPHANUMERIC = Pattern.compile("^[A-Za-z0-9]+$");
    private final CmsProperties properties;

    public JwtPropertiesValidator(CmsProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    public void validateConfiguredSecret() {
        validate(properties.getJwt().getSecret());
    }

    public void validate(String secret) {
        if (secret == null || secret.length() < 32 || !ALPHANUMERIC.matcher(secret).matches()) {
            throw new IllegalStateException("JWT secret must be alphanumeric and at least 32 characters long");
        }
    }
}
