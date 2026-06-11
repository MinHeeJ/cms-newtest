package com.example.cms.article;

import com.example.cms.article.dto.ArticleDetailResponse;
import com.example.cms.article.dto.ArticleMoveRequest;
import com.example.cms.article.dto.ArticleRequest;
import com.example.cms.article.dto.ArticleStatusRequest;
import com.example.cms.article.dto.ArticleSummaryResponse;
import com.example.cms.common.ApiResponse;
import com.example.cms.folder.dto.SortRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/articles")
public class AdminArticleController {

    private final AdminArticleService articleService;

    public AdminArticleController(AdminArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ApiResponse<List<ArticleSummaryResponse>> list() {
        return ApiResponse.ok(articleService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<ArticleDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(articleService.detail(id));
    }

    @PostMapping
    public ApiResponse<ArticleDetailResponse> create(@Valid @RequestBody ArticleRequest request, Authentication authentication) {
        return ApiResponse.ok(articleService.create(request, authentication.getName()), "문서가 생성되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<ArticleDetailResponse> update(@PathVariable Long id, @Valid @RequestBody ArticleRequest request) {
        return ApiResponse.ok(articleService.update(id, request), "문서가 수정되었습니다.");
    }

    @PatchMapping("/{id}/move")
    public ApiResponse<ArticleDetailResponse> move(@PathVariable Long id, @Valid @RequestBody ArticleMoveRequest request) {
        return ApiResponse.ok(articleService.move(id, request), "문서가 이동되었습니다.");
    }

    @PatchMapping("/{id}/sort")
    public ApiResponse<ArticleDetailResponse> sort(@PathVariable Long id, @Valid @RequestBody SortRequest request) {
        return ApiResponse.ok(articleService.sort(id, request.sortOrder()), "정렬 순서가 변경되었습니다.");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ArticleDetailResponse> status(@PathVariable Long id, @Valid @RequestBody ArticleStatusRequest request) {
        return ApiResponse.ok(articleService.changeStatus(id, request.status()), "문서 상태가 변경되었습니다.");
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<ArticleDetailResponse> publish(@PathVariable Long id) {
        return ApiResponse.ok(articleService.changeStatus(id, ArticleStatus.PUBLISHED), "문서가 발행되었습니다.");
    }

    @PostMapping("/{id}/unpublish")
    public ApiResponse<ArticleDetailResponse> unpublish(@PathVariable Long id) {
        return ApiResponse.ok(articleService.changeStatus(id, ArticleStatus.UNPUBLISHED), "문서가 게시중단되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return ApiResponse.ok(null, "문서가 삭제되었습니다.");
    }
}
