package com.cms;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class CmsService {
  private final CmsMapper mapper;

  public CmsService(CmsMapper mapper) {
    this.mapper = mapper;
  }

  public int ping() { return mapper.ping(); }
  public Map<String,Object> insertFolder(Map<String,Object> row) { return mapper.insertFolder(row); }
  public List<Map<String,Object>> folders() { return mapper.folders(); }
  public int updateFolder(Map<String,Object> row) { return mapper.updateFolder(row); }
  public int deleteFolder(Map<String,Object> row) { return mapper.deleteFolder(row); }
  public Map<String,Object> insertDocument(Map<String,Object> row) { return mapper.insertDocument(row); }
  public List<Map<String,Object>> documents(int size, int offset) { return mapper.documents(size, offset); }
  public Map<String,Object> document(String documentId) { return mapper.document(documentId); }
  public int updateDocument(Map<String,Object> row) { return mapper.updateDocument(row); }
  public int publish(Map<String,Object> row) { return mapper.publish(row); }
  public int unpublish(Map<String,Object> row) { return mapper.unpublish(row); }
  public int deleteDocument(Map<String,Object> row) { return mapper.deleteDocument(row); }
  public Map<String,Object> portalDocument(String documentId) { return mapper.portalDocument(documentId); }
  public List<Map<String,Object>> search(String query, int size, int offset) { return mapper.search(query, size, offset); }
  public List<Map<String,Object>> publishedDocuments() { return mapper.publishedDocuments(); }
  public Map<String,Object> insertAttachment(Map<String,Object> row) { return mapper.insertAttachment(row); }
  public List<Map<String,Object>> attachments(String documentId) { return mapper.attachments(documentId); }
  public Map<String,Object> attachment(String attachmentId) { return mapper.attachment(attachmentId); }
  public int deleteAttachment(Map<String,Object> row) { return mapper.deleteAttachment(row); }
  public Map<String,Object> audit(Map<String,Object> row) { return mapper.audit(row); }
  public List<Map<String,Object>> auditLogs(int size, int offset) { return mapper.auditLogs(size, offset); }
  public Map<String,Object> insertJob(Map<String,Object> row) { return mapper.insertJob(row); }
  public List<Map<String,Object>> jobs(String jobType, int size, int offset) { return mapper.jobs(jobType, size, offset); }
  public Map<String,Object> job(String jobId) { return mapper.job(jobId); }
  public int restore(String jobId) { return mapper.restore(jobId); }
  public Map<String,Object> insertProject(Map<String,Object> row) { return mapper.insertProject(row); }
  public List<Map<String,Object>> projects(String module, int size, int offset) { return mapper.projects(module, size, offset); }
  public int updateProject(Map<String,Object> row) { return mapper.updateProject(row); }

  public Map<String,Object> createJob(String type, String status, Map<String,Object> body) {
    Map<String,Object> row = new java.util.HashMap<>(body == null ? Map.of() : body);
    row.put("jobType", type);
    row.put("status", status);
    row.put("requestedBy", String.valueOf(row.getOrDefault("requestedBy", "system")));
    row.put("detail", String.valueOf(row));
    return mapper.insertJob(row);
  }

  public Map<String,Object> createProjectRecord(String module, Map<String,Object> body) {
    require(body, "title", "제목은 필수입니다.");
    require(body, "owner", "담당자는 필수입니다.");
    Map<String,Object> row = new java.util.HashMap<>(body);
    row.put("module", module);
    row.putIfAbsent("status", defaultStatus(module));
    return mapper.insertProject(row);
  }

  public boolean updateProjectRecord(String module, String recordId, Map<String,Object> body) {
    Map<String,Object> row = new java.util.HashMap<>(body);
    row.put("module", module);
    row.put("recordId", recordId);
    return mapper.updateProject(row) > 0;
  }

  private void require(Map<String,Object> body, String key, String message) {
    Object value = body == null ? null : body.get(key);
    if (value == null || String.valueOf(value).isBlank()) {
      throw new ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }
  }

  private String defaultStatus(String module) {
    return switch(module) {
      case "SCHEDULE" -> "PLANNED";
      case "SCOPE" -> "REGISTERED";
      case "STAFF" -> "ACTIVE";
      case "RISK" -> "REGISTERED";
      case "DELIVERABLE" -> "DRAFT";
      case "CHANGE" -> "REQUESTED";
      default -> "REQUESTED";
    };
  }
}
