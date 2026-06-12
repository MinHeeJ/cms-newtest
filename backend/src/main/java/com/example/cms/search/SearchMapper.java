package com.example.cms.search;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SearchMapper {
    @Select("""
            select a.id as article_id,
                   a.folder_id,
                   a.title,
                   f.title as folder_title,
                   substring(a.body from 1 for 180) as snippet
            from articles a
            join folders f on f.id = a.folder_id
            where a.status = 'PUBLISHED'
              and a.deleted = false
              and f.active = true
              and f.deleted = false
              and (a.title ilike concat('%', #{query}, '%') or a.body ilike concat('%', #{query}, '%'))
            order by a.published_at desc nulls last, a.id desc
            limit #{limit}
            """)
    List<SearchResult> search(@Param("query") String query, @Param("limit") int limit);
}
