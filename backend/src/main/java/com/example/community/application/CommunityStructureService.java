package com.example.community.application;

import com.example.community.api.ErrorResponse;
import com.example.community.domain.CommunityBoard;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityRule;
import com.example.community.domain.CommunityTypes;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CommunityStructureService {
    public void replaceBoards(CommunityCreationRequest request, List<BoardCommand> commands) {
        if (commands == null || commands.isEmpty()) {
            throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "게시판은 최소 1개 이상 필요합니다.");
        }
        Set<String> names = new HashSet<>();
        List<CommunityBoard> boards = commands.stream()
                .map(command -> {
                    String name = command.name() == null ? "" : command.name().strip();
                    if (name.isBlank()) {
                        throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "게시판 이름을 입력해 주세요.");
                    }
                    if (!names.add(name.toLowerCase(Locale.ROOT))) {
                        throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "게시판 이름은 중복될 수 없습니다.");
                    }
                    return new CommunityBoard(
                            name,
                            command.description(),
                            command.type() == null ? CommunityTypes.BoardType.GENERAL : command.type(),
                            command.postPermission() == null ? CommunityTypes.Role.MEMBER : command.postPermission(),
                            command.commentPermission() == null ? CommunityTypes.Role.MEMBER : command.commentPermission(),
                            command.displayOrder() == null ? names.size() : command.displayOrder(),
                            names.size() == 1);
                })
                .toList();
        request.replaceBoards(boards);
    }

    public void replaceRules(CommunityCreationRequest request, List<RuleCommand> commands) {
        if (commands == null || commands.isEmpty()) {
            throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "규칙은 최소 1개 이상 필요합니다.");
        }
        List<CommunityRule> rules = commands.stream()
                .map(command -> {
                    if (command.title() == null || command.title().isBlank() || command.body() == null || command.body().isBlank()) {
                        throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "규칙 제목과 내용을 입력해 주세요.");
                    }
                    return new CommunityRule(
                            command.title(),
                            command.body(),
                            command.displayOrder() == null ? 1 : command.displayOrder(),
                            command.required() == null || command.required());
                })
                .toList();
        request.replaceRules(rules);
    }

    public record BoardCommand(
            String name,
            String description,
            CommunityTypes.BoardType type,
            CommunityTypes.Role postPermission,
            CommunityTypes.Role commentPermission,
            Integer displayOrder) {
    }

    public record RuleCommand(String title, String body, Integer displayOrder, Boolean required) {
    }
}
