package pl.watchbrief;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Urzadzenie na statku. id to slug uzywany w linkach QR, np. "pompa-03". */
@Entity
public class Device {
    @Id
    private String id;
    private String sector;
    private String name;
    private String serial;

    protected Device() {}

    public Device(String id, String sector, String name, String serial) {
        this.id = id;
        this.sector = sector;
        this.name = name;
        this.serial = serial;
    }

    public String getId() { return id; }
    public String getSector() { return sector; }
    public String getName() { return name; }
    public String getSerial() { return serial; }
}
