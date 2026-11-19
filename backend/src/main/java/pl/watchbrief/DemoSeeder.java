package pl.watchbrief;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Dane demo: urzadzenia + wpisy. Odpala sie przy pustej bazie oraz po POST /api/demo/reset. */
@Component
public class DemoSeeder {
    private final DeviceRepository devices;
    private final ReportRepository reports;
    private final HandoverRepository handovers;
    private final boolean seedOnEmpty;

    public DemoSeeder(DeviceRepository devices, ReportRepository reports, HandoverRepository handovers,
                      @Value("${watchbrief.seed-on-empty}") boolean seedOnEmpty) {
        this.devices = devices;
        this.reports = reports;
        this.handovers = handovers;
        this.seedOnEmpty = seedOnEmpty;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onStart() {
        if (seedOnEmpty && devices.count() == 0) reset();
    }

    @Transactional
    public void reset() {
        handovers.deleteAll();
        reports.deleteAll();
        devices.deleteAll();
        devices.saveAll(List.of(
                new Device("pompa-01", "A", "Pompa zenna 1", "PZ-0001"),
                new Device("pompa-03", "A", "Pompa paliwa 3", "PP-0003"),
                new Device("agregat-02", "A", "Agregat pradotworczy 2", "AP-0002"),
                new Device("sprezarka-01", "B", "Sprezarka powietrza", "SP-0001"),
                new Device("separator-01", "B", "Separator oleju", "SO-0001"),
                new Device("chlodnica-02", "B", "Chlodnica wody morskiej 2", "CW-0002"),
                new Device("ster-01", "C", "Maszyna sterowa", "MS-0001"),
                new Device("winda-01", "C", "Winda kotwiczna", "WK-0001"),
                new Device("hydrofor-01", "C", "Hydrofor", "HY-0001"),
                new Device("wentylator-04", "D", "Wentylator maszynowni 4", "WM-0004")));
        Instant now = Instant.now();
        reports.saveAll(List.of(
                demo("d-1", "pompa-03", "Wyciek", Priority.CRITICAL, "Kropi na uszczelce, rosnie", now.minus(50, ChronoUnit.MINUTES)),
                demo("d-2", "agregat-02", "Nietypowy halas", Priority.MEDIUM, "Stuk co kilka sekund", now.minus(130, ChronoUnit.MINUTES)),
                demo("d-3", "sprezarka-01", "Spadek cisnienia", Priority.MEDIUM, null, now.minus(200, ChronoUnit.MINUTES)),
                demo("d-4", "chlodnica-02", "Podwyzszona temperatura", Priority.LOW, "Do obserwacji", now.minus(260, ChronoUnit.MINUTES)),
                demo("d-5", "wentylator-04", "Drgania", Priority.LOW, null, now.minus(300, ChronoUnit.MINUTES))));
    }

    private static Report demo(String id, String dev, String symptom, Priority p, String note, Instant at) {
        return new Report(id, dev, symptom, p, note, at, null, null);
    }
}
