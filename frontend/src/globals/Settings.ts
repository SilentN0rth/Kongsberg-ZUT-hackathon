import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "@/collections/access";
import { DEFAULT_WATCHES, TIMEZONES } from "@/lib/watch";

const hhmm = (v: string | null | undefined) =>
  typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$|^24:00$/.test(v) ? true : "Podaj godzinę w formacie GG:MM (np. 04:00)";

// Pojedynczy dokument z ustawieniami statku. Czytają go też telefony (nazwa wachty), więc odczyt jest publiczny,
// a zmieniać może tylko administrator.
export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Ustawienia statku",
  admin: { group: "Konfiguracja", description: "Nazwa statku, strefa czasowa, grafik wacht i zachowanie panelu." },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Statek",
          fields: [
            { name: "vesselName", type: "text", required: true, defaultValue: "Statek", label: "Nazwa statku", admin: { description: "Pojawia się w panelu i w briefie zmiany." } },
            {
              name: "timezone",
              type: "select",
              required: true,
              defaultValue: "Europe/Warsaw",
              label: "Strefa czasowa",
              options: TIMEZONES.map((z) => ({ label: z, value: z })),
              admin: { description: "Godziny w briefie i bieżąca wachta liczone są w tej strefie." },
            },
            { name: "briefHeader", type: "text", required: true, defaultValue: "HANDOVER BRIEF", label: "Nagłówek briefu zmiany" },
          ],
        },
        {
          label: "Grafik wacht",
          fields: [
            {
              name: "watches",
              type: "array",
              label: "Okna wacht",
              minRows: 1,
              defaultValue: DEFAULT_WATCHES,
              labels: { singular: "Wachta", plural: "Wachty" },
              admin: { description: "Przykładowy system 4/8. Zmień nazwy, godziny i role na rzeczywiste.", initCollapsed: true },
              fields: [
                { name: "label", type: "text", required: true, label: "Nazwa" },
                { name: "from", type: "text", required: true, label: "Od", validate: hhmm, admin: { width: "25%" } },
                { name: "to", type: "text", required: true, label: "Do", validate: hhmm, admin: { width: "25%" } },
                { name: "role", type: "text", label: "Rola", admin: { width: "50%" } },
              ],
            },
          ],
        },
        {
          label: "Panel",
          fields: [
            {
              name: "liveRefreshSeconds",
              type: "number",
              required: true,
              defaultValue: 3,
              min: 2,
              max: 60,
              label: "Odświeżanie list na żywo (sekundy)",
              admin: { description: "Jak często listy zgłoszeń i kolejki sprawdzają nowe wpisy." },
            },
          ],
        },
      ],
    },
  ],
};
