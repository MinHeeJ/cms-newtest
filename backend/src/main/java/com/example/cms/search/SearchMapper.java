package com.example.cms.search;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SearchMapper {

    @Select("""
            select a.id as article_id,
                   a.folder_id,
                   a.title,
                   case
                     when length(a.body_markdown) > 160 then substring(a.body_markdown from 1 for 160) || '...'
                     else a.body_markdown
                   end as snippet,
                   'ARTICLE' as result_type
            from articles a
            join folders f on f.id = a.folder_id
            where a.deleted = false
              and a.status = 'PUBLISHED'
              and f.deleted = false
              and f.active = true
              and (lower(a.title) like lower(concat('%', #{query}, '%'))
                   or lower(a.body_markdown) like lower(concat('%', #{query}, '%')))
            order by a.published_at desc nulls last, a.updated_at desc
            limit #{limit}
            """)
    List<SearchResult> searchPublished(@Param("query") String query, @Param("limit") int limit);
}
