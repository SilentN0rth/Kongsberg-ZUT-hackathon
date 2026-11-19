import type { CollectionConfig } from "payload";

// Logowanie do panelu mostka. Pierwszego użytkownika tworzy się na ekranie /admin (Payload prosi o to sam).
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Użytkownik", plural: "Użytkownicy" },
  admin: { useAsTitle: "email", defaultColumns: ["email", "name"], group: "Dostęp" },
  auth: true,
  fields: [{ name: "name", type: "text", label: "Imię i nazwisko" }],
};
