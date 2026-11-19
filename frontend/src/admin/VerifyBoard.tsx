"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { VerifyAside } from "@/admin/VerifyAside";
import { PRIORITY_LABEL, PRIORITY_RANK, type Priority, type ReportStatus } from "@/lib/catalog";

type Report = {
  id: string;
  symptom: string;
  priority: Priority;
  status: ReportStatus;
  note?: string | null;
  reportedAt: string;
  createdAt: string;
  device: { id: string; name: string; sector: string } | string;
};

const TABS = [
  { key: "NEW", label: "Do weryfikacji" },
  { key: "ACKNOWLEDGED", label: "Potwierdzone" },
  { key: "RESOLVED", label: "Rozwiązane" },
  { key: "ALL", label: "Wszystkie" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const deviceOf = (r: Report) => (typeof r.device === "object" ? r.device : { id: r.device, name: r.device, sector: "?" });

// Pulpit mostka: lista zgłoszeń po lewej, szczegóły i weryfikacja po prawej. Odświeża się na żywo.
export function VerifyBoard() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [online, setOnline] = useState(true);
  const [at, setAt] = useState<Date | null>(null);
  const [tab, setTab] = useState<TabKey>("NEW");
  const [selected, setSelected] = useState<string | null>(null);
  const [side, setSide] = useState<"details" | "handover">("details");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/reports?depth=1&limit=200&sort=-reportedAt", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { docs: Report[] };
      setReports(data.docs);
      setOnline(true);
      setAt(new Date());
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    fetch("/api/globals/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((s: { liveRefreshSeconds?: number } | null) => {
        if (!alive) return;
        void load();
        timer = setInterval(() => !document.hidden && void load(), Math.min(60, Math.max(2, s?.liveRefreshSeconds ?? 3)) * 1000);
      });
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { NEW: 0, ACKNOWLEDGED: 0, RESOLVED: 0, ALL: reports?.length ?? 0 };
    for (const r of reports ?? []) c[r.status] += 1;
    return c;
  }, [reports]);

  const rows = useMemo(
    () =>
      (reports ?? [])
        .filter((r) => tab === "ALL" || r.status === tab)
        .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || +new Date(b.reportedAt) - +new Date(a.reportedAt)),
    [reports, tab],
  );
  const current = rows.find((r) => r.id === selected) ?? rows[0] ?? null;

  async function setStatus(r: Report, status: ReportStatus) {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(r.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setReports((list) => list?.map((x) => (x.id === r.id ? { ...x, status } : x)) ?? list);
      void load();
    } catch {
      setError(true);
    }
    setBusy(false);
  }

  return (
    <div className="wb-board">
      <div className="wb-board__bar">
        <nav className="wb-tabs" aria-label="Filtr statusu zgłoszeń">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={tab === t.key}
              className={`wb-tab${tab === t.key ? " wb-tab--active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="wb-tab__count">{reports ? counts[t.key] : "–"}</span>
            </button>
          ))}
        </nav>
        <span role="status" className={`wb-live${online ? "" : " wb-live--off"}`}>
          <i aria-hidden="true" />
          {online ? `Połączono${at ? ` · ${at.toLocaleTimeString("pl-PL")}` : ""}` : "Brak połączenia z serwerem"}
        </span>
      </div>

      <div className="wb-board__grid">
        <section className="wb-card wb-board__list" aria-label="Lista zgłoszeń">
          <div className="wb-board__head" aria-hidden="true">
            <span>Urządzenie</span>
            <span>Objaw</span>
            <span>Priorytet</span>
          </div>
          {reports === null ? (
            <p className="wb-board__empty">Ładowanie…</p>
          ) : rows.length === 0 ? (
            <p className="wb-board__empty">Brak zgłoszeń w tym widoku.</p>
          ) : (
            <ul className="wb-board__rows">
              {rows.map((r) => {
                const d = deviceOf(r);
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      className={`wb-row${current?.id === r.id ? " wb-row--active" : ""}`}
                      aria-current={current?.id === r.id ? "true" : undefined}
                      onClick={() => {
                        setSelected(r.id);
                        setSide("details");
                      }}
                    >
                      <span>
                        <strong>{d.name}</strong>
                        <small>Sektor {d.sector}</small>
                      </span>
                      <span>{r.symptom}</span>
                      <span>
                        <Badge priority={r.priority} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <VerifyAside
          report={current ? { ...current, device: deviceOf(current) } : null}
          side={side}
          onSideChange={setSide}
          busy={busy}
          error={error}
          onStatus={(status) => current && void setStatus(current, status)}
        />
      </div>
    </div>
  );
}

function Badge({ priority }: { priority: Priority }) {
  return <span className={`wb-badge wb-badge--${priority.toLowerCase()}`}>{PRIORITY_LABEL[priority]}</span>;
}
