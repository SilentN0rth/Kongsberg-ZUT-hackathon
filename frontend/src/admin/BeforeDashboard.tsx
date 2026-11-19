import Link from "next/link";
import { Chip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import type { ServerProps } from "payload";
import { DemoTools } from "@/admin/DemoTools";
import { demoToolsEnabled } from "@/lib/server/demo";

// Pulpit mostka nad standardowymi kafelkami Payload: stan zgłoszeń, skróty do weryfikacji i kolejki.
export async function BeforeDashboard({ payload }: ServerProps) {
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
        Weryfikacja zgłoszeń
      </h2>
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
        <Link className={buttonVariants({ variant: "outline" })} href="/mostek">
          Widok na żywo
        </Link>
        <Link className={buttonVariants({ variant: "ghost" })} href="/admin/collections/handovers">
          Zmiana wachty
        </Link>
      </div>
      <DemoTools demo={demoToolsEnabled()} />
    </section>
  );
}
