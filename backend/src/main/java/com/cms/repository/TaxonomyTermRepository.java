package com.cms.repository;
import com.cms.entity.TaxonomyTerm;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface TaxonomyTermRepository extends JpaRepository<TaxonomyTerm, UUID> {
    List<TaxonomyTerm> findByType(String type);
    boolean existsBySlug(String slug);
}
