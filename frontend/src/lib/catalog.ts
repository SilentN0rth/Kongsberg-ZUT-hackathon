// Stałe zgodne z backendem (backend/src/main/java/pl/watchbrief). Urządzenia i zgłoszenia pochodzą z API.
export type Priority = "LOW" | "MEDIUM" | "CRITICAL";
export type ReportStatus = "NEW" | "ACKNOWLEDGED" | "RESOLVED";

export const PRIORITIES: { id: Priority; label: string; hint: string }[] = [
  { id: "CRITICAL", label: "Krytyczny", hint: "Zagrożenie dla ludzi lub statku" },
  { id: "MEDIUM", label: "Średni", hint: "Do naprawy jeszcze w tej wachcie" },
  { id: "LOW", label: "Niski", hint: "Może poczekać na serwis" },
];

// Backend przyjmuje objaw jako tekst; ten zestaw odpowiada temu, czego używa seeder.
export const SYMPTOMS = [
  "Wyciek",
  "Nietypowy hałas",
  "Spadek ciśnienia",
  "Podwyższona temperatura",
  "Drgania",
  "Brak odpowiedzi",
  "Zapach spalenizny",
  "Alarm na panelu",
] as const;

export const STATUS_LABEL: Record<ReportStatus, string> = {
  NEW: "Do weryfikacji",
  ACKNOWLEDGED: "Potwierdzone",
  RESOLVED: "Rozwiązane",
};

export const PRIORITY_LABEL: Record<Priority, string> = Object.fromEntries(
  PRIORITIES.map((p) => [p.id, p.label]),
) as Record<Priority, string>;

export const PRIORITY_RANK: Record<Priority, number> = { CRITICAL: 3, MEDIUM: 2, LOW: 1 };

export const SECTORS = ["A", "B", "C", "D"] as const;
