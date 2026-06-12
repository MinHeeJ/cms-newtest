package com.example.cms.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cms")
public class CmsProperties {
    private Jwt jwt = new Jwt();
    private Upload upload = new Upload();

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Upload getUpload() {
        return upload;
    }

    public void setUpload(Upload upload) {
        this.upload = upload;
    }

    public static class Jwt {
        private String secret = "ChangeMeJwtSecret1234567890ABCDEF";
        private long expirationMinutes = 120;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMinutes() {
            return expirationMinutes;
        }

        public void setExpirationMinutes(long expirationMinutes) {
            this.expirationMinutes = expirationMinutes;
        }
    }

    public static class Upload {
        private String basePath = "/app/uploads";
        private long maxFileSizeBytes = 10 * 1024 * 1024L;
        private long maxRequestSizeBytes = 20 * 1024 * 1024L;
        private List<String> allowedExtensions = new ArrayList<>(Arrays.asList(
                "jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "md", "zip"));

        public String getBasePath() {
            return basePath;
        }

        public void setBasePath(String basePath) {
            this.basePath = basePath;
        }

        public long getMaxFileSizeBytes() {
            return maxFileSizeBytes;
        }

        public void setMaxFileSizeBytes(long maxFileSizeBytes) {
            this.maxFileSizeBytes = maxFileSizeBytes;
        }

        public long getMaxRequestSizeBytes() {
            return maxRequestSizeBytes;
        }

        public void setMaxRequestSizeBytes(long maxRequestSizeBytes) {
            this.maxRequestSizeBytes = maxRequestSizeBytes;
        }

        public List<String> getAllowedExtensions() {
            return allowedExtensions;
        }

        public void setAllowedExtensions(List<String> allowedExtensions) {
            this.allowedExtensions = allowedExtensions;
        }
    }
}
