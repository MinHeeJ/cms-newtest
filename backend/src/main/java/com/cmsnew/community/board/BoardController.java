package com.cmsnew.community.board;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.board.BoardDtos.BoardResponse;
import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.member.PersonalizationService;

@RestController
@RequestMapping("/api/v1/boards")
public class BoardController {
    private final BoardFeedService boardFeedService;
    private final PersonalizationService personalizationService;

    public BoardController(BoardFeedService boardFeedService, PersonalizationService personalizationService) {
        this.boardFeedService = boardFeedService;
        this.personalizationService = personalizationService;
    }

    @GetMapping
    PageResponse<BoardResponse> boards(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return boardFeedService.publicBoards(page, size);
    }

    @GetMapping("/{boardId}")
    BoardResponse board(@PathVariable String boardId) {
        return boardFeedService.board(boardId);
    }

    @PutMapping("/{boardId}/subscription")
    ResponseEntity<Void> subscribe(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String boardId) {
        CurrentMember current = CurrentMember.require(currentMember);
        personalizationService.subscribe(current.id(), boardId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{boardId}/subscription")
    ResponseEntity<Void> unsubscribe(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String boardId) {
        CurrentMember current = CurrentMember.require(currentMember);
        personalizationService.unsubscribe(current.id(), boardId);
        return ResponseEntity.noContent().build();
    }
}
