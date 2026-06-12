package com.example.cms.article;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PdfImportServiceTest {
    private final PdfImportService service = new PdfImportService();

    @Test
    void importsNormalPdfAsMarkdownStub() {
        MockMultipartFile file = new MockMultipartFile("file", "guide.pdf", "application/pdf", "pdf".getBytes());

        PdfImportService.PdfImportResult result = service.importPdf(file);

        assertThat(result.title()).isEqualTo("guide");
        assertThat(result.markdown()).contains("# guide");
    }

    @Test
    void returnsControlledEncryptedPdfError() {
        MockMultipartFile file = new MockMultipartFile("file", "encrypted-guide.pdf", "application/pdf", "pdf".getBytes());

        assertThatThrownBy(() -> service.importPdf(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("암호화");
    }
}
