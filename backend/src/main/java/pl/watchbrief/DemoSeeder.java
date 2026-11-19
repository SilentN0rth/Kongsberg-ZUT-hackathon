package pl.watchbrief;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Dane demo. Przy pustej bazie laduje scenariusz "basic". Pozostale scenariusze i symulator
 * zywych zgloszen sa dostepne przez /api/demo/* (patrz ApiController i scripts/demo.sh).
 *
 * Scenariusze:
 *  - basic    5 wpisow, 1 krytyczny (domyslny, wzorcowy brief)
 *  - quiet    urzadzenia bez zadnych usterek (brief "wachta spokojna")
 *  - busy     18 wpisow rozlozonych na 8 h, czesc potwierdzona/rozwiazana, 2 ze zdjeciem
 *  - critical 6 krytycznych w roznych sektorach + 3 srednie (test przeciazonego briefu)
 */
@Component
public class DemoSeeder {
    public static final List<String> SCENARIOS = List.of("basic", "quiet", "busy", "critical");

    /** Objaw + typowy priorytet; z tego losuje symulator i scenariusz busy. */
    private static final String[][] SYMPTOMS = {
            {"Wyciek", "CRITICAL"}, {"Nietypowy halas", "MEDIUM"}, {"Spadek cisnienia", "MEDIUM"},
            {"Podwyzszona temperatura", "LOW"}, {"Drgania", "LOW"}, {"Brak odpowiedzi", "CRITICAL"},
            {"Zapach spalenizny", "CRITICAL"}, {"Alarm na panelu", "MEDIUM"}};
    private static final String[] NOTES = {
            "Do obserwacji", "Rosnie z godziny na godzine", "Po wymianie filtra bez zmian", "Zglaszal 2. oficer",
            "Bylo juz na poprzedniej wachcie", "Slychac z korytarza", null, null, null};

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
        load("basic");
    }

    /** Czysci dane i laduje scenariusz. Rzuca IllegalArgumentException dla nieznanej nazwy. */
    @Transactional
    public void load(String scenario) {
        if (!SCENARIOS.contains(scenario)) throw new IllegalArgumentException("Nieznany scenariusz: " + scenario);
        handovers.deleteAll();
        reports.deleteAll();
        devices.deleteAll();
        List<Device> ds = devices.saveAll(devices());
        Instant now = Instant.now();
        switch (scenario) {
            case "basic" -> reports.saveAll(List.of(
                    demo("d-1", "pompa-03", "Wyciek", Priority.CRITICAL, "Kropi na uszczelce, rosnie", ago(now, 50)),
                    demo("d-2", "agregat-02", "Nietypowy halas", Priority.MEDIUM, "Stuk co kilka sekund", ago(now, 130)),
                    demo("d-3", "sprezarka-01", "Spadek cisnienia", Priority.MEDIUM, null, ago(now, 200)),
                    demo("d-4", "chlodnica-02", "Podwyzszona temperatura", Priority.LOW, "Do obserwacji", ago(now, 260)),
                    demo("d-5", "wentylator-04", "Drgania", Priority.LOW, null, ago(now, 300))));
            case "quiet" -> { /* brak zgloszen */ }
            case "busy" -> reports.saveAll(busy(ds, now));
            case "critical" -> reports.saveAll(critical(now));
            default -> throw new IllegalStateException();
        }
    }

    /** Dodaje {@code count} losowych zgloszen "z terenu", jakby skanery wlasnie je wyslaly. */
    @Transactional
    public List<Report> simulate(int count) {
        List<Device> ds = devices.findAll();
        if (ds.isEmpty()) throw new IllegalStateException("Brak urzadzen - najpierw zaladuj scenariusz");
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        List<Report> out = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Device d = ds.get(rnd.nextInt(ds.size()));
            String[] s = SYMPTOMS[rnd.nextInt(SYMPTOMS.length)];
            String note = NOTES[rnd.nextInt(NOTES.length)];
            out.add(reports.save(new Report("sim-" + UUID.randomUUID(), d.getId(), s[0],
                    Priority.valueOf(s[1]), note, Instant.now(), null, null)));
        }
        return out;
    }

    private List<Report> busy(List<Device> ds, Instant now) {
        Random rnd = new Random(42); // stala ziarno = te same dane przy kazdym resecie
        List<Report> out = new ArrayList<>();
        for (int i = 0; i < 18; i++) {
            Device d = ds.get(rnd.nextInt(ds.size()));
            String[] s = SYMPTOMS[rnd.nextInt(SYMPTOMS.length)];
            boolean photo = i == 3 || i == 11;
            Report r = new Report("b-" + (i + 1), d.getId(), s[0], Priority.valueOf(s[1]),
                    NOTES[rnd.nextInt(NOTES.length)], ago(now, 10 + i * 26),
                    photo ? samplePhoto(new Color(40 + i * 8, 90, 160)) : null, photo ? "image/png" : null);
            int roll = rnd.nextInt(100);
            if (roll < 25) r.setStatus(ReportStatus.RESOLVED);
            else if (roll < 40) r.setStatus(ReportStatus.ACKNOWLEDGED);
            out.add(r);
        }
        return out;
    }

    private List<Report> critical(Instant now) {
        return List.of(
                demo("c-1", "pompa-03", "Wyciek", Priority.CRITICAL, "Strumien przy uszczelce", ago(now, 12)),
                demo("c-2", "agregat-02", "Zapach spalenizny", Priority.CRITICAL, null, ago(now, 25)),
                demo("c-3", "ster-01", "Brak odpowiedzi", Priority.CRITICAL, "Ster nie reaguje na zadana", ago(now, 31)),
                demo("c-4", "winda-01", "Alarm na panelu", Priority.CRITICAL, null, ago(now, 44)),
                demo("c-5", "separator-01", "Wyciek", Priority.CRITICAL, "Olej na podlodze", ago(now, 58)),
                demo("c-6", "wentylator-04", "Drgania", Priority.CRITICAL, "Mocne, slychac w calej maszynowni", ago(now, 70)),
                demo("c-7", "sprezarka-01", "Spadek cisnienia", Priority.MEDIUM, null, ago(now, 90)),
                demo("c-8", "hydrofor-01", "Nietypowy halas", Priority.MEDIUM, null, ago(now, 120)),
                demo("c-9", "chlodnica-02", "Podwyzszona temperatura", Priority.MEDIUM, "Do obserwacji", ago(now, 150)));
    }

    private static List<Device> devices() {
        return List.of(
                new Device("pompa-01", "A", "Pompa zenna 1", "PZ-0001"),
                new Device("pompa-03", "A", "Pompa paliwa 3", "PP-0003"),
                new Device("agregat-02", "A", "Agregat pradotworczy 2", "AP-0002"),
                new Device("sprezarka-01", "B", "Sprezarka powietrza", "SP-0001"),
                new Device("separator-01", "B", "Separator oleju", "SO-0001"),
                new Device("chlodnica-02", "B", "Chlodnica wody morskiej 2", "CW-0002"),
                new Device("ster-01", "C", "Maszyna sterowa", "MS-0001"),
                new Device("winda-01", "C", "Winda kotwiczna", "WK-0001"),
                new Device("hydrofor-01", "C", "Hydrofor", "HY-0001"),
                new Device("wentylator-04", "D", "Wentylator maszynowni 4", "WM-0004"));
    }

    private static Instant ago(Instant now, int minutes) {
        return now.minus(minutes, ChronoUnit.MINUTES);
    }

    private static Report demo(String id, String dev, String symptom, Priority p, String note, Instant at) {
        return new Report(id, dev, symptom, p, note, at, null, null);
    }

    /** Maly PNG-zaslepka "zdjecia usterki" - do testow wyswietlania zdjec bez prawdziwego aparatu. */
    static byte[] samplePhoto(Color bg) {
        try {
            BufferedImage img = new BufferedImage(160, 120, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = img.createGraphics();
            g.setColor(bg);
            g.fillRect(0, 0, 160, 120);
            g.setColor(Color.WHITE);
            g.drawLine(0, 0, 159, 119);
            g.drawLine(0, 119, 159, 0);
            g.drawRect(2, 2, 155, 115);
            g.dispose();
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ImageIO.write(img, "png", bos);
            return bos.toByteArray();
        } catch (java.io.IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
