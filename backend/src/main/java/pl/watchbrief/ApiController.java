package pl.watchbrief;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    @GetMapping("/reports/{id}/photo")
    public ResponseEntity<byte[]> photo(@PathVariable String id) {
        Report r = reports.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (r.getPhoto() == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(r.getPhotoType()))
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(1)).cachePublic())
                .body(r.getPhoto());
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

    @PostMapping("/demo/reset")
    public String reset() {
        seeder.reset();
        return "reset";
    }
}
