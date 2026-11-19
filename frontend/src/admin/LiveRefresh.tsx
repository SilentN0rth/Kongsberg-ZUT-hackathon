"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@heroui/react";

// Lista na żywo: co kilka sekund sprawdza, czy w kolekcji coś się zmieniło (nowy wpis lub edycja),
// i wtedy odświeża listę. Dzięki temu oficer na mostku widzi nowe zgłoszenia bez klikania.
export function LiveRefresh({ collectionSlug }: { collectionSlug?: string }) {
  const router = useRouter();
  const slug = collectionSlug ?? "reports";
  const last = useRef<string | null>(null);
  const [online, setOnline] = useState(true);
  const [at, setAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    async function check() {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/${slug}?limit=1&sort=-updatedAt&depth=0`, { credentials: "include", cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { totalDocs: number; docs: { id: string | number; updatedAt: string }[] };
        const signature = `${data.totalDocs}:${data.docs[0]?.id}:${data.docs[0]?.updatedAt}`;
        if (!alive) return;
        if (last.current !== null && last.current !== signature) router.refresh();
        last.current = signature;
        setOnline(true);
        setAt(new Date());
      } catch {
        if (alive) setOnline(false);
      }
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    // Interwał z ustawień statku (domyślnie 3 s).
    fetch("/api/globals/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((s: { liveRefreshSeconds?: number } | null) => {
        if (!alive) return;
        void check();
        timer = setInterval(() => void check(), Math.min(60, Math.max(2, s?.liveRefreshSeconds ?? 3)) * 1000);
      });
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [router, slug]);

  return (
    <div role="status" className="wb-admin-live">
      <Chip color={online ? "success" : "danger"} variant="soft">
        <Chip.Label>
          {online ? `Na żywo${at ? ` · ${at.toLocaleTimeString("pl-PL")}` : ""}` : "Brak połączenia z serwerem"}
        </Chip.Label>
      </Chip>
    </div>
  );
}
