package com.cms;

import org.apache.ibatis.annotations.*;
import java.util.*;

@Mapper
public interface CmsMapper {
  @Select("SELECT 1") int ping();

  @Select("""
    INSERT INTO cms_folders(name,parent_folder_id,active,sort_order,created_by,updated_by)
    VALUES(#{name}, #{parentFolderId}::uuid, #{active}, COALESCE(#{sortOrder},0), #{actor}, #{actor})
    RETURNING folder_id AS "folderId", name, parent_folder_id AS "parentFolderId", active, sort_order AS "sortOrder", created_at AS "createdAt"
    """)
  Map<String,Object> insertFolder(Map<String,Object> row);

  @Select("""
    SELECT folder_id AS "folderId", name, parent_folder_id AS "parentFolderId", active, sort_order AS "sortOrder", deleted
    FROM cms_folders WHERE deleted=false ORDER BY sort_order, name
    """)
  List<Map<String,Object>> folders();

  @Update("""
    UPDATE cms_folders SET name=COALESCE(#{name},name), active=COALESCE(#{active},active),
    parent_folder_id=COALESCE(#{parentFolderId}::uuid,parent_folder_id), sort_order=COALESCE(#{sortOrder},sort_order),
    updated_at=now(), updated_by=#{actor} WHERE folder_id=#{folderId}::uuid AND deleted=false
    """)
  int updateFolder(Map<String,Object> row);

  @Update("""
    UPDATE cms_folders SET deleted=true, active=false, updated_at=now(), updated_by=#{actor}
    WHERE folder_id=#{folderId}::uuid AND deleted=false
    AND NOT EXISTS (SELECT 1 FROM cms_documents d WHERE d.folder_id=cms_folders.folder_id AND d.deleted=false)
    """)
  int deleteFolder(Map<String,Object> row);

  @Select("""
    INSERT INTO cms_documents(folder_id,title,markdown_body,status,display_order,created_by,updated_by)
    VALUES(#{folderId}::uuid, #{title}, #{markdownBody}, 'DRAFT', COALESCE(#{displayOrder},0), #{actor}, #{actor})
    RETURNING document_id AS "documentId", folder_id AS "folderId", title, markdown_body AS "markdownBody", status, version, created_at AS "createdAt"
    """)
  Map<String,Object> insertDocument(Map<String,Object> row);

  @Select("""
    SELECT document_id AS "documentId", folder_id AS "folderId", title, markdown_body AS "markdownBody", status,
    version, published_at AS "publishedAt", display_order AS "displayOrder"
    FROM cms_documents WHERE deleted=false ORDER BY updated_at DESC LIMIT #{size} OFFSET #{offset}
    """)
  List<Map<String,Object>> documents(@Param("size") int size, @Param("offset") int offset);

  @Select("""
    SELECT document_id AS "documentId", folder_id AS "folderId", title, markdown_body AS "markdownBody", status, version, published_at AS "publishedAt"
    FROM cms_documents WHERE document_id=#{documentId}::uuid AND deleted=false
    """)
  Map<String,Object> document(@Param("documentId") String documentId);

  @Update("""
    UPDATE cms_documents SET title=COALESCE(#{title},title), markdown_body=COALESCE(#{markdownBody},markdown_body),
    folder_id=COALESCE(#{folderId}::uuid,folder_id), status=CASE WHEN status='PUBLISHED' THEN 'REVIEW' ELSE status END,
    version=version+1, updated_at=now(), updated_by=#{actor}
    WHERE document_id=#{documentId}::uuid AND deleted=false
    """)
  int updateDocument(Map<String,Object> row);

  @Update("""
    UPDATE cms_documents SET status='PUBLISHED', published_at=now(), version=version+1, updated_at=now(), updated_by=#{actor}
    WHERE document_id=#{documentId}::uuid AND deleted=false AND status IN ('DRAFT','REVIEW','UNPUBLISHED')
    """)
  int publish(Map<String,Object> row);

  @Update("""
    UPDATE cms_documents SET status='UNPUBLISHED', version=version+1, updated_at=now(), updated_by=#{actor}
    WHERE document_id=#{documentId}::uuid AND deleted=false AND status='PUBLISHED'
    """)
  int unpublish(Map<String,Object> row);

  @Update("""
    UPDATE cms_documents SET status='DELETED', deleted=true, version=version+1, updated_at=now(), updated_by=#{actor}
    WHERE document_id=#{documentId}::uuid AND deleted=false
    """)
  int deleteDocument(Map<String,Object> row);

  @Select("""
    SELECT d.document_id AS "documentId", d.folder_id AS "folderId", d.title, d.markdown_body AS "markdownBody", d.status, f.name AS "folderName"
    FROM cms_documents d JOIN cms_folders f ON f.folder_id=d.folder_id
    WHERE d.document_id=#{documentId}::uuid AND d.deleted=false AND d.status='PUBLISHED' AND f.active=true AND f.deleted=false
    """)
  Map<String,Object> portalDocument(@Param("documentId") String documentId);

  @Select("""
    SELECT d.document_id AS "documentId", d.title, left(d.markdown_body, 180) AS summary, f.name AS "folderName"
    FROM cms_documents d JOIN cms_folders f ON f.folder_id=d.folder_id
    WHERE d.deleted=false AND d.status='PUBLISHED' AND f.active=true AND f.deleted=false
    AND (d.title ILIKE concat('%',#{query},'%') OR d.markdown_body ILIKE concat('%',#{query},'%'))
    ORDER BY d.published_at DESC LIMIT #{size} OFFSET #{offset}
    """)
  List<Map<String,Object>> search(@Param("query") String query, @Param("size") int size, @Param("offset") int offset);

  @Select("""
    SELECT d.folder_id AS "folderId", d.document_id AS "documentId", d.title, d.status
    FROM cms_documents d WHERE d.deleted=false AND d.status='PUBLISHED' ORDER BY d.display_order, d.title
    """)
  List<Map<String,Object>> publishedDocuments();

  @Select("""
    INSERT INTO cms_attachments(document_id,file_name,content_type,size_bytes,storage_key,created_by,updated_by)
    VALUES(#{documentId}::uuid, #{fileName}, #{contentType}, #{sizeBytes}, concat('attachments/', gen_random_uuid(), '/', regexp_replace(#{fileName}, '[^a-zA-Z0-9._-]', '_', 'g')), #{actor}, #{actor})
    RETURNING attachment_id AS "attachmentId", document_id AS "documentId", file_name AS "fileName", content_type AS "contentType", size_bytes AS "sizeBytes", storage_key AS "storageKey", status
    """)
  Map<String,Object> insertAttachment(Map<String,Object> row);

  @Select("""
    SELECT attachment_id AS "attachmentId", document_id AS "documentId", file_name AS "fileName", content_type AS "contentType", size_bytes AS "sizeBytes", status
    FROM cms_attachments WHERE document_id=#{documentId}::uuid AND deleted=false ORDER BY created_at DESC
    """)
  List<Map<String,Object>> attachments(@Param("documentId") String documentId);

  @Select("""
    SELECT attachment_id AS "attachmentId", file_name AS "downloadName", content_type AS "contentType", size_bytes AS "sizeBytes", storage_key AS "storageKey"
    FROM cms_attachments WHERE attachment_id=#{attachmentId}::uuid AND deleted=false AND status='AVAILABLE'
    """)
  Map<String,Object> attachment(@Param("attachmentId") String attachmentId);

  @Update("""
    UPDATE cms_attachments SET deleted=true, status='DELETED', updated_at=now(), updated_by=#{actor}
    WHERE attachment_id=#{attachmentId}::uuid AND deleted=false
    """)
  int deleteAttachment(Map<String,Object> row);

  @Select("""
    INSERT INTO cms_audit_logs(actor,action,target_type,target_id,detail)
    VALUES(#{actor}, #{action}, #{targetType}, #{targetId}, #{detail})
    RETURNING audit_log_id AS "auditLogId", actor, action, target_type AS "targetType", target_id AS "targetId", created_at AS "createdAt"
    """)
  Map<String,Object> audit(Map<String,Object> row);

  @Select("""
    SELECT audit_log_id AS "auditLogId", actor, action, target_type AS "targetType", target_id AS "targetId", detail, created_at AS "createdAt"
    FROM cms_audit_logs ORDER BY created_at DESC LIMIT #{size} OFFSET #{offset}
    """)
  List<Map<String,Object>> auditLogs(@Param("size") int size, @Param("offset") int offset);

  @Select("""
    INSERT INTO cms_operation_jobs(job_type,status,requested_by,detail) VALUES(#{jobType}, #{status}, #{requestedBy}, #{detail})
    RETURNING job_id AS "jobId", job_type AS "jobType", status, requested_by AS "requestedBy", detail, created_at AS "createdAt"
    """)
  Map<String,Object> insertJob(Map<String,Object> row);

  @Select("""
    SELECT job_id AS "jobId", job_type AS "jobType", status, requested_by AS "requestedBy", detail, created_at AS "createdAt"
    FROM cms_operation_jobs WHERE job_type=#{jobType} ORDER BY created_at DESC LIMIT #{size} OFFSET #{offset}
    """)
  List<Map<String,Object>> jobs(@Param("jobType") String jobType, @Param("size") int size, @Param("offset") int offset);

  @Select("""
    SELECT job_id AS "jobId", job_type AS "jobType", status, requested_by AS "requestedBy", detail, created_at AS "createdAt"
    FROM cms_operation_jobs WHERE job_id=#{jobId}::uuid
    """)
  Map<String,Object> job(@Param("jobId") String jobId);

  @Update("UPDATE cms_operation_jobs SET status='RESTORE_REQUESTED', updated_at=now() WHERE job_id=#{jobId}::uuid")
  int restore(@Param("jobId") String jobId);

  @Select("""
    INSERT INTO cms_project_records(module,title,owner,status,severity,version,approval_state,detail)
    VALUES(#{module}, #{title}, #{owner}, #{status}, #{severity}, #{version}, #{approvalState}, #{detail})
    RETURNING record_id AS "recordId", module, title, owner, status, severity, version, approval_state AS "approvalState", detail, created_at AS "createdAt"
    """)
  Map<String,Object> insertProject(Map<String,Object> row);

  @Select("""
    SELECT record_id AS "recordId", module, title, owner, status, severity, version, approval_state AS "approvalState", detail, created_at AS "createdAt"
    FROM cms_project_records WHERE module=#{module} ORDER BY created_at DESC LIMIT #{size} OFFSET #{offset}
    """)
  List<Map<String,Object>> projects(@Param("module") String module, @Param("size") int size, @Param("offset") int offset);

  @Update("""
    UPDATE cms_project_records SET title=COALESCE(#{title},title), owner=COALESCE(#{owner},owner), status=COALESCE(#{status},status),
    severity=COALESCE(#{severity},severity), version=COALESCE(#{version},version), approval_state=COALESCE(#{approvalState},approval_state), detail=COALESCE(#{detail},detail), updated_at=now()
    WHERE record_id=#{recordId}::uuid AND module=#{module}
    """)
  int updateProject(Map<String,Object> row);
}
