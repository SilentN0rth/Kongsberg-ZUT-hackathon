package pl.watchbrief;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.watchbrief.Dto.BriefOut;

/** Generator Handover Brief z szablonu (bez LLM). */
@Service
public class BriefService {
    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DM_HM = DateTimeFormatter.ofPattern("dd.MM HH:mm");

    private final ReportRepository reports;
    private final HandoverRepository handovers;
    private final ReportService reportService;
    private final ZoneId zone;

    /** Czas w briefie wg strefy z watchbrief.timezone (domyslnie Polska, z automatyczna zmiana lato/zima). */
    public BriefService(ReportRepository reports, HandoverRepository handovers, ReportService reportService,
                        @Value("${watchbrief.timezone:Europe/Warsaw}") String timezone) {
        this.zone = ZoneId.of(timezone);
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
        StringBuilder sb = new StringBuilder("HANDOVER BRIEF\nStan na: ")
                .append(DM_HM.format(Instant.now().atZone(zone))).append("\n");
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
                  .append(" (").append(formatTime(r.getCreatedAt(), zone));
                sb.append(")");
                if (r.getNote() != null && !r.getNote().isBlank()) sb.append(" - ").append(r.getNote());
                sb.append('\n');
            }
            sb.append('\n');
        }
        return sb.toString().stripTrailing();
    }

    static String formatTime(Instant t, ZoneId zone) {
        return HM.format(t.atZone(zone));
    }
}
