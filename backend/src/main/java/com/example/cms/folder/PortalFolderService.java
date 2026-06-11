package com.example.cms.folder;

import com.example.cms.folder.dto.FolderResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortalFolderService {

    private final FolderMapper folderMapper;

    public PortalFolderService(FolderMapper folderMapper) {
        this.folderMapper = folderMapper;
    }

    public List<FolderResponse> activeChildren(Long parentId) {
        return folderMapper.findActiveChildren(parentId).stream()
                .map(FolderResponse::from)
                .toList();
    }
}
