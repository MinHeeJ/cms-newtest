package com.example.cms.folder;

import com.example.cms.folder.dto.FolderMoveRequest;
import com.example.cms.folder.dto.FolderResponse;
import com.example.cms.folder.dto.FolderSortRequest;
import com.example.cms.folder.dto.FolderUpsertRequest;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminFolderService {
    private final FolderMapper folderMapper;

    public AdminFolderService(FolderMapper folderMapper) {
        this.folderMapper = folderMapper;
    }

    public List<FolderResponse> list() {
        return folderMapper.listAdmin().stream().map(FolderResponse::from).toList();
    }

    @Transactional
    public FolderResponse create(FolderUpsertRequest request) {
        assertParentExists(request.parentId());
        Folder folder = new Folder();
        folder.setParentId(request.parentId());
        folder.setTitle(request.title());
        folder.setDescription(request.description());
        folder.setActive(request.active() == null || request.active());
        folder.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        folderMapper.insertFolder(folder);
        return FolderResponse.from(folderMapper.findNotDeleted(folder.getId()));
    }

    @Transactional
    public FolderResponse update(Long id, FolderUpsertRequest request) {
        Folder folder = required(id);
        if (request.parentId() != null && request.parentId().equals(id)) {
            throw new IllegalArgumentException("폴더는 자기 자신을 상위 폴더로 지정할 수 없습니다.");
        }
        assertParentExists(request.parentId());
        folder.setParentId(request.parentId());
        folder.setTitle(request.title());
        folder.setDescription(request.description());
        folder.setActive(request.active() == null || request.active());
        folder.setSortOrder(request.sortOrder() == null ? folder.getSortOrder() : request.sortOrder());
        folderMapper.updateFolder(folder);
        return FolderResponse.from(folderMapper.findNotDeleted(id));
    }

    @Transactional
    public void delete(Long id) {
        required(id);
        if (folderMapper.countChildren(id) > 0 || folderMapper.countArticles(id) > 0) {
            throw new IllegalArgumentException("하위 폴더 또는 문서가 있는 폴더는 삭제할 수 없습니다.");
        }
        folderMapper.markDeleted(id);
    }

    @Transactional
    public FolderResponse move(Long id, FolderMoveRequest request) {
        required(id);
        if (request.parentId() != null) {
            if (request.parentId().equals(id)) {
                throw new IllegalArgumentException("폴더는 자기 자신 하위로 이동할 수 없습니다.");
            }
            assertParentExists(request.parentId());
            if (folderMapper.countDescendantMatch(id, request.parentId()) > 0) {
                throw new IllegalArgumentException("하위 폴더로 이동하면 순환 구조가 발생합니다.");
            }
        }
        folderMapper.move(id, request.parentId());
        return FolderResponse.from(folderMapper.findNotDeleted(id));
    }

    @Transactional
    public void sort(FolderSortRequest request) {
        int order = 0;
        for (Long id : request.orderedIds()) {
            required(id);
            folderMapper.updateSortOrder(id, order++);
        }
    }

    private Folder required(Long id) {
        Folder folder = folderMapper.findNotDeleted(id);
        if (folder == null) {
            throw new IllegalArgumentException("폴더를 찾을 수 없습니다.");
        }
        return folder;
    }

    private void assertParentExists(Long parentId) {
        if (parentId != null && folderMapper.findNotDeleted(parentId) == null) {
            throw new IllegalArgumentException("상위 폴더를 찾을 수 없습니다.");
        }
    }
}
