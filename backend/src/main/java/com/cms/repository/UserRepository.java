package com.cms.repository;
import com.cms.entity.CmsUser;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface UserRepository extends JpaRepository<CmsUser, UUID> {
    Optional<CmsUser> findByEmail(String email);
    List<CmsUser> findByRolesContaining(String role);
}
