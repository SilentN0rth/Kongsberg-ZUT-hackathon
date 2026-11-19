import type { Payload } from "payload";
import { DEFAULT_WATCHES, type WatchEntry } from "@/lib/watch";

export type ShipSettings = {
  vesselName: string;
  timezone: string;
  briefHeader: string;
  watches: WatchEntry[];
  liveRefreshSeconds: number;
};

// Ustawienia z bazy z bezpiecznymi wartościami domyślnymi (pierwsze uruchomienie, puste pola).
export async function getSettings(payload: Payload): Promise<ShipSettings> {
  const s = await payload.findGlobal({ slug: "settings", depth: 0 }).catch(() => null);
  return {
    vesselName: s?.vesselName || "Statek",
    timezone: s?.timezone || process.env.WATCHBRIEF_TIMEZONE || "Europe/Warsaw",
    briefHeader: s?.briefHeader || "HANDOVER BRIEF",
    watches: s?.watches?.length ? s.watches.map(({ label, from, to, role }) => ({ label, from, to, role })) : DEFAULT_WATCHES,
    liveRefreshSeconds: s?.liveRefreshSeconds ?? 3,
  };
}
