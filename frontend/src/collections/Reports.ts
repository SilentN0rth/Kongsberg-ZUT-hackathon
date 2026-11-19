import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "@/collections/access";
import { PRIORITIES, STATUS_LABEL, SYMPTOMS } from "@/lib/catalog";

// Zgłoszenie usterki (Report.java). `id` generuje klient (UUID), dzięki czemu ponowna wysyłka z kolejki nie dubluje wpisu.
// `createdAt` z Payload to moment odebrania przez serwer (receivedAt), a `reportedAt` to czas z urządzenia.
export const Reports: CollectionConfig = {
  slug: "reports",
  labels: { singular: "Zgłoszenie", plural: "Zgłoszenia" },
  admin: {
    useAsTitle: "symptom",
    defaultColumns: ["device", "symptom", "priority", "status", "reportedAt", "verify"],
    listSearchableFields: ["symptom", "note"],
    group: "Zgłoszenia",
    description: "Zgłoszenia od załogi do weryfikacji przez oficera. Statusy zmieniasz przyciskami na liście.",
  },
  defaultSort: "-reportedAt",
  access: {
    // Załoga widzi otwarte zgłoszenia przy urządzeniach; zmieniać statusy może tylko zalogowany oficer.
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === "create" && data && !data.id) data.id = crypto.randomUUID();
        return data;
      },
    ],
  },
  fields: [
    {
      name: "id",
      type: "text",
      required: true,
      label: "Identyfikator zgłoszenia",
      defaultValue: () => crypto.randomUUID(),
      admin: { readOnly: true, description: "Nadawany automatycznie (UUID)." },
    },
    { name: "device", type: "relationship", relationTo: "devices", required: true, index: true, label: "Urządzenie" },
    { name: "symptom", type: "select", required: true, label: "Objaw", options: SYMPTOMS.map((s) => ({ label: s, value: s })) },
    {
      name: "priority",
      type: "select",
      required: true,
      index: true,
      label: "Priorytet",
      options: PRIORITIES.map((p) => ({ label: p.label, value: p.id })),
      admin: { components: { Cell: "/admin/cells/PriorityCell#PriorityCell" } },
    },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "NEW",
      label: "Status",
      options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ label, value })),
      admin: { position: "sidebar", components: { Cell: "/admin/cells/StatusCell#StatusCell" } },
    },
    { name: "note", type: "textarea", maxLength: 2000, label: "Notatka" },
    {
      name: "reportedAt",
      type: "date",
      required: true,
      index: true,
      label: "Zgłoszono (czas z urządzenia)",
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime", displayFormat: "dd.MM.yyyy HH:mm" } },
    },
    {
      name: "verify",
      type: "ui",
      label: "Weryfikacja",
      admin: { components: { Cell: "/admin/cells/VerifyCell#VerifyCell", Field: "/admin/fields/VerifyField#VerifyField" } },
    },
  ],
};
