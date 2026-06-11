package com.example.cms.article;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ArticleMapper {

    @Select("""
            select id, folder_id, title, body_markdown, status, deleted, sort_order, author_name,
                   published_at, created_at, updated_at
            from articles
            where deleted = false
            order by folder_id, sort_order, title
            """)
    List<Article> findAllAdmin();

    @Select("""
            select a.id, a.folder_id, a.title, a.body_markdown, a.status, a.deleted, a.sort_order, a.author_name,
                   a.published_at, a.created_at, a.updated_at
            from articles a
            join folders f on f.id = a.folder_id
            where a.deleted = false
              and a.status = 'PUBLISHED'
              and f.deleted = false
              and f.active = true
              and a.folder_id = #{folderId}
            order by a.sort_order, a.title
            """)
    List<Article> findPublishedByFolder(@Param("folderId") Long folderId);

    @Select("""
            select a.id, a.folder_id, a.title, a.body_markdown, a.status, a.deleted, a.sort_order, a.author_name,
                   a.published_at, a.created_at, a.updated_at
            from articles a
            join folders f on f.id = a.folder_id
            where a.id = #{id}
              and a.deleted = false
              and a.status = 'PUBLISHED'
              and f.deleted = false
              and f.active = true
            """)
    Article findPublishedById(@Param("id") Long id);

    @Select("""
            select id, folder_id, title, body_markdown, status, deleted, sort_order, author_name,
                   published_at, created_at, updated_at
            from articles
            where id = #{id}
              and deleted = false
            """)
    Article findById(@Param("id") Long id);

    @Select("""
            select count(1)
            from articles
            where folder_id = #{folderId}
              and deleted = false
            """)
    int countByFolder(@Param("folderId") Long folderId);

    @Insert("""
            insert into articles(folder_id, title, body_markdown, status, sort_order, author_name)
            values (#{folderId}, #{title}, #{bodyMarkdown}, #{status}, #{sortOrder}, #{authorName})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Article article);

    @Update("""
            update articles
            set folder_id = #{folderId},
                title = #{title},
                body_markdown = #{bodyMarkdown},
                sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int update(Article article);

    @Update("""
            update articles
            set deleted = true,
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int softDelete(@Param("id") Long id);

    @Update("""
            update articles
            set folder_id = #{folderId},
                sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int move(@Param("id") Long id, @Param("folderId") Long folderId, @Param("sortOrder") Integer sortOrder);

    @Update("""
            update articles
            set sort_order = #{sortOrder},
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int sort(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);

    @Update("""
            update articles
            set status = #{status},
                published_at = case when #{status} = 'PUBLISHED' then now() else published_at end,
                updated_at = now()
            where id = #{id}
              and deleted = false
            """)
    int updateStatus(@Param("id") Long id, @Param("status") ArticleStatus status);
}
