package com.cms.service;
import com.cms.entity.*;
import com.cms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional
public class ContentService {
    private final ContentItemRepository contentRepo;
    private final ContentRevisionRepository revisionRepo;
    private final TaxonomyTermRepository taxonomyRepo;
    private final MediaAssetRepository mediaRepo;
    private final WorkflowEventRepository eventRepo;
    private final PublicationScheduleRepository scheduleRepo;
    private final DtoMapper mapper;

    @Transactional(readOnly=true)
    public Map<String,Object> list(String status, String type, String q, int page, int pageSize) {
        Page<ContentItem> result = contentRepo.search(status, type, q,
            PageRequest.of(page-1, pageSize, Sort.by("updatedAt").descending()));
        return mapper.paged(result.getContent().stream().map(mapper::contentList).collect(Collectors.toList()),
            page, pageSize, result.getTotalElements());
    }

    public Map<String,Object> create(Map<String,Object> input, CmsUser actor) {
        String slug = (String) input.get("slug");
        if (contentRepo.existsBySlug(slug)) throw new ResponseStatusException(HttpStatus.CONFLICT, "slug 중복");
        ContentItem item = new ContentItem();
        applyInput(item, input);
        item.setAuthor(actor);
        item.setRevisionsCount(0);
        contentRepo.save(item);
        recordEvent("CREATE", actor, item.getId());
        return mapper.contentDetail(item);
    }

    @Transactional(readOnly=true)
    public Map<String,Object> get(UUID id) { return mapper.contentDetail(findById(id)); }

    public Map<String,Object> update(UUID id, Map<String,Object> input, CmsUser actor) {
        ContentItem item = findById(id);
        String newSlug = (String) input.get("slug");
        if (!item.getSlug().equals(newSlug) && contentRepo.existsBySlug(newSlug))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "slug 중복");
        applyInput(item, input);
        item.setUpdatedAt(Instant.now());
        int nextRev = revisionRepo.countByContentItemId(id) + 1;
        item.setRevisionsCount(nextRev);
        ContentRevision rev = ContentRevision.builder()
            .contentItemId(id).revisionNumber(nextRev)
            .titleSnapshot(item.getTitle()).metadataSnapshot("{}")
            .markdownBodySnapshot(item.getMarkdownBody())
            .changeSummary((String) input.get("changeSummary"))
            .createdBy(actor).build();
        revisionRepo.save(rev);
        recordEvent("UPDATE", actor, id);
        return mapper.contentDetail(contentRepo.save(item));
    }

    public Map<String,Object> submit(UUID id, CmsUser actor)   { return transition(id, actor, "DRAFT", "IN_REVIEW", "SUBMIT"); }
    public Map<String,Object> approve(UUID id, CmsUser actor)  { return transition(id, actor, "IN_REVIEW", "APPROVED", "APPROVE"); }
    public Map<String,Object> reject(UUID id, CmsUser actor)   { return transition(id, actor, "IN_REVIEW", "DRAFT", "REJECT"); }
    public Map<String,Object> unpublish(UUID id, CmsUser actor){ return transition(id, actor, "PUBLISHED", "DRAFT", "UNPUBLISH"); }

    public Map<String,Object> publish(UUID id, CmsUser actor) {
        ContentItem item = findById(id);
        item.setStatus("PUBLISHED"); item.setPublishedAt(Instant.now()); item.setUpdatedAt(Instant.now());
        recordEvent("PUBLISH", actor, id);
        return mapper.contentDetail(contentRepo.save(item));
    }

    public Map<String,Object> archive(UUID id, CmsUser actor) {
        ContentItem item = findById(id);
        item.setStatus("ARCHIVED"); item.setArchivedAt(Instant.now()); item.setUpdatedAt(Instant.now());
        recordEvent("ARCHIVE", actor, id);
        return mapper.contentDetail(contentRepo.save(item));
    }

    public Map<String,Object> schedule(UUID id, String scheduledAt, CmsUser actor) {
        ContentItem item = findById(id);
        Instant at = Instant.parse(scheduledAt);
        item.setStatus("SCHEDULED"); item.setScheduledAt(at); item.setUpdatedAt(Instant.now());
        contentRepo.save(item);
        PublicationSchedule sch = PublicationSchedule.builder()
            .contentItemId(id).scheduledAt(at).status("PENDING").requestedBy(actor).build();
        scheduleRepo.save(sch);
        recordEvent("SCHEDULE", actor, id);
        return Map.of("id", sch.getId(), "contentItemId", id, "scheduledAt", at, "status", "PENDING");
    }

    @Transactional(readOnly=true)
    public List<Map<String,Object>> listRevisions(UUID id) {
        return revisionRepo.findByContentItemIdOrderByRevisionNumberDesc(id)
            .stream().map(mapper::revision).collect(Collectors.toList());
    }

    public Map<String,Object> restoreRevision(UUID contentId, UUID revisionId, CmsUser actor) {
        ContentItem item = findById(contentId);
        ContentRevision rev = revisionRepo.findById(revisionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "revision not found"));
        item.setTitle(rev.getTitleSnapshot());
        item.setMarkdownBody(rev.getMarkdownBodySnapshot());
        item.setUpdatedAt(Instant.now());
        item.setRevisionsCount(item.getRevisionsCount() + 1);
        revisionRepo.save(ContentRevision.builder()
            .contentItemId(contentId).revisionNumber(item.getRevisionsCount())
            .titleSnapshot(item.getTitle()).metadataSnapshot("{}")
            .markdownBodySnapshot(item.getMarkdownBody())
            .changeSummary("리비전 " + rev.getRevisionNumber() + "에서 복원")
            .createdBy(actor).build());
        return mapper.contentDetail(contentRepo.save(item));
    }

    public Map<String,Object> preview(UUID id, Map<String,Object> input) {
        ContentItem item = findById(id);
        String title = input.getOrDefault("title", item.getTitle()).toString();
        String body  = input.getOrDefault("markdownBody", item.getMarkdownBody()).toString();
        String summary = input.getOrDefault("summary", item.getSummary()).toString();
        return Map.of("html", "<h1>" + title + "</h1><p>" + summary + "</p>", "title", title, "summary", summary);
    }

    private void applyInput(ContentItem item, Map<String,Object> input) {
        if (input.containsKey("contentType")) item.setContentType((String) input.get("contentType"));
        if (input.containsKey("title"))       item.setTitle((String) input.get("title"));
        if (input.containsKey("slug"))        item.setSlug((String) input.get("slug"));
        if (input.containsKey("summary"))     item.setSummary((String) input.getOrDefault("summary", ""));
        if (input.containsKey("markdownBody")) item.setMarkdownBody((String) input.get("markdownBody"));
        if (input.containsKey("visibility"))  item.setVisibility((String) input.getOrDefault("visibility", "PUBLIC"));
        Object mediaId = input.get("featuredMediaId");
        if (mediaId != null) mediaRepo.findById(UUID.fromString(mediaId.toString())).ifPresent(item::setFeaturedMedia);
        Object catIds = input.get("categoryIds");
        if (catIds instanceof List<?> cats)
            item.setCategories(taxonomyRepo.findAllById(cats.stream().map(o -> UUID.fromString(o.toString())).collect(Collectors.toList())));
        Object tagIds = input.get("tagIds");
        if (tagIds instanceof List<?> tags)
            item.setTags(taxonomyRepo.findAllById(tags.stream().map(o -> UUID.fromString(o.toString())).collect(Collectors.toList())));
    }

    private Map<String,Object> transition(UUID id, CmsUser actor, String from, String to, String eventType) {
        ContentItem item = findById(id);
        if (!from.equals(item.getStatus()))
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "상태가 " + from + " 이어야 합니다");
        item.setStatus(to); item.setUpdatedAt(Instant.now());
        recordEvent(eventType, actor, id);
        return mapper.contentDetail(contentRepo.save(item));
    }

    private ContentItem findById(UUID id) {
        return contentRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "content not found"));
    }

    private void recordEvent(String type, CmsUser actor, UUID targetId) {
        eventRepo.save(WorkflowEvent.builder().eventType(type).actor(actor)
            .targetType("CONTENT").targetId(targetId).build());
    }
}
