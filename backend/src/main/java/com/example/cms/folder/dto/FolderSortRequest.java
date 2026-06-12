package com.example.cms.folder.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record FolderSortRequest(@NotEmpty List<Long> orderedIds) {
}
