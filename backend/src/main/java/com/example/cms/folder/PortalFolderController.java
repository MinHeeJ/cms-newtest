package com.example.cms.folder;

import com.example.cms.common.ApiResponse;
import com.example.cms.folder.dto.FolderResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/portal/folders")
public class PortalFolderController {
    private final PortalFolderService folderService;

    public PortalFolderController(PortalFolderService folderService) {
        this.folderService = folderService;
    }

    @GetMapping
    public ApiResponse<List<FolderResponse>> list(@RequestParam(required = false) Long parentId) {
        return ApiResponse.ok(folderService.listChildren(parentId));
    }
}
