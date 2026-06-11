package com.example.cms.folder;

import com.example.cms.folder.dto.FolderMoveRequest;
import com.example.cms.article.ArticleMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminFolderServiceTest {

    @Test
    void rejectsMovingFolderUnderItself() {
        FolderMapper mapper = mock(FolderMapper.class);
        Folder folder = new Folder();
        folder.setId(1L);
        when(mapper.findById(1L)).thenReturn(folder);
        AdminFolderService service = new AdminFolderService(mapper, mock(ArticleMapper.class));

        assertThatThrownBy(() -> service.move(1L, new FolderMoveRequest(1L, 0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("자기 자신");
    }
}
