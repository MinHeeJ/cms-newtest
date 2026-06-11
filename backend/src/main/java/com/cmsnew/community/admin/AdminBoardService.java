package com.cmsnew.community.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.board.Board;
import com.cmsnew.community.board.BoardDtos.BoardResponse;
import com.cmsnew.community.board.BoardDtos.BoardUpsertRequest;
import com.cmsnew.community.board.BoardRepository;
import com.cmsnew.community.common.ApiErrorException;

@Service
public class AdminBoardService {
    private final BoardRepository boardRepository;
    private final AuditService auditService;

    public AdminBoardService(BoardRepository boardRepository, AuditService auditService) {
        this.boardRepository = boardRepository;
        this.auditService = auditService;
    }

    @Transactional
    public BoardResponse create(String actorId, BoardUpsertRequest request) {
        Board board = new Board(request.slug().trim(), request.name().trim(), request.description(), request.visibility(), request.postingPolicy());
        board.update(request.slug().trim(), request.name().trim(), request.description(), request.visibility(), request.postingPolicy(),
                request.normalizedCategories(), request.sortOrder() == null ? 0 : request.sortOrder(), Boolean.TRUE.equals(request.isArchived()));
        boardRepository.save(board);
        auditService.record(actorId, "BOARD_CREATE", "BOARD", board.getId(), "게시판 생성", request.name());
        return BoardResponse.from(board);
    }

    @Transactional
    public BoardResponse update(String actorId, String boardId, BoardUpsertRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> ApiErrorException.notFound("게시판을 찾을 수 없습니다."));
        board.update(request.slug().trim(), request.name().trim(), request.description(), request.visibility(), request.postingPolicy(),
                request.normalizedCategories(), request.sortOrder() == null ? board.getSortOrder() : request.sortOrder(),
                request.isArchived() == null ? board.isArchived() : request.isArchived());
        auditService.record(actorId, "BOARD_UPDATE", "BOARD", board.getId(), "게시판 설정 변경", request.name());
        return BoardResponse.from(board);
    }
}
