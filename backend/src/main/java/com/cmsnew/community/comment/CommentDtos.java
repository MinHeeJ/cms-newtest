package com.cmsnew.community.comment;

import java.time.OffsetDateTime;

import com.cmsnew.community.common.CommunityEnums.CommentStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class CommentDtos {
    private CommentDtos() {
    }

    public record CommentResponse(
            String id,
            String postId,
            String parentCommentId,
            String authorNickname,
            String body,
            CommentStatus status,
            int depth,
            OffsetDateTime createdAt
    ) {
        public static CommentResponse from(Comment comment) {
            return new CommentResponse(
                    comment.getId(),
                    comment.getPost().getId(),
                    comment.getParentComment() == null ? null : comment.getParentComment().getId(),
                    comment.getAuthor().getNickname(),
                    comment.getBody(),
                    comment.getStatus(),
                    comment.getDepth(),
                    comment.getCreatedAt()
            );
        }
    }

    public record CommentCreateRequest(
            String parentCommentId,
            @NotBlank(message = "댓글 내용을 입력해주세요.") @Size(max = 2000, message = "댓글은 2000자 이하로 입력해주세요.") String body
    ) {
    }
}
