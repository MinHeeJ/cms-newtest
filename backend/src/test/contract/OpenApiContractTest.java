package com.cmsnew.community.contract;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

class OpenApiContractTest {
    @Test
    void contractContainsCoreCommunityEndpoints() throws IOException {
        String contract = Files.readString(resolveContractPath());

        assertThat(contract).contains("/api/v1/auth/register");
        assertThat(contract).contains("/api/v1/boards/{boardId}/posts");
        assertThat(contract).contains("/api/v1/posts/{postId}/comments");
        assertThat(contract).contains("/api/v1/posts/{postId}/reactions");
        assertThat(contract).contains("/api/v1/search");
        assertThat(contract).contains("/api/v1/notifications");
        assertThat(contract).contains("/api/v1/reports");
        assertThat(contract).contains("/api/v1/admin/reports/{reportId}/actions");
    }

    @Test
    void contractDocumentsSharedErrorEnvelope() throws IOException {
        String contract = Files.readString(resolveContractPath());

        assertThat(contract).contains("ErrorResponse:");
        assertThat(contract).contains("fieldErrors:");
        assertThat(contract).contains("Unauthorized:");
        assertThat(contract).contains("Forbidden:");
        assertThat(contract).contains("Conflict:");
    }

    private Path resolveContractPath() {
        Path fromBackend = Path.of("../docs/contracts/openapi.yaml");
        if (Files.exists(fromBackend)) {
            return fromBackend;
        }
        return Path.of("docs/contracts/openapi.yaml");
    }
}
