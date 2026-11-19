// Grafik wacht (ustawiany w panelu: Ustawienia statku). Czysta logika, działa na serwerze i w przeglądarce.
export type WatchEntry = { label: string; from: string; to: string; role?: string | null };

// Przykładowy system 4/8: sześć okien po 4 godziny. Do zmiany w panelu.
export const DEFAULT_WATCHES: WatchEntry[] = [
  { label: "Wachta 4/8", from: "00:00", to: "04:00", role: "III oficer" },
  { label: "Wachta 4/8", from: "04:00", to: "08:00", role: "II oficer" },
  { label: "Wachta 4/8", from: "08:00", to: "12:00", role: "I oficer" },
  { label: "Wachta 4/8", from: "12:00", to: "16:00", role: "III oficer" },
  { label: "Wachta 4/8", from: "16:00", to: "20:00", role: "II oficer" },
  { label: "Wachta 4/8", from: "20:00", to: "24:00", role: "I oficer" },
];

export const TIMEZONES = ["Europe/Warsaw", "Europe/Oslo", "Europe/London", "UTC"] as const;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

export const minutesNow = (timeZone: string, now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
};

// Bieżąca wachta: okno `from`–`to` (obsługuje przejście przez północ, np. 22:00–02:00).
export function currentWatch(watches: WatchEntry[], timeZone: string, now = new Date()): WatchEntry | null {
  const t = minutesNow(timeZone, now);
  return (
    watches.find((w) => {
      const a = toMinutes(w.from);
      const b = toMinutes(w.to);
      return a <= b ? t >= a && t < b : t >= a || t < b;
    }) ?? null
  );
}

export const watchTitle = (w: WatchEntry | null) => (w ? `${w.label}${w.role ? ` · ${w.role}` : ""}` : "Poza grafikiem wacht");
export const watchWindow = (w: WatchEntry | null) => (w ? `${w.from}–${w.to === "24:00" ? "00:00" : w.to}` : "");
