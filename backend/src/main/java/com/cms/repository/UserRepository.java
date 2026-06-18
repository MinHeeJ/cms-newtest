package com.cms.repository;
import com.cms.entity.CmsUser;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface UserRepository extends JpaRepository<CmsUser, UUID> {
    Optional<CmsUser> findByEmail(String email);
    Optional<CmsUser> findByUsername(String username);
    List<CmsUser> findByRolesContaining(String role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
