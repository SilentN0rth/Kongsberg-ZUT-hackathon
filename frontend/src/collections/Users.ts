import type { CollectionConfig } from "payload";

// Panel mostka to panel CMS (/admin). Jedyna rola to administrator (Kongsberg Maritime): nie ma kont zwykłych użytkowników,
// a załoga na telefonach w ogóle się nie loguje. Pierwszego administratora tworzy się na ekranie /admin (Payload prosi o to sam).
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Administrator", plural: "Administratorzy" },
  admin: { useAsTitle: "name", defaultColumns: ["name", "email"], group: "Dostęp" },
  auth: true,
  fields: [{ name: "name", type: "text", required: true, defaultValue: "Kongsberg Maritime", label: "Nazwa administratora" }],
};
