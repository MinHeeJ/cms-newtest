package com.example.cms.attachment;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface AttachmentMapper {

    @Select("""
            select id, original_name, storage_key, size_bytes, content_type, extension, deleted, created_at
            from attachments
            where deleted = false
            order by created_at desc
            """)
    List<Attachment> findAllActive();

    @Select("""
            select id, original_name, storage_key, size_bytes, content_type, extension, deleted, created_at
            from attachments
            where id = #{id}
              and deleted = false
            """)
    Attachment findById(@Param("id") Long id);

    @Insert("""
            insert into attachments(original_name, storage_key, size_bytes, content_type, extension)
            values (#{originalName}, #{storageKey}, #{sizeBytes}, #{contentType}, #{extension})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Attachment attachment);

    @Update("""
            update attachments
            set deleted = true
            where id = #{id}
              and deleted = false
            """)
    int softDelete(@Param("id") Long id);
}
