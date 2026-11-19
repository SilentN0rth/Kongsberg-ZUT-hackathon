"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@heroui/react";

const TABS = [
  { key: "NEW", label: "Do weryfikacji" },
  { key: "ACKNOWLEDGED", label: "Potwierdzone" },
  { key: "RESOLVED", label: "Rozwiązane" },
  { key: "ALL", label: "Wszystkie" },
] as const;

type Counts = Record<(typeof TABS)[number]["key"], number>;

// Zakładki statusów nad listą zgłoszeń (jak w widoku mostka) z licznikami i odświeżaniem na żywo:
// gdy w kolekcji coś się zmieni (nowy wpis lub edycja), lista odświeża się sama.
export function ReportTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("where[status][equals]") ?? "ALL";
  const [counts, setCounts] = useState<Counts | null>(null);
  const [online, setOnline] = useState(true);
  const [at, setAt] = useState<Date | null>(null);
  const last = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const get = async (qs: string) => {
      const res = await fetch(`/api/reports?${qs}`, { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      return (await res.json()) as { totalDocs: number; docs: { id: string; updatedAt: string }[] };
    };
    async function loop(seconds: number) {
      if (!alive) return;
      if (!document.hidden) {
        try {
          const [all, ...rest] = await Promise.all([
            get("limit=1&depth=0&sort=-updatedAt"),
            ...TABS.filter((t) => t.key !== "ALL").map((t) => get(`limit=1&depth=0&where[status][equals]=${t.key}`)),
          ]);
          if (!alive) return;
          const next: Counts = { NEW: rest[0].totalDocs, ACKNOWLEDGED: rest[1].totalDocs, RESOLVED: rest[2].totalDocs, ALL: all.totalDocs };
          const signature = `${JSON.stringify(next)}:${all.docs[0]?.id}:${all.docs[0]?.updatedAt}`;
          if (last.current !== null && last.current !== signature) router.refresh();
          last.current = signature;
          setCounts(next);
          setOnline(true);
          setAt(new Date());
        } catch {
          if (alive) setOnline(false);
        }
      }
      timer = setTimeout(() => void loop(seconds), seconds * 1000);
    }
    // Interwał z ustawień statku (domyślnie 3 s).
    fetch("/api/globals/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((s: { liveRefreshSeconds?: number } | null) => void loop(Math.min(60, Math.max(2, s?.liveRefreshSeconds ?? 3))));
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="wb-tabs-bar">
      <nav aria-label="Filtr statusu zgłoszeń" className="wb-tabs">
        {TABS.map((t) => {
          const href = t.key === "ALL" ? "/admin/collections/reports?sort=-reportedAt" : `/admin/collections/reports?where[status][equals]=${t.key}&sort=-reportedAt`;
          const isActive = active === t.key;
          return (
            <Link key={t.key} href={href} aria-current={isActive ? "page" : undefined} className={`wb-tab${isActive ? " wb-tab--active" : ""}`}>
              {t.label}
              <span className="wb-tab__count">{counts ? counts[t.key] : "–"}</span>
            </Link>
          );
        })}
      </nav>
      <div role="status">
        <Chip color={online ? "success" : "danger"} variant="soft">
          <Chip.Label>{online ? `Na żywo${at ? ` · ${at.toLocaleTimeString("pl-PL")}` : ""}` : "Brak połączenia z serwerem"}</Chip.Label>
        </Chip>
      </div>
    </div>
  );
}
