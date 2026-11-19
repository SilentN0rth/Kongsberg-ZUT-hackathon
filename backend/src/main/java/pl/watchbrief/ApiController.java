package pl.watchbrief;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pl.watchbrief.Dto.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final DeviceRepository devices;
    private final ReportRepository reports;
    private final ReportService reportService;
    private final BriefService briefService;
    private final DemoSeeder seeder;

    public ApiController(DeviceRepository devices, ReportRepository reports, ReportService reportService,
                         BriefService briefService, DemoSeeder seeder) {
        this.devices = devices;
        this.reports = reports;
        this.reportService = reportService;
        this.briefService = briefService;
        this.seeder = seeder;
    }

    @GetMapping("/health")
    public String health() { return "ok"; }

    @GetMapping("/devices")
    public List<Device> devices() { return devices.findAllByOrderBySectorAscIdAsc(); }

    @GetMapping("/devices/{id}")
    public Device device(@PathVariable String id) {
        return devices.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    /** Wywolywane przez kolejke offline (Dexie). Idempotentne po id. */
    @PostMapping("/reports")
    public ResponseEntity<ReportOut> create(@Valid @RequestBody ReportIn in) {
        if (!devices.existsById(in.deviceId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieznane urzadzenie: " + in.deviceId());
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.save(in));
    }

    /** ?since=ISO-8601 -> tylko nowe wpisy (do pollingu skrzynki serwisu co ~2 s). */
    @GetMapping("/reports")
    public List<ReportOut> list(@RequestParam(required = false) Instant since) {
        return reportService.list(since);
    }

    @PatchMapping("/reports/{id}/status")
    public ReportOut status(@PathVariable String id, @Valid @RequestBody StatusIn in) {
        Report r = reports.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        r.setStatus(in.status());
        reports.save(r);
        return ReportService.toOut(r, reportService.deviceMap());
    }

    /** Buduje i zapisuje nowy brief z otwartych usterek. */
    @PostMapping("/handover/brief")
    public BriefOut brief() { return briefService.generate(); }

    @GetMapping("/handover/latest")
    public ResponseEntity<BriefOut> latest() {
        BriefOut b = briefService.latest();
        return b == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(b);
    }

    /** "Przejmuje wachte". */
    @PostMapping("/handover/{id}/take")
    public BriefOut take(@PathVariable Long id) { return briefService.takeOver(id); }

    // --- Narzedzia demo / testowe -------------------------------------------------

    /** Reset do scenariusza "basic". */
    @PostMapping("/demo/reset")
    public String reset() {
        seeder.reset();
        return "reset";
    }

    @GetMapping("/demo/scenarios")
    public List<String> scenarios() { return DemoSeeder.SCENARIOS; }

    /** Czysci dane i laduje scenariusz: basic | quiet | busy | critical. */
    @PostMapping("/demo/scenarios/{name}")
    public String scenario(@PathVariable String name) {
        try {
            seeder.load(name);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        return "loaded " + name;
    }

    /** Symuluje zgloszenia ze skanerow (losowe urzadzenie/objaw), 1-20 naraz. */
    @PostMapping("/demo/simulate")
    public List<ReportOut> simulate(@RequestParam(defaultValue = "1") int count) {
        if (count < 1 || count > 20) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "count musi byc 1-20");
        java.util.Map<String, Device> dm = reportService.deviceMap();
        return seeder.simulate(count).stream().map(r -> ReportService.toOut(r, dm)).toList();
    }
}
