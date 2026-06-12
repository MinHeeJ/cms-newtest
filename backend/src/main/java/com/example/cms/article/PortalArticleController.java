package com.example.cms.article;

import com.example.cms.article.dto.ArticleDetailResponse;
import com.example.cms.article.dto.ArticleSummaryResponse;
import com.example.cms.common.ApiResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/portal/articles")
public class PortalArticleController {
    private final PortalArticleService articleService;

    public PortalArticleController(PortalArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ApiResponse<List<ArticleSummaryResponse>> list(@RequestParam Long folderId) {
        return ApiResponse.ok(articleService.list(folderId));
    }

    @GetMapping("/{articleId}")
    public ApiResponse<ArticleDetailResponse> detail(@PathVariable Long articleId) {
        return ApiResponse.ok(articleService.detail(articleId));
    }
}
