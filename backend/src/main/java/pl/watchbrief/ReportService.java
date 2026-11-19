package pl.watchbrief;

import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.watchbrief.Dto.ReportIn;
import pl.watchbrief.Dto.ReportOut;

@Service
public class ReportService {
    private final ReportRepository reports;
    private final DeviceRepository devices;

    public ReportService(ReportRepository reports, DeviceRepository devices) {
        this.reports = reports;
        this.devices = devices;
    }

    /** Idempotentne: ponowna wysylka tego samego id zwraca istniejacy wpis. */
    @Transactional
    public ReportOut save(ReportIn in) {
        Report existing = reports.findById(in.id()).orElse(null);
        if (existing != null) return toOut(existing, deviceMap());
        byte[] photo = null;
        String type = null;
        if (in.photoBase64() != null && !in.photoBase64().isBlank()) {
            String raw = in.photoBase64();
            type = "image/jpeg";
            int comma = raw.indexOf(',');
            if (raw.startsWith("data:") && comma > 0) {
                String meta = raw.substring(5, raw.indexOf(';') > 0 ? raw.indexOf(';') : comma);
                if (!meta.isBlank()) type = meta;
                raw = raw.substring(comma + 1);
            }
            photo = Base64.getDecoder().decode(raw);
        }
        Report r = new Report(in.id(), in.deviceId(), in.symptom(), in.priority(), in.note(),
                in.createdAt() != null ? in.createdAt() : Instant.now(), photo, type);
        return toOut(reports.save(r), deviceMap());
    }

    @Transactional(readOnly = true)
    public List<ReportOut> list(Instant since) {
        Map<String, Device> dm = deviceMap();
        List<Report> rs = since == null
                ? reports.findAllByOrderByCreatedAtDesc()
                : reports.findByReceivedAtAfterOrderByCreatedAtDesc(since);
        return rs.stream().map(r -> toOut(r, dm)).toList();
    }

    Map<String, Device> deviceMap() {
        return devices.findAll().stream().collect(Collectors.toMap(Device::getId, Function.identity()));
    }

    static ReportOut toOut(Report r, Map<String, Device> dm) {
        Device d = dm.get(r.getDeviceId());
        return new ReportOut(r.getId(), r.getDeviceId(), d != null ? d.getName() : r.getDeviceId(),
                d != null ? d.getSector() : null, r.getSymptom(), r.getPriority(), r.getNote(),
                r.getCreatedAt(), r.getReceivedAt(), r.getStatus(), r.getPhoto() != null);
    }
}
