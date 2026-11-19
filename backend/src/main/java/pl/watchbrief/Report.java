package pl.watchbrief;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import java.time.Instant;

/** Zgloszenie usterki. id generuje klient (UUID) - dzieki temu ponowna wysylka z kolejki offline jest idempotentna. */
@Entity
public class Report {
    @Id
    private String id;
    private String deviceId;
    private String symptom;
    @Enumerated(EnumType.STRING)
    private Priority priority;
    @Column(length = 2000)
    private String note;
    private Instant createdAt;
    private Instant receivedAt;
    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.NEW;

    protected Report() {}

    public Report(String id, String deviceId, String symptom, Priority priority, String note,
                  Instant createdAt) {
        this.id = id;
        this.deviceId = deviceId;
        this.symptom = symptom;
        this.priority = priority;
        this.note = note;
        this.createdAt = createdAt;
        this.receivedAt = Instant.now();
    }

    public String getId() { return id; }
    public String getDeviceId() { return deviceId; }
    public String getSymptom() { return symptom; }
    public Priority getPriority() { return priority; }
    public String getNote() { return note; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReceivedAt() { return receivedAt; }
    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }
}
