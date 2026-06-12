package com.example.cms.article;

import com.example.cms.article.dto.ArticleDetailResponse;
import com.example.cms.article.dto.ArticleMoveRequest;
import com.example.cms.article.dto.ArticleSortRequest;
import com.example.cms.article.dto.ArticleSummaryResponse;
import com.example.cms.article.dto.ArticleUpsertRequest;
import com.example.cms.folder.FolderMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminArticleService {
    private final ArticleMapper articleMapper;
    private final FolderMapper folderMapper;
    private final ArticleStatePolicy statePolicy;

    public AdminArticleService(ArticleMapper articleMapper, FolderMapper folderMapper, ArticleStatePolicy statePolicy) {
        this.articleMapper = articleMapper;
        this.folderMapper = folderMapper;
        this.statePolicy = statePolicy;
    }

    public List<ArticleSummaryResponse> list(Long folderId) {
        return articleMapper.listAdmin(folderId).stream().map(ArticleSummaryResponse::from).toList();
    }

    public ArticleDetailResponse detail(Long id) {
        return ArticleDetailResponse.from(required(id));
    }

    @Transactional
    public ArticleDetailResponse create(ArticleUpsertRequest request) {
        assertFolderExists(request.folderId());
        Article article = new Article();
        article.setFolderId(request.folderId());
        article.setTitle(request.title());
        article.setBody(request.body());
        article.setStatus(ArticleStatus.DRAFT.name());
        article.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        articleMapper.insertArticle(article);
        return ArticleDetailResponse.from(articleMapper.findNotDeleted(article.getId()));
    }

    @Transactional
    public ArticleDetailResponse update(Long id, ArticleUpsertRequest request) {
        Article article = required(id);
        assertFolderExists(request.folderId());
        article.setFolderId(request.folderId());
        article.setTitle(request.title());
        article.setBody(request.body());
        article.setSortOrder(request.sortOrder() == null ? article.getSortOrder() : request.sortOrder());
        articleMapper.updateArticle(article);
        return ArticleDetailResponse.from(articleMapper.findNotDeleted(id));
    }

    @Transactional
    public void delete(Long id) {
        required(id);
        articleMapper.markDeleted(id);
    }

    @Transactional
    public ArticleDetailResponse move(Long id, ArticleMoveRequest request) {
        required(id);
        assertFolderExists(request.folderId());
        articleMapper.move(id, request.folderId());
        return ArticleDetailResponse.from(articleMapper.findNotDeleted(id));
    }

    @Transactional
    public void sort(ArticleSortRequest request) {
        int order = 0;
        for (Long id : request.orderedIds()) {
            required(id);
            articleMapper.updateSortOrder(id, order++);
        }
    }

    @Transactional
    public ArticleDetailResponse publish(Long id) {
        Article article = required(id);
        statePolicy.assertTransition(article.getStatus(), ArticleStatus.PUBLISHED);
        articleMapper.updateStatus(id, ArticleStatus.PUBLISHED.name());
        return ArticleDetailResponse.from(articleMapper.findNotDeleted(id));
    }

    @Transactional
    public ArticleDetailResponse unpublish(Long id) {
        Article article = required(id);
        statePolicy.assertTransition(article.getStatus(), ArticleStatus.UNPUBLISHED);
        articleMapper.updateStatus(id, ArticleStatus.UNPUBLISHED.name());
        return ArticleDetailResponse.from(articleMapper.findNotDeleted(id));
    }

    private Article required(Long id) {
        Article article = articleMapper.findNotDeleted(id);
        if (article == null) {
            throw new IllegalArgumentException("문서를 찾을 수 없습니다.");
        }
        return article;
    }

    private void assertFolderExists(Long folderId) {
        if (folderMapper.findNotDeleted(folderId) == null) {
            throw new IllegalArgumentException("폴더를 찾을 수 없습니다.");
        }
    }
}
