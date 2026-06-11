package com.example.cms.article;

import com.example.cms.article.dto.ArticleDetailResponse;
import com.example.cms.article.dto.ArticleMoveRequest;
import com.example.cms.article.dto.ArticleRequest;
import com.example.cms.article.dto.ArticleSummaryResponse;
import com.example.cms.folder.Folder;
import com.example.cms.folder.FolderMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public List<ArticleSummaryResponse> list() {
        return articleMapper.findAllAdmin().stream().map(ArticleSummaryResponse::from).toList();
    }

    public ArticleDetailResponse detail(Long id) {
        return ArticleDetailResponse.from(requireArticle(id));
    }

    @Transactional
    public ArticleDetailResponse create(ArticleRequest request, String username) {
        requireFolder(request.folderId());
        Article article = new Article();
        article.setFolderId(request.folderId());
        article.setTitle(request.title());
        article.setBodyMarkdown(request.bodyMarkdown());
        article.setStatus(ArticleStatus.DRAFT);
        article.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        article.setAuthorName(username);
        articleMapper.insert(article);
        return ArticleDetailResponse.from(requireArticle(article.getId()));
    }

    @Transactional
    public ArticleDetailResponse update(Long id, ArticleRequest request) {
        Article article = requireArticle(id);
        requireFolder(request.folderId());
        article.setFolderId(request.folderId());
        article.setTitle(request.title());
        article.setBodyMarkdown(request.bodyMarkdown());
        article.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        articleMapper.update(article);
        return ArticleDetailResponse.from(requireArticle(id));
    }

    @Transactional
    public void delete(Long id) {
        requireArticle(id);
        articleMapper.softDelete(id);
    }

    @Transactional
    public ArticleDetailResponse move(Long id, ArticleMoveRequest request) {
        requireArticle(id);
        requireFolder(request.folderId());
        articleMapper.move(id, request.folderId(), request.sortOrder() == null ? 0 : request.sortOrder());
        return ArticleDetailResponse.from(requireArticle(id));
    }

    @Transactional
    public ArticleDetailResponse sort(Long id, Integer sortOrder) {
        requireArticle(id);
        articleMapper.sort(id, sortOrder);
        return ArticleDetailResponse.from(requireArticle(id));
    }

    @Transactional
    public ArticleDetailResponse changeStatus(Long id, ArticleStatus nextStatus) {
        Article article = requireArticle(id);
        statePolicy.validateTransition(article.getStatus(), nextStatus);
        articleMapper.updateStatus(id, nextStatus);
        return ArticleDetailResponse.from(requireArticle(id));
    }

    private Article requireArticle(Long id) {
        Article article = articleMapper.findById(id);
        if (article == null) {
            throw new IllegalArgumentException("문서를 찾을 수 없습니다.");
        }
        return article;
    }

    private void requireFolder(Long folderId) {
        Folder folder = folderMapper.findById(folderId);
        if (folder == null) {
            throw new IllegalArgumentException("폴더를 찾을 수 없습니다.");
        }
    }
}
