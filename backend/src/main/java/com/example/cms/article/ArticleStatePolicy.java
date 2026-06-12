package com.example.cms.article;

import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class ArticleStatePolicy {
    private static final Map<ArticleStatus, Set<ArticleStatus>> TRANSITIONS = Map.of(
            ArticleStatus.DRAFT, Set.of(ArticleStatus.PUBLISHED, ArticleStatus.UNPUBLISHED),
            ArticleStatus.PUBLISHED, Set.of(ArticleStatus.UNPUBLISHED),
            ArticleStatus.UNPUBLISHED, Set.of(ArticleStatus.PUBLISHED));

    public void assertTransition(String current, ArticleStatus target) {
        ArticleStatus source = ArticleStatus.valueOf(current);
        if (source == target) {
            return;
        }
        if (!TRANSITIONS.getOrDefault(source, Set.of()).contains(target)) {
            throw new IllegalArgumentException("허용되지 않는 문서 상태 전이입니다.");
        }
    }
}
