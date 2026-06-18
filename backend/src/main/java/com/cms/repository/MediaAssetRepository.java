package com.cms.repository;
import com.cms.entity.MediaAsset;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
public interface MediaAssetRepository extends JpaRepository<MediaAsset, java.util.UUID> {
    Page<MediaAsset> findAll(Pageable pageable);
}
