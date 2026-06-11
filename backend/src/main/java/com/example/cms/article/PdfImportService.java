package com.example.cms.article;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class PdfImportService {

    public PdfImportResult importPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return PdfImportResult.failure("PDF 파일을 선택해 주세요.");
        }
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!filename.endsWith(".pdf")) {
            return PdfImportResult.failure("PDF 파일만 임포트할 수 있습니다.");
        }
        try {
            byte[] bytes = file.getBytes();
            String probe = new String(bytes, 0, Math.min(bytes.length, 2048), StandardCharsets.ISO_8859_1).toLowerCase();
            if (probe.contains("/encrypt")) {
                return PdfImportResult.failure("암호화된 PDF는 변환할 수 없습니다.");
            }
            if (!probe.startsWith("%pdf")) {
                return PdfImportResult.failure("손상되었거나 지원하지 않는 PDF입니다.");
            }
            String originalName = file.getOriginalFilename() == null ? "import.pdf" : file.getOriginalFilename();
            String title = originalName.replaceFirst("(?i)\\.pdf$", "");
            return PdfImportResult.success(title, "# " + title + "\n\nPDF 임포트가 접수되었습니다. 원문 검수 후 본문을 보완해 주세요.");
        } catch (IOException ex) {
            return PdfImportResult.failure("PDF 파일을 읽는 중 오류가 발생했습니다.");
        }
    }

    public record PdfImportResult(boolean success, String title, String markdown, String message) {
        public static PdfImportResult success(String title, String markdown) {
            return new PdfImportResult(true, title, markdown, null);
        }

        public static PdfImportResult failure(String message) {
            return new PdfImportResult(false, null, null, message);
        }
    }
}
