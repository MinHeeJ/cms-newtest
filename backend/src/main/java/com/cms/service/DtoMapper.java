package com.cms.service;
import com.cms.entity.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;
@Component
public class DtoMapper {
    @Value("${cms.storage.base-url:http://localhost:8085/uploads}")
    private String storageBase;

    public Map<String,Object> user(CmsUser u) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", u.getId()); m.put("email", u.getEmail());
        m.put("displayName", u.getDisplayName()); m.put("status", u.getStatus());
        m.put("roles", new ArrayList<>(u.getRoles()));
        m.put("lastLoginAt", u.getLastLoginAt()); m.put("createdAt", u.getCreatedAt()); m.put("updatedAt", u.getUpdatedAt());
        return m;
    }
    public Map<String,Object> userSummary(CmsUser u) {
        return Map.of("id", u.getId(), "email", u.getEmail(), "displayName", u.getDisplayName());
    }
    public Map<String,Object> taxonomy(TaxonomyTerm t) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", t.getId()); m.put("type", t.getType()); m.put("name", t.getName());
        m.put("slug", t.getSlug()); m.put("description", t.getDescription());
        m.put("parentId", t.getParentId()); m.put("sortOrder", t.getSortOrder());
        m.put("createdAt", t.getCreatedAt()); m.put("updatedAt", t.getUpdatedAt());
        return m;
    }
    public Map<String,Object> media(MediaAsset a) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", a.getId()); m.put("fileName", a.getFileName()); m.put("mimeType", a.getMimeType());
        m.put("sizeBytes", a.getSizeBytes()); m.put("storageKey", a.getStorageKey());
        m.put("url", storageBase + "/" + a.getStorageKey());
        m.put("altText", a.getAltText()); m.put("caption", a.getCaption());
        m.put("usageCount", a.getUsageCount()); m.put("uploadedBy", userSummary(a.getUploadedBy()));
        m.put("createdAt", a.getCreatedAt()); m.put("updatedAt", a.getUpdatedAt());
        return m;
    }
    public Map<String,Object> contentList(ContentItem c) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", c.getId()); m.put("contentType", c.getContentType());
        m.put("title", c.getTitle()); m.put("slug", c.getSlug()); m.put("status", c.getStatus());
        m.put("author", userSummary(c.getAuthor()));
        m.put("publishedAt", c.getPublishedAt()); m.put("scheduledAt", c.getScheduledAt()); m.put("updatedAt", c.getUpdatedAt());
        return m;
    }
    public Map<String,Object> contentDetail(ContentItem c) {
        Map<String,Object> m = new LinkedHashMap<>(contentList(c));
        m.put("summary", c.getSummary()); m.put("markdownBody", c.getMarkdownBody());
        m.put("visibility", c.getVisibility());
        m.put("featuredMedia", c.getFeaturedMedia() != null ? media(c.getFeaturedMedia()) : null);
        m.put("revisionsCount", c.getRevisionsCount());
        m.put("categories", c.getCategories().stream().map(this::taxonomy).collect(Collectors.toList()));
        m.put("tags", c.getTags().stream().map(this::taxonomy).collect(Collectors.toList()));
        m.put("archivedAt", c.getArchivedAt()); m.put("createdAt", c.getCreatedAt());
        return m;
    }
    public Map<String,Object> revision(ContentRevision r) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", r.getId()); m.put("contentItemId", r.getContentItemId());
        m.put("revisionNumber", r.getRevisionNumber()); m.put("titleSnapshot", r.getTitleSnapshot());
        m.put("metadataSnapshot", r.getMetadataSnapshot()); m.put("markdownBodySnapshot", r.getMarkdownBodySnapshot());
        m.put("changeSummary", r.getChangeSummary()); m.put("createdBy", userSummary(r.getCreatedBy()));
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
    public Map<String,Object> navItem(NavigationItem i) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", i.getId()); m.put("label", i.getLabel()); m.put("targetType", i.getTargetType());
        m.put("targetId", i.getTargetId()); m.put("url", i.getUrl());
        m.put("parentId", i.getParentId()); m.put("sortOrder", i.getSortOrder()); m.put("isVisible", i.getIsVisible());
        return m;
    }
    public Map<String,Object> navMenu(NavigationMenu n) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", n.getId()); m.put("key", n.getKey()); m.put("label", n.getLabel()); m.put("isActive", n.getIsActive());
        m.put("items", n.getItems().stream().map(this::navItem).collect(Collectors.toList()));
        m.put("createdAt", n.getCreatedAt()); m.put("updatedAt", n.getUpdatedAt());
        return m;
    }
    public Map<String,Object> event(WorkflowEvent e) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", e.getId()); m.put("eventType", e.getEventType()); m.put("actor", userSummary(e.getActor()));
        m.put("targetType", e.getTargetType()); m.put("targetId", e.getTargetId());
        m.put("beforeState", e.getBeforeState()); m.put("afterState", e.getAfterState());
        m.put("comment", e.getComment()); m.put("createdAt", e.getCreatedAt());
        return m;
    }
    public Map<String,Object> paged(List<?> items, int page, int pageSize, long total) {
        return Map.of("items", items, "pageInfo", Map.of(
            "page", page, "pageSize", pageSize, "totalItems", total,
            "totalPages", (int)Math.ceil((double)total/pageSize)));
    }
}
