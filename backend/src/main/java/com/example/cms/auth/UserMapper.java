package com.example.cms.auth;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

    @Select("""
            select role
            from users
            where username = #{username}
            """)
    String findRoleByUsername(@Param("username") String username);
}
