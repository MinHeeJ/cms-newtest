package com.cmsnew.community.board;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.cmsnew.community.common.CommunityEnums.BoardVisibility;
import com.cmsnew.community.common.CommunityEnums.PostingPolicy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class BoardDtos {
    private BoardDtos() {
    }

    public record BoardResponse(
            String id,
            String slug,
            String name,
            String description,
            BoardVisibility visibility,
            PostingPolicy postingPolicy,
            List<String> categoryOptions,
            int sortOrder,
            @JsonProperty("isArchived") boolean isArchived
    ) {
        public static BoardResponse from(Board board) {
            return new BoardResponse(
                    board.getId(),
                    board.getSlug(),
                    board.getName(),
                    board.getDescription(),
                    board.getVisibility(),
                    board.getPostingPolicy(),
                    List.copyOf(board.getCategoryOptions()),
                    board.getSortOrder(),
                    board.isArchived()
            );
        }
    }

    public record BoardUpsertRequest(
            @NotBlank(message = "게시판 주소는 필수입니다.") String slug,
            @NotBlank(message = "게시판 이름은 필수입니다.") String name,
            String description,
            @NotNull(message = "공개 범위를 선택해주세요.") BoardVisibility visibility,
            @NotNull(message = "글쓰기 권한을 선택해주세요.") PostingPolicy postingPolicy,
            List<String> categoryOptions,
            Integer sortOrder,
            @JsonProperty("isArchived") Boolean isArchived
    ) {
        public Set<String> normalizedCategories() {
            if (categoryOptions == null) {
                return Set.of();
            }
            LinkedHashSet<String> categories = new LinkedHashSet<>();
            categoryOptions.stream()
                    .filter(category -> category != null && !category.isBlank())
                    .map(String::trim)
                    .forEach(categories::add);
            return categories;
        }
    }
}
