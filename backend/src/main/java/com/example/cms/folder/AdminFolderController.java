package com.example.cms.folder;

import com.example.cms.common.ApiResponse;
import com.example.cms.folder.dto.FolderMoveRequest;
import com.example.cms.folder.dto.FolderRequest;
import com.example.cms.folder.dto.FolderResponse;
import com.example.cms.folder.dto.SortRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/folders")
public class AdminFolderController {

    private final AdminFolderService folderService;

    public AdminFolderController(AdminFolderService folderService) {
        this.folderService = folderService;
    }

    @GetMapping
    public ApiResponse<List<FolderResponse>> list() {
        return ApiResponse.ok(folderService.list());
    }

    @PostMapping
    public ApiResponse<FolderResponse> create(@Valid @RequestBody FolderRequest request) {
        return ApiResponse.ok(folderService.create(request), "폴더가 생성되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<FolderResponse> update(@PathVariable Long id, @Valid @RequestBody FolderRequest request) {
        return ApiResponse.ok(folderService.update(id, request), "폴더가 수정되었습니다.");
    }

    @PatchMapping("/{id}/move")
    public ApiResponse<FolderResponse> move(@PathVariable Long id, @RequestBody FolderMoveRequest request) {
        return ApiResponse.ok(folderService.move(id, request), "폴더가 이동되었습니다.");
    }

    @PatchMapping("/{id}/sort")
    public ApiResponse<FolderResponse> sort(@PathVariable Long id, @Valid @RequestBody SortRequest request) {
        return ApiResponse.ok(folderService.sort(id, request.sortOrder()), "정렬 순서가 변경되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        folderService.delete(id);
        return ApiResponse.ok(null, "폴더가 삭제되었습니다.");
    }
}
