package com.example.cms.article;

import com.example.cms.article.dto.ArticleDetailResponse;
import com.example.cms.article.dto.ArticleMoveRequest;
import com.example.cms.article.dto.ArticleSortRequest;
import com.example.cms.article.dto.ArticleSummaryResponse;
import com.example.cms.article.dto.ArticleUpsertRequest;
import com.example.cms.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/articles")
public class AdminArticleController {
    private final AdminArticleService articleService;
    private final PdfImportService pdfImportService;

    public AdminArticleController(AdminArticleService articleService, PdfImportService pdfImportService) {
        this.articleService = articleService;
        this.pdfImportService = pdfImportService;
    }

    @GetMapping
    public ApiResponse<List<ArticleSummaryResponse>> list(@RequestParam(required = false) Long folderId) {
        return ApiResponse.ok(articleService.list(folderId));
    }

    @GetMapping("/{id}")
    public ApiResponse<ArticleDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(articleService.detail(id));
    }

    @PostMapping
    public ApiResponse<ArticleDetailResponse> create(@Valid @RequestBody ArticleUpsertRequest request) {
        return ApiResponse.ok(articleService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ArticleDetailResponse> update(@PathVariable Long id, @Valid @RequestBody ArticleUpsertRequest request) {
        return ApiResponse.ok(articleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return ApiResponse.ok();
    }

    @PatchMapping("/{id}/move")
    public ApiResponse<ArticleDetailResponse> move(@PathVariable Long id, @Valid @RequestBody ArticleMoveRequest request) {
        return ApiResponse.ok(articleService.move(id, request));
    }

    @PutMapping("/sort")
    public ApiResponse<Void> sort(@Valid @RequestBody ArticleSortRequest request) {
        articleService.sort(request);
        return ApiResponse.ok();
    }

    @PatchMapping("/{id}/publish")
    public ApiResponse<ArticleDetailResponse> publish(@PathVariable Long id) {
        return ApiResponse.ok(articleService.publish(id));
    }

    @PatchMapping("/{id}/unpublish")
    public ApiResponse<ArticleDetailResponse> unpublish(@PathVariable Long id) {
        return ApiResponse.ok(articleService.unpublish(id));
    }

    @PostMapping(value = "/import-pdf", consumes = "multipart/form-data")
    public ApiResponse<PdfImportService.PdfImportResult> importPdf(@org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ApiResponse.ok(pdfImportService.importPdf(file));
    }
}
