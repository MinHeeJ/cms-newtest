package com.example.cms.security;

import com.example.cms.config.CmsProperties;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

@Component
public class JwtPropertiesValidator implements InitializingBean {
    private final CmsProperties properties;

    public JwtPropertiesValidator(CmsProperties properties) {
        this.properties = properties;
    }

    @Override
    public void afterPropertiesSet() {
        validate(properties.getJwt().getSecret());
    }

    public void validate(String secret) {
        if (secret == null || !secret.matches("[A-Za-z0-9]+")) {
            throw new IllegalArgumentException("JWT secret must contain only English letters and numbers.");
        }
        if (secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters for HS256.");
        }
    }
}
