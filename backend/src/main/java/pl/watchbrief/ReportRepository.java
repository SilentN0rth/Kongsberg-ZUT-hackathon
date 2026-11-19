package pl.watchbrief;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByReceivedAtAfterOrderByCreatedAtDesc(Instant since);
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByStatusNotOrderByPriorityDescCreatedAtDesc(ReportStatus status);
}
