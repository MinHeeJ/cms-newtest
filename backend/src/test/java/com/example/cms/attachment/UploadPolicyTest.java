package com.example.cms.attachment;

import com.example.cms.config.CmsProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UploadPolicyTest {
    @Test
    void rejectsPathTraversalFilename() {
        UploadPolicy policy = new UploadPolicy(new CmsProperties());

        assertThatThrownBy(() -> policy.safeOriginalName("../secret.pdf"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("경로");
    }

    @Test
    void returnsAllowedExtension() {
        UploadPolicy policy = new UploadPolicy(new CmsProperties());
        MockMultipartFile file = new MockMultipartFile("files", "manual.pdf", "application/pdf", "x".getBytes());

        assertThat(policy.validate(file)).isEqualTo("pdf");
    }

    @Test
    void rejectsFileOverConfiguredLimit() {
        CmsProperties properties = new CmsProperties();
        properties.getUpload().setMaxFileSizeBytes(1);
        UploadPolicy policy = new UploadPolicy(properties);
        MockMultipartFile file = new MockMultipartFile("files", "manual.pdf", "application/pdf", "xx".getBytes());

        assertThatThrownBy(() -> policy.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10MB");
    }
}
