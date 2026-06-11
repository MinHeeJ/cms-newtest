package com.example.cms.folder;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface FolderMapper {

    @Select("""
            select id, parent_id, title, description, active, deleted, sort_order, created_at, updated_at
            from folders
            where deleted = false
            order by coalesce(parent_id, 0), sort_order, title
            """)
    List<Folder> findAllAdmin();

    @Select("""
            select id, parent_id, title, description, active, deleted, sort_order, created_at, updated_at
            from folders
            where deleted = false
              and active = true
              and ((#{parentId}::bigint is null and parent_id is null) or parent_id = #{parentId})
            order by sort_order, title
            """)
    List<Folder> findActiveChildren(@Param("parentId") Long parentId);

    @Select("""
            select id, parent_id, title, description, active, deleted, sort_order, created_at, updated_at
            from folders
            where id = #{id}
              and deleted = false
            """)
    Folder findById(@Param("id") Long id);

    @Select("""
            select count(1)
            from folders
            where parent_id = #{id}
              and deleted = false
            """)
    int countChildren(@Param("id") Long id);

    @Insert("""
            insert into folders(parent_id, title, description, active, sort_order)
            values (#{parentId}, #{title}, #{description}, #{active}, #{sortOrder})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Folder folder);

    @Update("""
            update folders
            set parent_id = #{parentId},
                title = #{title},
                description = #{description},
                active = #{active},
                sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int update(Folder folder);

    @Update("""
            update folders
            set deleted = true,
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int softDelete(@Param("id") Long id);

    @Update("""
            update folders
            set parent_id = #{parentId},
                sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int move(@Param("id") Long id, @Param("parentId") Long parentId, @Param("sortOrder") Integer sortOrder);

    @Update("""
            update folders
            set sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int sort(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);
}
