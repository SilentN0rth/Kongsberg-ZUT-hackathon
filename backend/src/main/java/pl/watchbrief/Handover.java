package pl.watchbrief;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import java.time.Instant;

/** Przekazanie wachty: wygenerowany brief + moment przejecia przez zmiennika. */
@Entity
public class Handover {
    @Id
    @GeneratedValue
    private Long id;
    private Instant createdAt = Instant.now();
    @Column(length = 8000)
    private String briefText;
    private Instant takenOverAt;

    protected Handover() {}

    public Handover(String briefText) { this.briefText = briefText; }

    public Long getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }
    public String getBriefText() { return briefText; }
    public Instant getTakenOverAt() { return takenOverAt; }
    public void setTakenOverAt(Instant t) { this.takenOverAt = t; }
}
