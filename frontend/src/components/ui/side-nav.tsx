import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Chip } from "@heroui/react";
import { GridIcon, ListIcon, QrScanIcon, UserIcon } from "@/components/ui/icons";
import { WATCH } from "@/lib/catalog";

type Item = { key: "mostek" | "urzadzenia" | "cms"; label: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

const ITEMS: Item[] = [
  { key: "mostek", label: "Weryfikacja", href: "/mostek", Icon: ListIcon },
  { key: "urzadzenia", label: "Urządzenia", href: "/urzadzenia", Icon: GridIcon },
  { key: "cms", label: "Panel CMS", href: "/admin", Icon: UserIcon },
];

// Navigation of the bridge workstation: a glass sidebar shown from `lg` up.
export function SideNav({ active, critical, pending }: { active: "mostek" | "urzadzenia"; critical: number; pending: number }) {
  return (
    <aside
      aria-label="Panel boczny"
      className="hidden w-72 shrink-0 flex-col gap-6 border-r border-white/70 bg-white/45 p-5 backdrop-blur-2xl lg:flex"
      style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
    >
      <Link href="/" className="wb-press flex items-center gap-3 rounded-2xl px-2 py-2">
        <span className="grid size-10 place-items-center rounded-xl bg-deep text-aqua">
          <QrScanIcon width={22} height={22} />
        </span>
        <span className="type-headline text-[1.25rem] text-deep">WatchBrief</span>
      </Link>

      <nav aria-label="Główna nawigacja">
        <ul className="flex flex-col gap-1">
          {ITEMS.map(({ key, label, href, Icon }) => {
            const isActive = key === active;
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`wb-press type-headline flex h-12 items-center gap-3 rounded-xl px-3 font-medium transition-colors ${
                    isActive ? "bg-white/85 text-deep shadow-[0_2px_10px_rgb(3_42_57/0.08)]" : "text-slate hover:bg-white/60 hover:text-ink"
                  }`}
                >
                  <Icon width={24} height={24} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-labelledby="side-watch" className="wb-card mt-auto rounded-3xl p-4">
        <h2 id="side-watch" className="type-headline text-ink">
          {WATCH.label}
        </h2>
        <p className="type-caption mt-1 text-slate">{WATCH.window}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip color="danger" variant="soft">
            <Chip.Label>{critical} krytyczne</Chip.Label>
          </Chip>
          <Chip color="warning" variant="soft">
            <Chip.Label>{pending} do weryfikacji</Chip.Label>
          </Chip>
        </div>
      </section>
    </aside>
  );
}
