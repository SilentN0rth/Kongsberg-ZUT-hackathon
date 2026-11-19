package pl.watchbrief;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/** Ksztalty JSON-a wymieniane z frontendem (Next.js / Dexie). */
public final class Dto {
    private Dto() {}

    /** photoBase64: czyste base64 lub data URL ("data:image/jpeg;base64,..."). */
    public record ReportIn(
            @NotBlank String id,
            @NotBlank String deviceId,
            @NotBlank String symptom,
            @NotNull Priority priority,
            String note,
            Instant createdAt,
            String photoBase64) {}

    public record ReportOut(
            String id, String deviceId, String deviceName, String sector, String symptom,
            Priority priority, String note, Instant createdAt, Instant receivedAt,
            ReportStatus status, boolean hasPhoto) {}

    public record StatusIn(@NotNull ReportStatus status) {}

    public record BriefOut(Long handoverId, String text, Instant createdAt, Instant takenOverAt) {}
}
