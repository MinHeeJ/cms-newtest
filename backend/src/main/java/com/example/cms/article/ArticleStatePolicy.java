package com.example.cms.article;

import org.springframework.stereotype.Component;

@Component
public class ArticleStatePolicy {

    public void validateTransition(ArticleStatus current, ArticleStatus next) {
        if (current == null || next == null) {
            throw new IllegalArgumentException("문서 상태를 확인할 수 없습니다.");
        }
        if (current == next) {
            return;
        }
        if (current == ArticleStatus.DRAFT && next == ArticleStatus.PUBLISHED) {
            return;
        }
        if (current == ArticleStatus.PUBLISHED && next == ArticleStatus.UNPUBLISHED) {
            return;
        }
        if (current == ArticleStatus.UNPUBLISHED && next == ArticleStatus.PUBLISHED) {
            return;
        }
        if (next == ArticleStatus.DRAFT) {
            throw new IllegalArgumentException("게시 이력이 있는 문서를 초안으로 되돌릴 수 없습니다.");
        }
        throw new IllegalArgumentException("허용되지 않는 문서 상태 전이입니다.");
    }
}
