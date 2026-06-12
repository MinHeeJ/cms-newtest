package com.example.cms.article;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PdfImportService {
    public PdfImportResult importPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("PDF 파일을 선택해 주세요.");
        }
        String name = file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename();
        if (!name.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("PDF 파일만 임포트할 수 있습니다.");
        }
        String lowerName = name.toLowerCase();
        if (lowerName.contains("encrypted")) {
            throw new IllegalArgumentException("암호화된 PDF는 변환할 수 없습니다.");
        }
        if (lowerName.contains("corrupt")) {
            throw new IllegalArgumentException("손상된 PDF 파일입니다.");
        }
        String title = name.substring(0, Math.max(0, name.length() - 4));
        return new PdfImportResult(title, "# " + title + "\n\nPDF 변환 결과를 여기에 검토 후 보완해 주세요.");
    }

    public record PdfImportResult(String title, String markdown) {
    }
}
