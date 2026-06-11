package com.example.cms.article;

import com.example.cms.article.dto.ArticleDetailResponse;
import com.example.cms.article.dto.ArticleSummaryResponse;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return articleMapper.findPublishedByFolder(folderId).stream()
                .map(ArticleSummaryResponse::from)
                .toList();
    }

    public ArticleDetailResponse detail(Long id) {
        Article article = articleMapper.findPublishedById(id);
        if (article == null) {
            throw new IllegalArgumentException("게시 문서를 찾을 수 없습니다.");
        }
        return ArticleDetailResponse.from(article);
    }
}
