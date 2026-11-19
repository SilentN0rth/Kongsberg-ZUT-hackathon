import type { Payload } from "payload";
import { PRIORITY_RANK, type Priority } from "@/lib/catalog";
import { getSettings } from "@/lib/server/settings";

const hm = (d: Date, ZONE: string) => new Intl.DateTimeFormat("pl-PL", { timeZone: ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);

const dmHm = (d: Date, ZONE: string) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("pl-PL", { timeZone: ZONE, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}.${p.month} ${p.hour}:${p.minute}`;
};

const GROUPS: { priority: Priority; title: string }[] = [
  { priority: "CRITICAL", title: "KRYTYCZNE" },
  { priority: "MEDIUM", title: "ŚREDNIE" },
  { priority: "LOW", title: "NISKIE" },
];

// Handover Brief z szablonu (bez LLM): nierozwiązane zgłoszenia pogrupowane wg priorytetu.
export async function renderBrief(payload: Payload): Promise<string> {
  const settings = await getSettings(payload);
  const ZONE = settings.timezone;
  const open = await payload.find({
    collection: "reports",
    where: { status: { not_equals: "RESOLVED" } },
    depth: 1,
    limit: 0,
    pagination: false,
  });
  const reports = [...open.docs].sort(
    (a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || b.reportedAt.localeCompare(a.reportedAt),
  );

  let out = `${settings.briefHeader}\n${settings.vesselName}\nStan na: ${dmHm(new Date(), ZONE)}\n`;
  if (reports.length === 0) return `${out}Brak otwartych usterek. Wachta spokojna.`;

  const critical = reports.filter((r) => r.priority === "CRITICAL").length;
  out += `Otwarte usterki: ${reports.length}, w tym krytyczne: ${critical}\n\n`;

  for (const { priority, title } of GROUPS) {
    const group = reports.filter((r) => r.priority === priority);
    if (group.length === 0) continue;
    out += `${title}\n`;
    for (const r of group) {
      const d = typeof r.device === "object" ? r.device : null;
      out += `- [${d?.sector ?? "?"}] ${d?.name ?? String(r.device)}: ${r.symptom} (${hm(new Date(r.reportedAt), ZONE)})`;
      if (r.note?.trim()) out += ` - ${r.note}`;
      out += "\n";
    }
    out += "\n";
  }
  return out.trimEnd();
}
