package com.example.cms.article;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;

class PdfImportServiceTest {

    private final PdfImportService service = new PdfImportService();

    @Test
    void importsValidPdfStub() {
        MockMultipartFile file = new MockMultipartFile("file", "guide.pdf", "application/pdf", "%PDF-1.7".getBytes());

        PdfImportService.PdfImportResult result = service.importPdf(file);

        assertThat(result.success()).isTrue();
        assertThat(result.markdown()).contains("guide");
    }

    @Test
    void reportsEncryptedPdf() {
        MockMultipartFile file = new MockMultipartFile("file", "locked.pdf", "application/pdf", "%PDF /Encrypt".getBytes());

        PdfImportService.PdfImportResult result = service.importPdf(file);

        assertThat(result.success()).isFalse();
        assertThat(result.message()).contains("암호화");
    }
}
