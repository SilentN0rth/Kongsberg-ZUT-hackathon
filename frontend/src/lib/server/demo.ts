import type { Payload } from "payload";
import type { Priority, SYMPTOMS } from "@/lib/catalog";

type Symptom = (typeof SYMPTOMS)[number];

// Dane startowe i scenariusze demo (przeniesione z DemoSeeder.java).
export const DEVICES = [
  { id: "pompa-01", sector: "A", name: "Pompa zenna 1", serial: "PZ-0001" },
  { id: "pompa-03", sector: "A", name: "Pompa paliwa 3", serial: "PP-0003" },
  { id: "agregat-02", sector: "A", name: "Agregat prądotwórczy 2", serial: "AP-0002" },
  { id: "sprezarka-01", sector: "B", name: "Sprężarka powietrza", serial: "SP-0001" },
  { id: "separator-01", sector: "B", name: "Separator oleju", serial: "SO-0001" },
  { id: "chlodnica-02", sector: "B", name: "Chłodnica wody morskiej 2", serial: "CW-0002" },
  { id: "ster-01", sector: "C", name: "Maszyna sterowa", serial: "MS-0001" },
  { id: "winda-01", sector: "C", name: "Winda kotwiczna", serial: "WK-0001" },
  { id: "hydrofor-01", sector: "C", name: "Hydrofor", serial: "HY-0001" },
  { id: "wentylator-04", sector: "D", name: "Wentylator maszynowni 4", serial: "WM-0004" },
] as const;

export const SCENARIOS = ["basic", "quiet", "busy", "critical"] as const;
export type Scenario = (typeof SCENARIOS)[number];

export const demoToolsEnabled = () =>
  process.env.WATCHBRIEF_DEMO_TOOLS ? process.env.WATCHBRIEF_DEMO_TOOLS === "true" : process.env.NODE_ENV !== "production";

// Objaw + typowy priorytet; z tego losuje symulator i scenariusz „busy”.
const SYMPTOM_PRIORITY: [Symptom, Priority][] = [
  ["Wyciek", "CRITICAL"],
  ["Nietypowy hałas", "MEDIUM"],
  ["Spadek ciśnienia", "MEDIUM"],
  ["Podwyższona temperatura", "LOW"],
  ["Drgania", "LOW"],
  ["Brak odpowiedzi", "CRITICAL"],
  ["Zapach spalenizny", "CRITICAL"],
  ["Alarm na panelu", "MEDIUM"],
];

const NOTES = [
  "Do obserwacji",
  "Rośnie z godziny na godzinę",
  "Po wymianie filtra bez zmian",
  "Zgłaszał 2. oficer",
  "Było już na poprzedniej wachcie",
  "Słychać z korytarza",
  null,
  null,
  null,
];

type NewReport = {
  id: string;
  deviceId: string;
  symptom: Symptom;
  priority: Priority;
  note?: string | null;
  minutesAgo: number;
  status?: "NEW" | "ACKNOWLEDGED" | "RESOLVED";
};

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

// Deterministyczny generator (mulberry32): te same dane przy każdym wczytaniu scenariusza „busy”.
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function createReports(payload: Payload, reports: NewReport[]) {
  for (const r of reports) {
    await payload.create({
      collection: "reports",
      data: {
        id: r.id,
        device: r.deviceId,
        symptom: r.symptom,
        priority: r.priority,
        note: r.note ?? undefined,
        reportedAt: ago(r.minutesAgo),
        status: r.status ?? "NEW",
      },
    });
  }
}

export async function ensureDevices(payload: Payload) {
  const { totalDocs } = await payload.count({ collection: "devices" });
  if (totalDocs > 0) return false;
  for (const d of DEVICES) await payload.create({ collection: "devices", data: { ...d } });
  return true;
}

// Czyści dane i wczytuje scenariusz (kolejność usuwania: najpierw tabele zależne).
export async function loadScenario(payload: Payload, scenario: Scenario) {
  for (const collection of ["queue", "handovers", "reports", "devices"] as const) {
    await payload.delete({ collection, where: { createdAt: { exists: true } } });
  }
  await ensureDevices(payload);

  switch (scenario) {
    case "basic":
      await createReports(payload, [
        { id: "d-1", deviceId: "pompa-03", symptom: "Wyciek", priority: "CRITICAL", note: "Kropi na uszczelce, rośnie", minutesAgo: 50 },
        { id: "d-2", deviceId: "agregat-02", symptom: "Nietypowy hałas", priority: "MEDIUM", note: "Stuk co kilka sekund", minutesAgo: 130 },
        { id: "d-3", deviceId: "sprezarka-01", symptom: "Spadek ciśnienia", priority: "MEDIUM", minutesAgo: 200 },
        { id: "d-4", deviceId: "chlodnica-02", symptom: "Podwyższona temperatura", priority: "LOW", note: "Do obserwacji", minutesAgo: 260 },
        { id: "d-5", deviceId: "wentylator-04", symptom: "Drgania", priority: "LOW", minutesAgo: 300 },
      ]);
      break;
    case "quiet":
      break;
    case "busy": {
      const rnd = seeded(42);
      const reports: NewReport[] = [];
      for (let i = 0; i < 18; i++) {
        const device = DEVICES[Math.floor(rnd() * DEVICES.length)];
        const [symptom, priority] = SYMPTOM_PRIORITY[Math.floor(rnd() * SYMPTOM_PRIORITY.length)];
        const note = NOTES[Math.floor(rnd() * NOTES.length)];
        const roll = Math.floor(rnd() * 100);
        reports.push({
          id: `b-${i + 1}`,
          deviceId: device.id,
          symptom,
          priority,
          note,
          minutesAgo: 10 + i * 26,
          status: roll < 25 ? "RESOLVED" : roll < 40 ? "ACKNOWLEDGED" : "NEW",
        });
      }
      await createReports(payload, reports);
      break;
    }
    case "critical":
      await createReports(payload, [
        { id: "c-1", deviceId: "pompa-03", symptom: "Wyciek", priority: "CRITICAL", note: "Strumień przy uszczelce", minutesAgo: 12 },
        { id: "c-2", deviceId: "agregat-02", symptom: "Zapach spalenizny", priority: "CRITICAL", minutesAgo: 25 },
        { id: "c-3", deviceId: "ster-01", symptom: "Brak odpowiedzi", priority: "CRITICAL", note: "Ster nie reaguje na zadaną", minutesAgo: 31 },
        { id: "c-4", deviceId: "winda-01", symptom: "Alarm na panelu", priority: "CRITICAL", minutesAgo: 44 },
        { id: "c-5", deviceId: "separator-01", symptom: "Wyciek", priority: "CRITICAL", note: "Olej na podłodze", minutesAgo: 58 },
        { id: "c-6", deviceId: "wentylator-04", symptom: "Drgania", priority: "CRITICAL", note: "Mocne, słychać w całej maszynowni", minutesAgo: 70 },
        { id: "c-7", deviceId: "sprezarka-01", symptom: "Spadek ciśnienia", priority: "MEDIUM", minutesAgo: 90 },
        { id: "c-8", deviceId: "hydrofor-01", symptom: "Nietypowy hałas", priority: "MEDIUM", minutesAgo: 120 },
        { id: "c-9", deviceId: "chlodnica-02", symptom: "Podwyższona temperatura", priority: "MEDIUM", note: "Do obserwacji", minutesAgo: 150 },
      ]);
      break;
  }
}

// Losowe zgłoszenia „ze skanerów”, do pokazu live na liście mostka.
export async function simulate(payload: Payload, count: number) {
  const reports: NewReport[] = [];
  for (let i = 0; i < count; i++) {
    const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    const [symptom, priority] = SYMPTOM_PRIORITY[Math.floor(Math.random() * SYMPTOM_PRIORITY.length)];
    reports.push({
      id: `sim-${crypto.randomUUID()}`,
      deviceId: device.id,
      symptom,
      priority,
      note: NOTES[Math.floor(Math.random() * NOTES.length)],
      minutesAgo: 0,
    });
  }
  await createReports(payload, reports);
  return reports.length;
}
