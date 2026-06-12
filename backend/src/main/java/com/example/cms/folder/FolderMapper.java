package com.example.cms.folder;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface FolderMapper extends BaseMapper<Folder> {
    @Select("""
            <script>
            select id, parent_id, title, description, active, deleted, sort_order, created_at, updated_at
            from folders
            where deleted = false
              and active = true
              <if test="parentId == null">and parent_id is null</if>
              <if test="parentId != null">and parent_id = #{parentId}</if>
            order by sort_order asc, id asc
            </script>
            """)
    List<Folder> listPortalChildren(@Param("parentId") Long parentId);

    @Select("""
            select id, parent_id, title, description, active, deleted, sort_order, created_at, updated_at
            from folders
            where deleted = false
            order by coalesce(parent_id, 0), sort_order asc, id asc
            """)
    List<Folder> listAdmin();

    @Select("""
            select id, parent_id, title, description, active, deleted, sort_order, created_at, updated_at
            from folders
            where id = #{id} and deleted = false
            """)
    Folder findNotDeleted(@Param("id") Long id);

    @Select("""
            select count(*)
            from folders
            where parent_id = #{folderId} and deleted = false
            """)
    int countChildren(@Param("folderId") Long folderId);

    @Select("""
            select count(*)
            from articles
            where folder_id = #{folderId} and deleted = false
            """)
    int countArticles(@Param("folderId") Long folderId);

    @Select("""
            with recursive descendants(id) as (
                select id from folders where parent_id = #{folderId} and deleted = false
                union all
                select f.id from folders f join descendants d on f.parent_id = d.id where f.deleted = false
            )
            select count(*) from descendants where id = #{candidateParentId}
            """)
    int countDescendantMatch(@Param("folderId") Long folderId, @Param("candidateParentId") Long candidateParentId);

    @Insert("""
            insert into folders(parent_id, title, description, active, deleted, sort_order)
            values(#{parentId}, #{title}, #{description}, #{active}, false, #{sortOrder})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertFolder(Folder folder);

    @Update("""
            update folders
            set parent_id = #{parentId},
                title = #{title},
                description = #{description},
                active = #{active},
                sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id} and deleted = false
            """)
    int updateFolder(Folder folder);

    @Update("""
            update folders
            set deleted = true, updated_at = now()
            where id = #{id} and deleted = false
            """)
    int markDeleted(@Param("id") Long id);

    @Update("""
            update folders
            set parent_id = #{parentId}, updated_at = now()
            where id = #{id} and deleted = false
            """)
    int move(@Param("id") Long id, @Param("parentId") Long parentId);

    @Update("""
            update folders
            set sort_order = #{sortOrder}, updated_at = now()
            where id = #{id} and deleted = false
            """)
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") int sortOrder);
}
