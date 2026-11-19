package pl.watchbrief;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/** Ksztalty JSON-a wymieniane z frontendem (Next.js / Dexie). */
public final class Dto {
    private Dto() {}

    public record ReportIn(
            @NotBlank String id,
            @NotBlank String deviceId,
            @NotBlank String symptom,
            @NotNull Priority priority,
            String note,
            Instant createdAt) {}

    public record ReportOut(
            String id, String deviceId, String deviceName, String sector, String symptom,
            Priority priority, String note, Instant createdAt, Instant receivedAt,
            ReportStatus status) {}

    public record StatusIn(@NotNull ReportStatus status) {}

    public record BriefOut(Long handoverId, String text, Instant createdAt, Instant takenOverAt) {}
}
