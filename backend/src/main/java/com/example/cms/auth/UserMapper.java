package com.example.cms.auth;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    @Select("""
            select id, username, password_hash, display_name, role, active
            from users
            where username = #{username} and active = true
            """)
    User findActiveByUsername(@Param("username") String username);
}
