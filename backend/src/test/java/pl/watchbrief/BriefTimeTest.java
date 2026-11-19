package pl.watchbrief;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class BriefTimeTest {
    private static final ZoneId PL = ZoneId.of("Europe/Warsaw");

    @Test
    void winterTimeIsUtcPlusOne() {
        assertEquals("11:00", BriefService.formatTime(Instant.parse("2026-01-15T10:00:00Z"), PL));
    }

    @Test
    void summerTimeIsUtcPlusTwo() {
        assertEquals("12:00", BriefService.formatTime(Instant.parse("2026-07-01T10:00:00Z"), PL));
    }
}
