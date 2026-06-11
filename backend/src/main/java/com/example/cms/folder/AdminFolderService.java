package com.example.cms.folder;

import com.example.cms.folder.dto.FolderMoveRequest;
import com.example.cms.folder.dto.FolderRequest;
import com.example.cms.folder.dto.FolderResponse;
import com.example.cms.article.ArticleMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AdminFolderService {

    private final FolderMapper folderMapper;
    private final ArticleMapper articleMapper;

    public AdminFolderService(FolderMapper folderMapper, ArticleMapper articleMapper) {
        this.folderMapper = folderMapper;
        this.articleMapper = articleMapper;
    }

    public List<FolderResponse> list() {
        return folderMapper.findAllAdmin().stream().map(FolderResponse::from).toList();
    }

    @Transactional
    public FolderResponse create(FolderRequest request) {
        validateParent(request.parentId());
        Folder folder = toFolder(new Folder(), request);
        folderMapper.insert(folder);
        return FolderResponse.from(folderMapper.findById(folder.getId()));
    }

    @Transactional
    public FolderResponse update(Long id, FolderRequest request) {
        Folder folder = requireFolder(id);
        if (request.parentId() != null && request.parentId().equals(id)) {
            throw new IllegalArgumentException("자기 자신을 상위 폴더로 지정할 수 없습니다.");
        }
        validateParent(request.parentId());
        folderMapper.update(toFolder(folder, request));
        return FolderResponse.from(requireFolder(id));
    }

    @Transactional
    public void delete(Long id) {
        requireFolder(id);
        if (folderMapper.countChildren(id) > 0) {
            throw new IllegalArgumentException("하위 폴더가 있는 폴더는 삭제할 수 없습니다.");
        }
        if (articleMapper.countByFolder(id) > 0) {
            throw new IllegalArgumentException("문서가 있는 폴더는 삭제할 수 없습니다.");
        }
        folderMapper.softDelete(id);
    }

    @Transactional
    public FolderResponse move(Long id, FolderMoveRequest request) {
        requireFolder(id);
        if (request.parentId() != null && request.parentId().equals(id)) {
            throw new IllegalArgumentException("자기 자신을 상위 폴더로 지정할 수 없습니다.");
        }
        if (createsCycle(id, request.parentId())) {
            throw new IllegalArgumentException("순환 폴더 이동은 허용되지 않습니다.");
        }
        validateParent(request.parentId());
        folderMapper.move(id, request.parentId(), request.sortOrder() == null ? 0 : request.sortOrder());
        return FolderResponse.from(requireFolder(id));
    }

    @Transactional
    public FolderResponse sort(Long id, Integer sortOrder) {
        requireFolder(id);
        folderMapper.sort(id, sortOrder);
        return FolderResponse.from(requireFolder(id));
    }

    private Folder requireFolder(Long id) {
        Folder folder = folderMapper.findById(id);
        if (folder == null) {
            throw new IllegalArgumentException("폴더를 찾을 수 없습니다.");
        }
        return folder;
    }

    private void validateParent(Long parentId) {
        if (parentId != null && folderMapper.findById(parentId) == null) {
            throw new IllegalArgumentException("상위 폴더를 찾을 수 없습니다.");
        }
    }

    private boolean createsCycle(Long id, Long parentId) {
        Set<Long> visited = new HashSet<>();
        Long current = parentId;
        while (current != null) {
            if (!visited.add(current) || current.equals(id)) {
                return true;
            }
            Folder parent = folderMapper.findById(current);
            current = parent == null ? null : parent.getParentId();
        }
        return false;
    }

    private Folder toFolder(Folder folder, FolderRequest request) {
        folder.setParentId(request.parentId());
        folder.setTitle(request.title());
        folder.setDescription(request.description());
        folder.setActive(request.active() == null || request.active());
        folder.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        return folder;
    }
}
