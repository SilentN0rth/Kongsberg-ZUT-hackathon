import type { CollectionConfig, Endpoint } from "payload";
import { authenticated } from "@/collections/access";
import { renderBrief } from "@/lib/server/brief";

const unauthorized = () => Response.json({ error: "Wymagane logowanie" }, { status: 401 });

const toBrief = (h: { id: number; briefText: string; createdAt: string; takenOverAt?: string | null }) => ({
  handoverId: h.id,
  text: h.briefText,
  createdAt: h.createdAt,
  takenOverAt: h.takenOverAt ?? null,
});

const latest: Endpoint = {
  path: "/latest",
  method: "get",
  handler: async (req) => {
    if (!req.user) return unauthorized();
    const r = await req.payload.find({ collection: "handovers", sort: "-createdAt", limit: 1, depth: 0, pagination: false });
    return r.docs[0] ? Response.json(toBrief(r.docs[0])) : new Response(null, { status: 204 });
  },
};

const generate: Endpoint = {
  path: "/generate",
  method: "post",
  handler: async (req) => {
    if (!req.user) return unauthorized();
    const briefText = await renderBrief(req.payload);
    const h = await req.payload.create({ collection: "handovers", data: { briefText } });
    return Response.json(toBrief(h), { status: 201 });
  },
};

// „Przejmuję wachtę”: zapisuje moment przejęcia (tylko za pierwszym razem).
const take: Endpoint = {
  path: "/:id/take",
  method: "post",
  handler: async (req) => {
    if (!req.user) return unauthorized();
    const id = Number(req.routeParams?.id);
    if (!Number.isInteger(id)) return Response.json({ error: "Nieprawidłowy identyfikator" }, { status: 400 });
    const current = await req.payload.findByID({ collection: "handovers", id, depth: 0, disableErrors: true });
    if (!current) return Response.json({ error: "Nie znaleziono przekazania" }, { status: 404 });
    const h = current.takenOverAt
      ? current
      : await req.payload.update({ collection: "handovers", id, data: { takenOverAt: new Date().toISOString() } });
    return Response.json(toBrief(h));
  },
};

// Przekazanie wachty (Handover.java): wygenerowany brief + moment przejęcia przez zmiennika.
export const Handovers: CollectionConfig = {
  slug: "handovers",
  labels: { singular: "Przekazanie wachty", plural: "Przekazania wachty" },
  admin: { useAsTitle: "createdAt", defaultColumns: ["createdAt", "takenOverAt"], group: "Zmiana wachty" },
  defaultSort: "-createdAt",
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  endpoints: [latest, generate, take],
  fields: [
    { name: "briefText", type: "textarea", required: true, maxLength: 8000, label: "Brief", admin: { rows: 18 } },
    { name: "takenOverAt", type: "date", label: "Przejęto", admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } } },
  ],
};
