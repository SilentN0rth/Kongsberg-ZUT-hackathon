import Link from "next/link";
import { Chip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import type { ServerProps } from "payload";
import { BriefPanel } from "@/admin/BriefPanel";
import { DemoTools } from "@/admin/DemoTools";
import { demoToolsEnabled } from "@/lib/server/demo";
import { getSettings } from "@/lib/server/settings";
import { currentWatch, watchTitle, watchWindow } from "@/lib/watch";

// Pulpit mostka nad standardowymi kafelkami Payload: stan zgłoszeń, skróty do weryfikacji i kolejki.
export async function BeforeDashboard({ payload, user }: ServerProps) {
  const who = (user as { name?: string; email?: string } | null | undefined)?.name || (user as { email?: string } | null | undefined)?.email || "Administrator";
  const settings = await getSettings(payload);
  const watch = currentWatch(settings.watches, settings.timezone);
  const count = async (collection: "reports" | "queue", where: Record<string, unknown>) =>
    (await payload.count({ collection, where: where as never })).totalDocs;

  const [pending, critical, acknowledged, queued, failed] = await Promise.all([
    count("reports", { status: { equals: "NEW" } }),
    count("reports", { and: [{ status: { not_equals: "RESOLVED" } }, { priority: { equals: "CRITICAL" } }] }),
    count("reports", { status: { equals: "ACKNOWLEDGED" } }),
    count("queue", { status: { equals: "PENDING" } }),
    count("queue", { status: { equals: "FAILED" } }),
  ]);

  return (
    <section className="wb-admin-panel" aria-labelledby="wb-admin-h">
      <h2 id="wb-admin-h" className="wb-admin-title">
        Stanowisko mostka
      </h2>
      <p className="wb-admin-muted">
        {settings.vesselName} · {watchTitle(watch)}
        {watch ? ` (${watchWindow(watch)})` : ""} · zalogowano jako {who}
      </p>
      <div className="wb-admin-row">
        <Chip size="lg" color="accent" variant="soft">
          <Chip.Label>{pending} do weryfikacji</Chip.Label>
        </Chip>
        <Chip size="lg" color="danger" variant={critical > 0 ? "primary" : "soft"}>
          <Chip.Label>{critical} krytyczne otwarte</Chip.Label>
        </Chip>
        <Chip size="lg" color="default" variant="soft">
          <Chip.Label>{acknowledged} potwierdzone</Chip.Label>
        </Chip>
        <Chip size="lg" color={failed > 0 ? "danger" : "warning"} variant="soft">
          <Chip.Label>
            kolejka: {queued} oczekuje, {failed} z błędem
          </Chip.Label>
        </Chip>
      </div>
      <div className="wb-admin-row">
        <Link className={buttonVariants({ variant: "primary" })} href="/admin/collections/reports?where[status][equals]=NEW&sort=-reportedAt">
          Zgłoszenia do weryfikacji
        </Link>
        <Link className={buttonVariants({ variant: "secondary" })} href="/admin/collections/queue">
          Kolejka
        </Link>
        <Link className={buttonVariants({ variant: "outline" })} href="/admin/collections/devices">
          Urządzenia
        </Link>
        <Link className={buttonVariants({ variant: "ghost" })} href="/admin/collections/handovers">
          Archiwum przekazań
        </Link>
        <Link className={buttonVariants({ variant: "ghost" })} href="/admin/globals/settings">
          Ustawienia statku
        </Link>
      </div>
      <BriefPanel />
      <DemoTools demo={demoToolsEnabled()} />
    </section>
  );
}
