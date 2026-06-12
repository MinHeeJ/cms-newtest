package com.example.cms.folder;

import com.example.cms.folder.dto.FolderResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PortalFolderService {
    private final FolderMapper folderMapper;

    public PortalFolderService(FolderMapper folderMapper) {
        this.folderMapper = folderMapper;
    }

    public List<FolderResponse> listChildren(Long parentId) {
        return folderMapper.listPortalChildren(parentId).stream().map(FolderResponse::from).toList();
    }
}
