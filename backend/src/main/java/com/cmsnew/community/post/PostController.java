package com.cmsnew.community.post;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.board.BoardFeedService;
import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.member.PersonalizationService;
import com.cmsnew.community.post.PostDtos.PostCreateRequest;
import com.cmsnew.community.post.PostDtos.PostDetail;
import com.cmsnew.community.post.PostDtos.PostSummary;
import com.cmsnew.community.post.PostDtos.PostUpdateRequest;
import com.cmsnew.community.post.PostDtos.ReactionRequest;
import com.cmsnew.community.post.PostDtos.ReactionSummary;

import jakarta.validation.Valid;

@RestController
public class PostController {
    private final BoardFeedService boardFeedService;
    private final PostCommandService postCommandService;
    private final PersonalizationService personalizationService;

    public PostController(BoardFeedService boardFeedService, PostCommandService postCommandService,
                          PersonalizationService personalizationService) {
        this.boardFeedService = boardFeedService;
        this.postCommandService = postCommandService;
        this.personalizationService = personalizationService;
    }

    @GetMapping("/api/v1/boards/{boardId}/posts")
    PageResponse<PostSummary> boardPosts(@PathVariable String boardId,
                                         @RequestParam(defaultValue = "latest") String sort,
                                         @RequestParam(required = false) String category,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        return boardFeedService.posts(boardId, sort, category, page, size);
    }

    @PostMapping("/api/v1/boards/{boardId}/posts")
    ResponseEntity<PostDetail> create(@AuthenticationPrincipal CurrentMember currentMember,
                                      @PathVariable String boardId,
                                      @Valid @RequestBody PostCreateRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(postCommandService.create(boardId, current.id(), current.role(), request));
    }

    @GetMapping("/api/v1/posts/{postId}")
    PostDetail detail(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String postId) {
        return postCommandService.detail(postId, currentMember);
    }

    @PatchMapping("/api/v1/posts/{postId}")
    PostDetail update(@AuthenticationPrincipal CurrentMember currentMember,
                      @PathVariable String postId,
                      @Valid @RequestBody PostUpdateRequest request) {
        return postCommandService.update(postId, currentMember, request);
    }

    @DeleteMapping("/api/v1/posts/{postId}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String postId) {
        postCommandService.delete(postId, currentMember);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/v1/posts/{postId}/reactions")
    ReactionSummary react(@AuthenticationPrincipal CurrentMember currentMember,
                          @PathVariable String postId,
                          @Valid @RequestBody ReactionRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        return postCommandService.react(postId, current.id(), request.type());
    }

    @DeleteMapping("/api/v1/posts/{postId}/reactions")
    ReactionSummary removeReaction(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String postId) {
        CurrentMember current = CurrentMember.require(currentMember);
        return postCommandService.removeReaction(postId, current.id());
    }

    @PutMapping("/api/v1/posts/{postId}/bookmark")
    ResponseEntity<Void> bookmark(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String postId) {
        CurrentMember current = CurrentMember.require(currentMember);
        personalizationService.bookmark(current.id(), postId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/v1/posts/{postId}/bookmark")
    ResponseEntity<Void> removeBookmark(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String postId) {
        CurrentMember current = CurrentMember.require(currentMember);
        personalizationService.removeBookmark(current.id(), postId);
        return ResponseEntity.noContent().build();
    }
}
