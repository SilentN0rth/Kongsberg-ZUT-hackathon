package pl.watchbrief;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.watchbrief.Dto.BriefOut;

/** Generator Handover Brief z szablonu (bez LLM). */
@Service
public class BriefService {
    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneOffset.UTC);

    private final ReportRepository reports;
    private final HandoverRepository handovers;
    private final ReportService reportService;

    public BriefService(ReportRepository reports, HandoverRepository handovers, ReportService reportService) {
        this.reports = reports;
        this.handovers = handovers;
        this.reportService = reportService;
    }

    /** Buduje brief z nierozwiazanych zgloszen i zapisuje go jako nowe przekazanie. */
    @Transactional
    public BriefOut generate() {
        Handover h = handovers.save(new Handover(render()));
        return out(h);
    }

    @Transactional(readOnly = true)
    public BriefOut latest() {
        return handovers.findFirstByOrderByCreatedAtDesc().map(this::out).orElse(null);
    }

    @Transactional
    public BriefOut takeOver(Long id) {
        Handover h = handovers.findById(id).orElseThrow();
        if (h.getTakenOverAt() == null) h.setTakenOverAt(Instant.now());
        return out(h);
    }

    private BriefOut out(Handover h) {
        return new BriefOut(h.getId(), h.getBriefText(), h.getCreatedAt(), h.getTakenOverAt());
    }

    String render() {
        Map<String, Device> dm = reportService.deviceMap();
        List<Report> open = reports.findByStatusNotOrderByPriorityDescCreatedAtDesc(ReportStatus.RESOLVED);
        StringBuilder sb = new StringBuilder("HANDOVER BRIEF\n");
        if (open.isEmpty()) return sb.append("Brak otwartych usterek. Wachta spokojna.").toString();
        long crit = open.stream().filter(r -> r.getPriority() == Priority.CRITICAL).count();
        sb.append("Otwarte usterki: ").append(open.size()).append(", w tym krytyczne: ").append(crit).append("\n\n");
        for (Priority p : new Priority[]{Priority.CRITICAL, Priority.MEDIUM, Priority.LOW}) {
            List<Report> group = open.stream().filter(r -> r.getPriority() == p).toList();
            if (group.isEmpty()) continue;
            sb.append(switch (p) { case CRITICAL -> "KRYTYCZNE"; case MEDIUM -> "SREDNIE"; case LOW -> "NISKIE"; }).append('\n');
            for (Report r : group) {
                Device d = dm.get(r.getDeviceId());
                sb.append("- [").append(d != null ? d.getSector() : "?").append("] ")
                  .append(d != null ? d.getName() : r.getDeviceId())
                  .append(": ").append(r.getSymptom())
                  .append(" (").append(HM.format(r.getCreatedAt())).append(" UTC");
                if (r.getPhoto() != null) sb.append(", zdjecie");
                sb.append(")");
                if (r.getNote() != null && !r.getNote().isBlank()) sb.append(" - ").append(r.getNote());
                sb.append('\n');
            }
            sb.append('\n');
        }
        return sb.toString().stripTrailing();
    }
}
