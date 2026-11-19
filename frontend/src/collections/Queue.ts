import type { CollectionConfig, Endpoint } from "payload";
import { z } from "zod";
import { authenticated } from "@/collections/access";
import { reportInSchema } from "@/lib/report-schema";
import { processPending, processQueueItem } from "@/lib/server/queue-processor";

// Kolejka zgłoszeń. Każde zgłoszenie z telefonu najpierw trafia tutaj (także to wysłane po powrocie sieci),
// a dopiero potem jest przetwarzane na zgłoszenie. Dzięki temu nic nie ginie: błędny wpis zostaje widoczny
// jako FAILED z powodem, a oficer może go poprawić i ponowić.
const submit: Endpoint = {
  path: "/submit",
  method: "post",
  handler: async (req) => {
    let body: unknown;
    try {
      body = await req.json?.();
    } catch {
      return Response.json({ error: "Nieprawidłowy JSON" }, { status: 400 });
    }
    const parsed = reportInSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Nieprawidłowe zgłoszenie", issues: z.flattenError(parsed.error).fieldErrors }, { status: 422 });
    }
    const p = parsed.data;
    const { payload } = req;

    // Idempotencja: ten sam id (np. ponowna wysyłka z kolejki offline) zwraca wynik pierwszego przyjęcia.
    const find = () =>
      payload.find({ collection: "queue", where: { clientId: { equals: p.id } }, limit: 1, depth: 0, pagination: false });
    let item = (await find()).docs[0];
    if (!item) {
      try {
        item = await payload.create({
          collection: "queue",
          data: { clientId: p.id, kind: "report", payload: p, status: "PENDING", attempts: 0 },
        });
      } catch {
        item = (await find()).docs[0]; // równoległa wysyłka tego samego id
        if (!item) return Response.json({ error: "Nie udało się zapisać w kolejce" }, { status: 500 });
      }
    }

    const outcome = item.status === "PROCESSED" && item.report
      ? ({ ok: true, reportId: typeof item.report === "object" ? item.report.id : item.report } as const)
      : await processQueueItem(payload, item.id);

    if (!outcome.ok) {
      return Response.json({ status: "FAILED", queueId: item.id, error: outcome.error }, { status: 422 });
    }
    return Response.json({ status: "PROCESSED", queueId: item.id, reportId: outcome.reportId }, { status: 201 });
  },
};

const processAll: Endpoint = {
  path: "/process",
  method: "post",
  handler: async (req) => {
    if (!req.user) return Response.json({ error: "Wymagane logowanie" }, { status: 401 });
    return Response.json(await processPending(req.payload));
  },
};

export const Queue: CollectionConfig = {
  slug: "queue",
  labels: { singular: "Wpis kolejki", plural: "Kolejka" },
  admin: {
    useAsTitle: "clientId",
    defaultColumns: ["clientId", "status", "attempts", "lastError", "createdAt", "processedAt"],
    group: "Zgłoszenia",
    components: { beforeListTable: ["/admin/LiveRefresh#LiveRefresh"] },
    description: "Zgłoszenia przyjęte z telefonów. Wpisy FAILED mają podany powód; popraw dane i przetwórz kolejkę ponownie.",
  },
  defaultSort: "-createdAt",
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  endpoints: [submit, processAll],
  fields: [
    { name: "clientId", type: "text", required: true, unique: true, index: true, label: "Klucz (id zgłoszenia)" },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "report",
      label: "Rodzaj",
      options: [{ label: "Zgłoszenie usterki", value: "report" }],
    },
    { name: "payload", type: "json", required: true, label: "Dane zgłoszenia" },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "PENDING",
      label: "Status",
      options: [
        { label: "Oczekuje", value: "PENDING" },
        { label: "Przetworzone", value: "PROCESSED" },
        { label: "Błąd", value: "FAILED" },
      ],
      admin: { position: "sidebar", components: { Cell: "/admin/cells/QueueStatusCell#QueueStatusCell" } },
    },
    { name: "attempts", type: "number", defaultValue: 0, min: 0, label: "Próby", admin: { readOnly: true, position: "sidebar" } },
    { name: "lastError", type: "textarea", label: "Ostatni błąd", admin: { readOnly: true } },
    { name: "processedAt", type: "date", label: "Przetworzono", admin: { readOnly: true, position: "sidebar", date: { pickerAppearance: "dayAndTime" } } },
    { name: "report", type: "relationship", relationTo: "reports", label: "Utworzone zgłoszenie", admin: { readOnly: true, position: "sidebar" } },
  ],
};
