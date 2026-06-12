package com.example.cms.folder;

import com.example.cms.folder.dto.FolderMoveRequest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminFolderServiceTest {
    @Test
    void deleteRejectsFolderWithChildren() {
        FolderMapper mapper = mock(FolderMapper.class);
        Folder folder = new Folder();
        folder.setId(1L);
        when(mapper.findNotDeleted(1L)).thenReturn(folder);
        when(mapper.countChildren(1L)).thenReturn(1);

        assertThatThrownBy(() -> new AdminFolderService(mapper).delete(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("삭제할 수 없습니다");
    }

    @Test
    void moveRejectsDescendantParent() {
        FolderMapper mapper = mock(FolderMapper.class);
        Folder folder = new Folder();
        folder.setId(1L);
        Folder child = new Folder();
        child.setId(2L);
        when(mapper.findNotDeleted(1L)).thenReturn(folder);
        when(mapper.findNotDeleted(2L)).thenReturn(child);
        when(mapper.countDescendantMatch(1L, 2L)).thenReturn(1);

        assertThatThrownBy(() -> new AdminFolderService(mapper).move(1L, new FolderMoveRequest(2L)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("순환 구조");
    }
}
