package com.example.cms.attachment;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface AttachmentMapper extends BaseMapper<Attachment> {
    @Select("""
            select id, ref_type, ref_id, original_name, storage_key, size_bytes, content_type, extension, deleted, created_at
            from attachments
            where ref_type = #{refType}
              and ref_id = #{refId}
              and deleted = false
            order by id asc
            """)
    List<Attachment> listActive(@Param("refType") String refType, @Param("refId") Long refId);

    @Select("""
            select id, ref_type, ref_id, original_name, storage_key, size_bytes, content_type, extension, deleted, created_at
            from attachments
            where id = #{id} and deleted = false
            """)
    Attachment findActive(@Param("id") Long id);

    @Insert("""
            insert into attachments(ref_type, ref_id, original_name, storage_key, size_bytes, content_type, extension, deleted)
            values(#{refType}, #{refId}, #{originalName}, #{storageKey}, #{sizeBytes}, #{contentType}, #{extension}, false)
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertAttachment(Attachment attachment);

    @Update("""
            update attachments
            set deleted = true
            where id = #{id} and deleted = false
            """)
    int markDeleted(@Param("id") Long id);
}
