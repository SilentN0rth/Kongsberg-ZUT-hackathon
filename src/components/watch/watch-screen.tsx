import Link from "next/link";
import { Chip } from "@heroui/react";
import { CameraIcon, CheckIcon, ClockUpIcon, HandoverIcon, InboxIcon } from "@/components/app-shell/icons";
import { demoEntries, demoWatch, type Priority } from "@/lib/demo-data";

const PRIORITY: Record<
  Priority,
  { label: string; color: "danger" | "warning" | "default"; variant: "primary" | "soft" }
> = {
  critical: { label: "Krytyczny", color: "danger", variant: "primary" },
  high: { label: "Wysoki", color: "warning", variant: "primary" },
  normal: { label: "Zwykły", color: "default", variant: "soft" },
};

export function WatchScreen() {
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="wachta-h" className="flex flex-col gap-4">
        <div>
          <h1 id="wachta-h" className="text-3xl leading-tight font-semibold text-balance">
            Moja wachta
          </h1>
          <p className="mt-1 text-base text-(--muted)">
            {demoWatch.role}, zmiana o <span className="tabular">{demoWatch.handoverAt}</span>
          </p>
        </div>

        <Link
          href="/nowa"
          className="wb-press flex min-h-28 items-center gap-4 rounded-2xl bg-(--accent) px-5 py-4 text-(--accent-foreground)"
        >
          <CameraIcon width={40} height={40} />
          <span className="flex flex-col">
            <span className="text-2xl leading-tight font-semibold">Zgłoś usterkę</span>
            <span className="text-base opacity-80">Zdjęcie i trzy dotknięcia</span>
          </span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/handover"
            className="wb-press wb-tile flex min-h-24 flex-col justify-between rounded-2xl border border-(--border) bg-(--surface) p-4"
          >
            <HandoverIcon width={28} height={28} className="text-(--accent)" />
            <span className="text-lg leading-tight font-semibold">Zdaj wachtę</span>
          </Link>
          <Link
            href="/skrzynka"
            className="wb-press wb-tile flex min-h-24 flex-col justify-between rounded-2xl border border-(--border) bg-(--surface) p-4"
          >
            <InboxIcon width={28} height={28} className="text-(--accent)" />
            <span className="text-lg leading-tight font-semibold">Skrzynka serwisu</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="wpisy-h">
        <div className="flex items-baseline justify-between">
          <h2 id="wpisy-h" className="text-xl font-semibold">
            Wpisy z tej wachty
          </h2>
          <span className="text-sm text-(--muted)">Dane przykładowe</span>
        </div>

        <ul className="mt-3 divide-y divide-(--separator) rounded-2xl border border-(--border) bg-(--surface)">
          {demoEntries.map((entry) => {
            const p = PRIORITY[entry.priority];
            return (
              <li key={entry.id} className="flex items-center gap-3 px-4 py-4">
                <span className="tabular w-12 shrink-0 text-base text-(--muted)">{entry.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg leading-tight font-semibold">{entry.device}</p>
                  <p className="text-base text-(--muted)">
                    {entry.symptom} · {entry.sector}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Chip size="md" color={p.color} variant={p.variant}>
                    <Chip.Label>{p.label}</Chip.Label>
                  </Chip>
                  <span className="flex items-center gap-1 text-sm text-(--muted)">
                    {entry.sync === "synced" ? (
                      <>
                        <CheckIcon width={16} height={16} /> Wysłane
                      </>
                    ) : (
                      <>
                        <ClockUpIcon width={16} height={16} /> Czeka na sieć
                      </>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-sm text-(--muted)">
        Asystent pomaga przy zdawaniu wachty. Nie zastępuje oficjalnego dziennika okrętowego.
      </p>
    </div>
  );
}
