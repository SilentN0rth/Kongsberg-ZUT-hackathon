import type { Priority, ReportStatus } from "@/lib/catalog";
import type { ReportIn } from "@/lib/report-schema";

export type { ReportIn };

// Aplikacja rozmawia z Payload CMS (ten sam proces Next.js, REST pod /api/*, lokalna baza SQLite).
export type Device = { id: string; sector: string; name: string; serial: string };

export type ReportOut = {
  id: string;
  deviceId: string;
  deviceName: string;
  sector: string | null;
  symptom: string;
  priority: Priority;
  note: string | null;
  createdAt: string; // czas zgłoszenia z urządzenia
  receivedAt: string; // moment odebrania przez serwer
  status: ReportStatus;
};

// Ustawienia statku (globalny dokument Payload): odczyt publiczny, bo korzysta z nich też aplikacja załogi.
export type ShipSettingsDoc = {
  vesselName?: string;
  timezone?: string;
  watches?: { label: string; from: string; to: string; role?: string | null }[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// Kształty zwracane przez Payload REST.
type PayloadList<T> = { docs: T[] };
type PayloadDevice = Device & { createdAt: string };
type PayloadReport = {
  id: string;
  device: PayloadDevice | string;
  symptom: string;
  priority: Priority;
  note?: string | null;
  status: ReportStatus;
  reportedAt: string;
  createdAt: string;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: string; errors?: { message?: string }[] };
      message = body.error ?? body.errors?.[0]?.message ?? message;
    } catch {
      /* odpowiedź bez JSON-a */
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const toReport = (r: PayloadReport): ReportOut => {
  const d = typeof r.device === "object" ? r.device : null;
  return {
    id: r.id,
    deviceId: d?.id ?? String(r.device),
    deviceName: d?.name ?? String(r.device),
    sector: d?.sector ?? null,
    symptom: r.symptom,
    priority: r.priority,
    note: r.note ?? null,
    createdAt: r.reportedAt,
    receivedAt: r.createdAt,
    status: r.status,
  };
};

export const api = {
  settings: () => call<ShipSettingsDoc>("/api/globals/settings"),
  devices: async () =>
    (await call<PayloadList<PayloadDevice>>("/api/devices?limit=0&depth=0&sort=sector")).docs.map(({ id, sector, name, serial }) => ({
      id,
      sector,
      name,
      serial,
    })),
  reports: async () => (await call<PayloadList<PayloadReport>>("/api/reports?limit=0&depth=1&sort=-reportedAt")).docs.map(toReport),
  // Zgłoszenia zawsze przechodzą przez kolejkę (idempotentnie po id), a dopiero potem stają się zgłoszeniami.
  submit: (r: ReportIn) => call<{ status: "PROCESSED"; queueId: number; reportId: string }>("/api/queue/submit", { method: "POST", body: JSON.stringify(r) }),
};
