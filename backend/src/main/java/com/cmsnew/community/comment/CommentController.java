package com.cmsnew.community.comment;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.comment.CommentDtos.CommentCreateRequest;
import com.cmsnew.community.comment.CommentDtos.CommentResponse;
import com.cmsnew.community.common.CommunityEnums.CommentStatus;
import com.cmsnew.community.common.PageResponse;

import jakarta.validation.Valid;

@RestController
public class CommentController {
    private final CommentRepository commentRepository;
    private final CommentCommandService commentCommandService;

    public CommentController(CommentRepository commentRepository, CommentCommandService commentCommandService) {
        this.commentRepository = commentRepository;
        this.commentCommandService = commentCommandService;
    }

    @GetMapping("/api/v1/posts/{postId}/comments")
    @Transactional(readOnly = true)
    PageResponse<CommentResponse> comments(@PathVariable String postId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "50") int size) {
        return PageResponse.from(commentRepository.findByPost_IdAndStatusOrderByCreatedAtAsc(
                postId,
                CommentStatus.PUBLISHED,
                PageRequest.of(page, size, Sort.by("createdAt").ascending())
        ).map(CommentResponse::from));
    }

    @PostMapping("/api/v1/posts/{postId}/comments")
    ResponseEntity<CommentResponse> create(@AuthenticationPrincipal CurrentMember currentMember,
                                           @PathVariable String postId,
                                           @Valid @RequestBody CommentCreateRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(commentCommandService.create(postId, current.id(), request));
    }
}
