import type { Payload } from "payload";
import { reportInSchema } from "@/lib/report-schema";

export type QueueOutcome = { ok: true; reportId: string } | { ok: false; error: string };

// Przetwarza jeden wpis kolejki: waliduje, sprawdza urządzenie, tworzy zgłoszenie (idempotentnie po id).
// Wszystkie operacje są sekwencyjne i bez wspólnej transakcji: błąd przy tworzeniu zgłoszenia nie cofa
// zapisu wpisu kolejki, więc status FAILED zawsze zostaje widoczny na mostku.
export async function processQueueItem(payload: Payload, queueId: number | string): Promise<QueueOutcome> {
  const item = await payload.findByID({ collection: "queue", id: queueId, depth: 0 });
  const attempts = (item.attempts ?? 0) + 1;

  const fail = async (error: string): Promise<QueueOutcome> => {
    await payload.update({
      collection: "queue",
      id: queueId,
      data: { status: "FAILED", attempts, lastError: error },
    });
    return { ok: false, error };
  };

  const parsed = reportInSchema.safeParse(item.payload);
  if (!parsed.success) return fail(parsed.error.issues.map((i) => i.message).join("; "));
  const p = parsed.data;

  try {
    const device = await payload.findByID({ collection: "devices", id: p.deviceId, depth: 0, disableErrors: true });
    if (!device) return fail(`Nieznane urządzenie: ${p.deviceId}`);

    const existing = await payload.find({
      collection: "reports",
      where: { id: { equals: p.id } },
      limit: 1,
      depth: 0,
      pagination: false,
    });
    const report =
      existing.docs[0] ??
      (await payload.create({
        collection: "reports",
        data: {
          id: p.id,
          device: p.deviceId,
          symptom: p.symptom,
          priority: p.priority,
          note: p.note || undefined,
          reportedAt: p.createdAt ?? new Date().toISOString(),
          status: "NEW",
        },
      }));

    await payload.update({
      collection: "queue",
      id: queueId,
      data: { status: "PROCESSED", attempts, lastError: null, processedAt: new Date().toISOString(), report: report.id },
    });
    return { ok: true, reportId: report.id };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Nieznany błąd przetwarzania");
  }
}

// Wszystkie oczekujące i nieudane wpisy, od najstarszych.
export async function processPending(payload: Payload) {
  const pending = await payload.find({
    collection: "queue",
    where: { status: { in: ["PENDING", "FAILED"] } },
    sort: "createdAt",
    limit: 0,
    pagination: false,
    depth: 0,
  });
  let processed = 0;
  let failed = 0;
  for (const item of pending.docs) {
    const r = await processQueueItem(payload, item.id);
    if (r.ok) processed++;
    else failed++;
  }
  return { total: pending.docs.length, processed, failed };
}
