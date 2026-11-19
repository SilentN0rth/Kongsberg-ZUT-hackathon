// Przykładowe dane do layoutu. Zastąpi je kolekcje Payload (patrz PLAN.md, Etap 1).
export type Priority = "critical" | "high" | "normal";
export type SyncState = "synced" | "queued";

export type DemoEntry = {
  id: string;
  device: string;
  sector: string;
  symptom: string;
  priority: Priority;
  time: string;
  sync: SyncState;
};

export const demoWatch = {
  label: "Wachta 4/8",
  window: "00:00–04:00",
  role: "III mechanik",
  handoverAt: "04:00",
};

export const demoEntries: DemoEntry[] = [
  {
    id: "e1",
    device: "Pompa 03",
    sector: "Sektor A",
    symptom: "Wyciek",
    priority: "critical",
    time: "03:40",
    sync: "queued",
  },
  {
    id: "e2",
    device: "Ekran 02",
    sector: "Sektor B",
    symptom: "Pęknięty ekran",
    priority: "normal",
    time: "02:15",
    sync: "queued",
  },
  {
    id: "e3",
    device: "Sprężarka 01",
    sector: "Sektor A",
    symptom: "Wibracje",
    priority: "high",
    time: "01:05",
    sync: "synced",
  },
];
