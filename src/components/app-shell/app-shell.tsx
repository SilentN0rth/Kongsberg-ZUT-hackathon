"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { Button, Chip } from "@heroui/react";
import { demoEntries, demoWatch } from "@/lib/demo-data";
import { CameraIcon, CloudOffIcon, HandoverIcon, InboxIcon, MoonIcon, WatchIcon } from "./icons";

export type NavKey = "wachta" | "nowa" | "handover" | "skrzynka";

const NAV: { key: NavKey; href: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: "wachta", href: "/wachta", label: "Wachta", Icon: WatchIcon },
  { key: "nowa", href: "/nowa", label: "Usterka", Icon: CameraIcon },
  { key: "handover", href: "/handover", label: "Zdaj", Icon: HandoverIcon },
  { key: "skrzynka", href: "/skrzynka", label: "Serwis", Icon: InboxIcon },
];

const queuedCount = demoEntries.filter((e) => e.sync === "queued").length;

// Szkielet każdego ekranu: pasek stanu u góry, treść, dolna nawigacja pod kciuk.
export function AppShell({ active, children }: { active: NavKey; children: ReactNode }) {
  const [night, setNight] = useState(false);

  return (
    <div
      data-mode={night ? "night" : "day"}
      className="wb-app flex min-h-dvh justify-center"
    >
      <div className="relative flex min-h-dvh w-full max-w-md flex-col md:border-x md:border-(--border)">
        <header
          className="sticky top-0 z-10 flex items-center gap-3 border-b border-(--separator) bg-(--background) px-4 pb-3"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold leading-tight">
              {demoWatch.label} <span className="tabular text-(--muted)">· {demoWatch.window}</span>
            </p>
            <Chip size="md" color="warning" variant="soft" className="mt-1.5">
              <CloudOffIcon width={14} height={14} />
              <Chip.Label className="tabular">Offline: {queuedCount} wpisy czekają</Chip.Label>
            </Chip>
          </div>
          <Button
            isIconOnly
            variant="tertiary"
            aria-label={night ? "Wyłącz tryb nocny" : "Włącz tryb nocny mostka"}
            aria-pressed={night}
            onPress={() => setNight((v) => !v)}
            className="wb-press size-14"
          >
            <MoonIcon width={26} height={26} />
          </Button>
        </header>

        <main className="flex-1 px-4 pt-5 pb-32">{children}</main>

        <nav
          aria-label="Główna nawigacja"
          className="fixed inset-x-0 bottom-0 z-10 mx-auto grid w-full max-w-md grid-cols-4 border-t border-(--border) bg-(--surface) md:border-x"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {NAV.map(({ key, href, label, Icon }) => {
            const isActive = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`wb-press flex h-18 flex-col items-center justify-center gap-1 text-sm font-medium ${
                  isActive ? "text-(--accent)" : "text-(--muted)"
                }`}
              >
                <Icon width={28} height={28} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
