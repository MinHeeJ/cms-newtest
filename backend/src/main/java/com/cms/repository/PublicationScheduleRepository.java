package com.cms.repository;
import com.cms.entity.PublicationSchedule;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.*;
public interface PublicationScheduleRepository extends JpaRepository<PublicationSchedule, UUID> {
    @Query("SELECT s FROM PublicationSchedule s WHERE s.status = 'PENDING' AND s.scheduledAt <= :now")
    List<PublicationSchedule> findDue(@Param("now") Instant now);
}
