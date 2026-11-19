import { Chip } from "@heroui/react";
import type { ServerProps } from "payload";
import { getSettings } from "@/lib/server/settings";
import { currentWatch, watchTitle, watchWindow } from "@/lib/watch";

// Karta na dole panelu bocznego: bieżąca wachta (z grafiku w ustawieniach) i stan zgłoszeń.
export async function NavWatch({ payload }: ServerProps) {
  const settings = await getSettings(payload);
  const watch = currentWatch(settings.watches, settings.timezone);
  const open = { status: { not_equals: "RESOLVED" } } as const;
  const [critical, pending] = await Promise.all([
    payload.count({ collection: "reports", where: { and: [open, { priority: { equals: "CRITICAL" } }] } }),
    payload.count({ collection: "reports", where: { status: { equals: "NEW" } } }),
  ]);

  return (
    <section className="wb-nav-watch" aria-labelledby="wb-nav-watch-h">
      <h2 id="wb-nav-watch-h" className="wb-nav-watch__title">
        {watchTitle(watch)}
      </h2>
      {watch && <p className="wb-nav-watch__window">{watchWindow(watch)}</p>}
      <div className="wb-admin-row">
        <Chip color="danger" variant="soft">
          <Chip.Label>{critical.totalDocs} krytyczne</Chip.Label>
        </Chip>
        <Chip color="warning" variant="soft">
          <Chip.Label>{pending.totalDocs} do weryfikacji</Chip.Label>
        </Chip>
      </div>
    </section>
  );
}
