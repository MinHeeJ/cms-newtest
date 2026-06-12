package com.example.cms.folder;

import com.example.cms.common.ApiResponse;
import com.example.cms.folder.dto.FolderMoveRequest;
import com.example.cms.folder.dto.FolderResponse;
import com.example.cms.folder.dto.FolderSortRequest;
import com.example.cms.folder.dto.FolderUpsertRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ApiResponse<FolderResponse> create(@Valid @RequestBody FolderUpsertRequest request) {
        return ApiResponse.ok(folderService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<FolderResponse> update(@PathVariable Long id, @Valid @RequestBody FolderUpsertRequest request) {
        return ApiResponse.ok(folderService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        folderService.delete(id);
        return ApiResponse.ok();
    }

    @PatchMapping("/{id}/move")
    public ApiResponse<FolderResponse> move(@PathVariable Long id, @RequestBody FolderMoveRequest request) {
        return ApiResponse.ok(folderService.move(id, request));
    }

    @PutMapping("/sort")
    public ApiResponse<Void> sort(@Valid @RequestBody FolderSortRequest request) {
        folderService.sort(request);
        return ApiResponse.ok();
    }
}
