package com.example.cms.article;

import com.example.cms.article.dto.ArticleDetailResponse;
import com.example.cms.article.dto.ArticleSummaryResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PortalArticleService {
    private final ArticleMapper articleMapper;

    public PortalArticleService(ArticleMapper articleMapper) {
        this.articleMapper = articleMapper;
    }

    public List<ArticleSummaryResponse> list(Long folderId) {
        if (folderId == null) {
            throw new IllegalArgumentException("폴더를 선택해 주세요.");
        }
        return articleMapper.listPortalByFolder(folderId).stream().map(ArticleSummaryResponse::from).toList();
    }

    public ArticleDetailResponse detail(Long articleId) {
        Article article = articleMapper.findPublished(articleId);
        if (article == null) {
            throw new IllegalArgumentException("문서를 찾을 수 없거나 열람 권한이 없습니다.");
        }
        return ArticleDetailResponse.from(article);
    }
}
