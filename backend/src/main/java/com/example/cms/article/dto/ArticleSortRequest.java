package com.example.cms.article.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ArticleSortRequest(@NotEmpty List<Long> orderedIds) {
}
