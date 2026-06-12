package com.example.cms.article;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ArticleMapper extends BaseMapper<Article> {
    @Select("""
            select a.id, a.folder_id, a.title, a.body, a.status, a.deleted, a.sort_order, a.published_at, a.created_at, a.updated_at
            from articles a
            join folders f on f.id = a.folder_id
            where a.folder_id = #{folderId}
              and a.status = 'PUBLISHED'
              and a.deleted = false
              and f.active = true
              and f.deleted = false
            order by a.sort_order asc, a.id asc
            """)
    List<Article> listPortalByFolder(@Param("folderId") Long folderId);

    @Select("""
            select a.id, a.folder_id, a.title, a.body, a.status, a.deleted, a.sort_order, a.published_at, a.created_at, a.updated_at
            from articles a
            join folders f on f.id = a.folder_id
            where a.id = #{id}
              and a.status = 'PUBLISHED'
              and a.deleted = false
              and f.active = true
              and f.deleted = false
            """)
    Article findPublished(@Param("id") Long id);

    @Select("""
            <script>
            select id, folder_id, title, body, status, deleted, sort_order, published_at, created_at, updated_at
            from articles
            where deleted = false
              <if test="folderId != null">and folder_id = #{folderId}</if>
            order by folder_id, sort_order asc, id asc
            </script>
            """)
    List<Article> listAdmin(@Param("folderId") Long folderId);

    @Select("""
            select id, folder_id, title, body, status, deleted, sort_order, published_at, created_at, updated_at
            from articles
            where id = #{id} and deleted = false
            """)
    Article findNotDeleted(@Param("id") Long id);

    @Insert("""
            insert into articles(folder_id, title, body, status, deleted, sort_order)
            values(#{folderId}, #{title}, #{body}, #{status}, false, #{sortOrder})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertArticle(Article article);

    @Update("""
            update articles
            set folder_id = #{folderId},
                title = #{title},
                body = #{body},
                sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id} and deleted = false
            """)
    int updateArticle(Article article);

    @Update("""
            update articles
            set deleted = true, updated_at = now()
            where id = #{id} and deleted = false
            """)
    int markDeleted(@Param("id") Long id);

    @Update("""
            update articles
            set folder_id = #{folderId}, updated_at = now()
            where id = #{id} and deleted = false
            """)
    int move(@Param("id") Long id, @Param("folderId") Long folderId);

    @Update("""
            update articles
            set sort_order = #{sortOrder}, updated_at = now()
            where id = #{id} and deleted = false
            """)
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") int sortOrder);

    @Update("""
            update articles
            set status = #{status},
                published_at = case when #{status} = 'PUBLISHED' then now() else published_at end,
                updated_at = now()
            where id = #{id} and deleted = false
            """)
    int updateStatus(@Param("id") Long id, @Param("status") String status);
}
