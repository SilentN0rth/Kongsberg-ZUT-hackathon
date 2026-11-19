"use client";

import Dexie, { liveQuery, type Table } from "dexie";
import { useEffect, useState } from "react";
import { ApiError, api, type ReportIn } from "@/lib/api";

// Kolejka offline: zgłoszenie, którego nie udało się wysłać (brak sieci, błąd serwera), czeka w IndexedDB i jest ponawiane.
// Serwer ma własną kolejkę (kolekcja `queue` w Payload) i jest idempotentny po `id`, więc powtórka nie tworzy duplikatu.
// Błąd 4xx (nieprawidłowe dane) nie jest ponawiany: serwer zapisał wpis jako FAILED, a oficer zobaczy go na mostku.
const isRejected = (e: unknown) => e instanceof ApiError && e.status >= 400 && e.status < 500;
class OutboxDb extends Dexie {
  outbox!: Table<ReportIn, string>;
  constructor() {
    super("watchbrief");
    this.version(1).stores({ outbox: "id, createdAt" });
  }
}

let db: OutboxDb | null = null;
const outbox = () => (db ??= new OutboxDb()).outbox;

export async function submitReport(report: ReportIn): Promise<"sent" | "queued"> {
  try {
    await api.submit(report);
    return "sent";
  } catch (e) {
    if (isRejected(e)) throw e;
    await outbox().put(report);
    return "queued";
  }
}

export async function flushOutbox() {
  for (const report of await outbox().toArray()) {
    try {
      await api.submit(report);
      await outbox().delete(report.id);
    } catch (e) {
      if (isRejected(e)) {
        await outbox().delete(report.id);
        continue;
      }
      return; // brak sieci: spróbujemy przy następnym cyklu
    }
  }
}

// Liczba wpisów czekających na sieć + automatyczne ponawianie (po powrocie sieci i co 5 s).
export function useOutboxCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sub = liveQuery(() => outbox().count()).subscribe({ next: setCount, error: () => {} });
    const tick = () => void flushOutbox();
    tick();
    const timer = setInterval(tick, 5000);
    window.addEventListener("online", tick);
    return () => {
      sub.unsubscribe();
      clearInterval(timer);
      window.removeEventListener("online", tick);
    };
  }, []);
  return count;
}
