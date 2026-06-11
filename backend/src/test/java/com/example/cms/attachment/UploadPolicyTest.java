package com.example.cms.attachment;

import com.example.cms.config.CmsProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UploadPolicyTest {

    @Test
    void rejectsPathTraversalFilename() {
        UploadPolicy policy = new UploadPolicy(properties());
        MockMultipartFile file = new MockMultipartFile("file", "../secret.pdf", "application/pdf", "%PDF".getBytes());

        assertThatThrownBy(() -> policy.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("파일명");
    }

    @Test
    void resolvesStorageKeyInsideBasePath() {
        UploadPolicy policy = new UploadPolicy(properties());

        assertThat(policy.resolveStorageKey("2026/06/file.pdf").toString()).contains("uploads");
        assertThatThrownBy(() -> policy.resolveStorageKey("../file.pdf"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("저장 경로");
    }

    private CmsProperties properties() {
        CmsProperties properties = new CmsProperties();
        properties.getUpload().setBasePath("uploads");
        return properties;
    }
}
