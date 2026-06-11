package com.cmsnew.community.post;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.cmsnew.community.common.CommunityEnums.PostStatus;
import com.cmsnew.community.common.CommunityEnums.ReactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class PostDtos {
    private PostDtos() {
    }

    public record PostSummary(
            String id,
            String boardId,
            String boardName,
            String title,
            String category,
            String authorNickname,
            PostStatus status,
            int viewCount,
            int commentCount,
            int reactionCount,
            @JsonProperty("isNotice") boolean isNotice,
            @JsonProperty("isPinned") boolean isPinned,
            OffsetDateTime createdAt
    ) {
        public static PostSummary from(Post post) {
            return new PostSummary(
                    post.getId(),
                    post.getBoard().getId(),
                    post.getBoard().getName(),
                    post.getTitle(),
                    post.getCategory(),
                    post.getAuthor().getNickname(),
                    post.getStatus(),
                    post.getViewCount(),
                    post.getCommentCount(),
                    post.getReactionCount(),
                    post.isNotice(),
                    post.isPinned(),
                    post.getCreatedAt()
            );
        }
    }

    public record PostDetail(
            String id,
            String boardId,
            String boardName,
            String title,
            String category,
            String authorNickname,
            PostStatus status,
            int viewCount,
            int commentCount,
            int reactionCount,
            @JsonProperty("isNotice") boolean isNotice,
            @JsonProperty("isPinned") boolean isPinned,
            OffsetDateTime createdAt,
            String body,
            List<Attachment> attachments,
            ReactionType currentMemberReaction
    ) {
        public static PostDetail from(Post post, ReactionType currentMemberReaction) {
            return new PostDetail(
                    post.getId(),
                    post.getBoard().getId(),
                    post.getBoard().getName(),
                    post.getTitle(),
                    post.getCategory(),
                    post.getAuthor().getNickname(),
                    post.getStatus(),
                    post.getViewCount(),
                    post.getCommentCount(),
                    post.getReactionCount(),
                    post.isNotice(),
                    post.isPinned(),
                    post.getCreatedAt(),
                    post.getBody(),
                    List.of(),
                    currentMemberReaction
            );
        }
    }

    public record Attachment(String id, String fileName, String contentType, long sizeBytes, String url) {
    }

    public record PostCreateRequest(
            @NotBlank(message = "제목은 필수입니다.") @Size(min = 2, max = 120, message = "제목은 2자 이상 120자 이하로 입력해주세요.") String title,
            @NotBlank(message = "본문은 필수입니다.") String body,
            String category,
            List<String> attachmentIds
    ) {
    }

    public record PostUpdateRequest(
            @Size(min = 2, max = 120, message = "제목은 2자 이상 120자 이하로 입력해주세요.") String title,
            String body,
            String category
    ) {
    }

    public record ReactionRequest(@NotNull(message = "반응 종류를 선택해주세요.") ReactionType type) {
    }

    public record ReactionSummary(String postId, Map<ReactionType, Long> counts, ReactionType currentMemberReaction) {
    }
}
