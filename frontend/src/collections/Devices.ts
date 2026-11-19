import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "@/collections/access";
import { SECTORS } from "@/lib/catalog";

// Urządzenie na statku. `id` to slug z kodu QR/NFC, np. "pompa-03" (Device.java).
export const Devices: CollectionConfig = {
  slug: "devices",
  labels: { singular: "Urządzenie", plural: "Urządzenia" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sector", "serial", "id"],
    listSearchableFields: ["name", "serial", "id"],
    group: "Statek",
    description: "Lista urządzeń, do których przypisuje się zgłoszenia. Identyfikator trafia do kodu QR/NFC.",
  },
  defaultSort: "sector",
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    {
      name: "id",
      type: "text",
      required: true,
      label: "Identyfikator",
      admin: { description: "Slug używany w linku z kodu QR, np. pompa-03. Małe litery, cyfry i myślniki." },
      validate: (v: string | null | undefined) =>
        typeof v === "string" && /^[a-z0-9-]{2,40}$/.test(v) ? true : "Użyj 2-40 znaków: małe litery, cyfry, myślnik",
    },
    {
      name: "sector",
      type: "select",
      required: true,
      index: true,
      label: "Sektor",
      options: SECTORS.map((s) => ({ label: `Sektor ${s}`, value: s })),
    },
    { name: "name", type: "text", required: true, label: "Nazwa" },
    { name: "serial", type: "text", required: true, label: "Numer seryjny" },
  ],
};
