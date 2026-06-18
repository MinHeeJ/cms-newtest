package com.cms.repository;
import com.cms.entity.NavigationMenu;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface NavigationMenuRepository extends JpaRepository<NavigationMenu, UUID> {}
