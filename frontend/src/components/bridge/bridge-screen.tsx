"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Chip, Skeleton, Table, Tabs } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { SideNav } from "@/components/ui/side-nav";
import { Screen } from "@/components/ui/screen";
import { ApiError, api, type Brief, type ReportOut } from "@/lib/api";
import { PRIORITY_LABEL, PRIORITY_RANK, STATUS_LABEL, type ReportStatus } from "@/lib/catalog";
import { ago, hm, hms } from "@/lib/format";
import { useReports } from "@/lib/hooks";

type Filter = ReportStatus | "ALL";

const PRIORITY_COLOR = { CRITICAL: "danger", MEDIUM: "warning", LOW: "default" } as const;
const STATUS_COLOR = { NEW: "accent", ACKNOWLEDGED: "default", RESOLVED: "success" } as const;

const byUrgency = (a: ReportOut, b: ReportOut) =>
  PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || b.createdAt.localeCompare(a.createdAt);

// Stanowisko mostka: oficer nie zgłasza usterek, tylko je weryfikuje (potwierdza, zamyka) i przekazuje zmianę.
export function BridgeScreen({ userName }: { userName: string }) {
  const router = useRouter();
  const { reports, online, updatedAt, fresh, refresh, patch } = useReports(2500);
  const [filter, setFilter] = useState<Filter>("NEW");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"details" | "handover">("details");
  const [actionError, setActionError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const all = useMemo(() => [...(reports ?? [])].sort(byUrgency), [reports]);
  const count = (s: Filter) => (s === "ALL" ? all.length : all.filter((r) => r.status === s).length);
  const list = filter === "ALL" ? all : all.filter((r) => r.status === filter);
  const selected = all.find((r) => r.id === selectedId) ?? list[0];
  const critical = all.filter((r) => r.status !== "RESOLVED" && r.priority === "CRITICAL").length;

  async function changeStatus(r: ReportOut, status: ReportStatus) {
    setActionError(null);
    const before = r.status;
    patch(r.id, { status });
    try {
      await api.setStatus(r.id, status);
    } catch (e) {
      patch(r.id, { status: before });
      setActionError(
        e instanceof ApiError && (e.status === 401 || e.status === 403)
          ? "Sesja wygasła. Zaloguj się ponownie."
          : e instanceof ApiError
            ? `Nie udało się zmienić statusu (${e.message}).`
            : "Brak połączenia z serwerem.",
      );
    }
    void refresh();
  }

  return (
    <Screen tone="light">
      <div className="absolute inset-0 flex">
        <SideNav active="mostek" critical={critical} pending={count("NEW")} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-3 lg:px-10" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
            <h1 className="type-title lg:text-[2rem]">Weryfikacja zgłoszeń</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-body text-slate">{userName}</span>
              <Link href="/admin" className={`${buttonVariants({ variant: "outline", size: "sm" })} rounded-full`}>
                Panel CMS
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onPress={async () => {
                  await api.logout().catch(() => {});
                  router.push("/admin/login");
                }}
              >
                Wyloguj
              </Button>
            </div>
            <div role="status" className="flex items-center gap-2">
              <Chip color={online ? "success" : "danger"} variant="soft" size="lg">
                <span aria-hidden="true" className={`size-2 rounded-full ${online ? "bg-current" : "bg-current"}`} />
                <Chip.Label>
                  {online ? `Połączono${updatedAt ? ` · ${hms(updatedAt)}` : ""}` : "Brak połączenia z serwerem"}
                </Chip.Label>
              </Chip>
            </div>
          </header>

          <div className="px-4 lg:px-10">
            <Tabs selectedKey={filter} onSelectionChange={(k) => setFilter(String(k) as Filter)} className="w-full lg:max-w-2xl">
              <Tabs.ListContainer>
                <Tabs.List aria-label="Filtr statusu" className="w-full">
                  {(["NEW", "ACKNOWLEDGED", "RESOLVED", "ALL"] as const).map((s) => (
                    <Tabs.Tab key={s} id={s} className="flex-1">
                      <span className="inline-flex items-center gap-2">
                        {s === "ALL" ? "Wszystkie" : STATUS_LABEL[s]}
                        <span className="tabular-nums text-slate">{count(s)}</span>
                      </span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>

          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-4 pt-4 pb-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:overflow-hidden lg:px-10">
            <section aria-label="Lista zgłoszeń" className="wb-card flex min-h-0 flex-col overflow-hidden rounded-3xl">
              {!reports ? (
                <div className="flex flex-col gap-3 p-5" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <p className="type-body p-8 text-center text-slate">Brak zgłoszeń w tej kategorii.</p>
              ) : (
                <Table className="min-h-0 flex-1 overflow-y-auto bg-transparent">
                  <Table.ScrollContainer>
                    <Table.Content
                      aria-label="Zgłoszenia usterek"
                      className="min-w-[560px]"
                      selectionMode="single"
                      selectedKeys={selected ? new Set([selected.id]) : new Set()}
                      onSelectionChange={(keys) => {
                        const k = keys === "all" ? null : [...keys][0];
                        if (k) setSelectedId(String(k));
                      }}
                    >
                      <Table.Header>
                        <Table.Column isRowHeader>Urządzenie</Table.Column>
                        <Table.Column>Objaw</Table.Column>
                        <Table.Column>Priorytet</Table.Column>
                        <Table.Column>Zgłoszono</Table.Column>
                        {filter === "ALL" && <Table.Column>Status</Table.Column>}
                      </Table.Header>
                      <Table.Body>
                        {list.map((r) => (
                          <Table.Row key={r.id} id={r.id} textValue={`${r.deviceName}: ${r.symptom}`} className={fresh.has(r.id) ? "bg-aqua/15" : undefined}>
                            <Table.Cell>
                              <span className="type-headline block min-w-40">{r.deviceName}</span>
                              <span className="type-caption text-slate">Sektor {r.sector ?? "?"}</span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="type-body">{r.symptom}</span>
                              {fresh.has(r.id) && (
                                <Chip size="sm" color="accent" variant="primary" className="ml-2">
                                  <Chip.Label>Nowe</Chip.Label>
                                </Chip>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              <Chip color={PRIORITY_COLOR[r.priority]} variant={r.priority === "CRITICAL" ? "primary" : "soft"}>
                                <Chip.Label>{PRIORITY_LABEL[r.priority]}</Chip.Label>
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="type-body tabular-nums">{hm(r.createdAt)}</span>
                              <span className="type-caption block whitespace-nowrap text-slate">{ago(r.createdAt, now)}</span>
                            </Table.Cell>
                            {filter === "ALL" && (
                            <Table.Cell>
                              <Chip color={STATUS_COLOR[r.status]} variant="soft" className="whitespace-nowrap">
                                <Chip.Label className="whitespace-nowrap">{STATUS_LABEL[r.status]}</Chip.Label>
                              </Chip>
                            </Table.Cell>
                            )}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              )}
            </section>

            <aside aria-label="Panel szczegółów" className="wb-card flex min-h-0 flex-col overflow-hidden rounded-3xl">
              <Tabs selectedKey={panel} onSelectionChange={(k) => setPanel(String(k) as "details" | "handover")} className="px-4 pt-4">
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Panel" className="w-full">
                    <Tabs.Tab id="details" className="flex-1">
                      Szczegóły
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="handover" className="flex-1">
                      Zmiana wachty
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
              </Tabs>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {panel === "details" ? (
                  <ReportDetails report={selected} now={now} error={actionError} onStatus={changeStatus} />
                ) : (
                  <Handover />
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function ReportDetails({ report, now, error, onStatus }: { report?: ReportOut; now: number; error: string | null; onStatus: (r: ReportOut, s: ReportStatus) => void }) {
  if (!report) return <p className="type-body text-slate">Wybierz zgłoszenie z listy.</p>;
  const rows: [string, string][] = [
    ["Sektor", report.sector ?? "?"],
    ["Zgłoszono", `${hm(report.createdAt)} (${ago(report.createdAt, now)})`],
    ["Odebrano przez serwer", hm(report.receivedAt)],
  ];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip color={PRIORITY_COLOR[report.priority]} variant={report.priority === "CRITICAL" ? "primary" : "soft"}>
            <Chip.Label>{PRIORITY_LABEL[report.priority]}</Chip.Label>
          </Chip>
          <Chip color={STATUS_COLOR[report.status]} variant="soft">
            <Chip.Label>{STATUS_LABEL[report.status]}</Chip.Label>
          </Chip>
        </div>
        <h2 className="type-title mt-3 text-[1.75rem]">{report.deviceName}</h2>
        <p className="type-headline mt-1 text-sea">{report.symptom}</p>
        {report.note && <p className="type-body mt-3 rounded-2xl bg-ink/5 px-4 py-3">{report.note}</p>}
      </div>

      <dl className="divide-y divide-ink/10">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="type-body text-slate">{k}</dt>
            <dd className="type-headline text-right tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      {error && (
        <p role="alert" className="type-body rounded-2xl bg-alert/10 px-4 py-3 text-alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {report.status === "NEW" && (
          <>
            <Button variant="primary" size="lg" fullWidth onPress={() => onStatus(report, "ACKNOWLEDGED")} className="wb-lift h-12 rounded-full font-semibold">
              Potwierdź zgłoszenie
            </Button>
            <Button variant="outline" size="lg" fullWidth onPress={() => onStatus(report, "RESOLVED")} className="h-12 rounded-full font-semibold">
              Oznacz jako rozwiązane
            </Button>
          </>
        )}
        {report.status === "ACKNOWLEDGED" && (
          <>
            <Button variant="primary" size="lg" fullWidth onPress={() => onStatus(report, "RESOLVED")} className="wb-lift h-12 rounded-full font-semibold">
              Oznacz jako rozwiązane
            </Button>
            <Button variant="ghost" size="lg" fullWidth onPress={() => onStatus(report, "NEW")} className="h-12 rounded-full font-semibold">
              Cofnij do weryfikacji
            </Button>
          </>
        )}
        {report.status === "RESOLVED" && (
          <Button variant="outline" size="lg" fullWidth onPress={() => onStatus(report, "NEW")} className="h-12 rounded-full font-semibold">
            Otwórz ponownie
          </Button>
        )}
      </div>
    </div>
  );
}

function Handover() {
  const [brief, setBrief] = useState<Brief | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .latestBrief()
      .then((b) => alive && setBrief(b ?? null))
      .catch(() => alive && (setBrief(null), setError("Nie mogę pobrać ostatniego briefu.")));
    return () => {
      alive = false;
    };
  }, []);

  async function run(action: () => Promise<Brief>) {
    setBusy(true);
    setError(null);
    try {
      setBrief(await action());
    } catch {
      setError("Operacja nie powiodła się. Sprawdź połączenie z serwerem.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {brief === undefined ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : brief ? (
        <>
          <pre className="type-caption max-h-80 overflow-auto rounded-2xl bg-ink/5 p-4 font-mono leading-relaxed whitespace-pre-wrap">{brief.text}</pre>
          <p className="type-caption text-slate tabular-nums">
            Wygenerowano {hm(brief.createdAt)}
            {brief.takenOverAt ? ` · wachta przejęta ${hm(brief.takenOverAt)}` : ""}
          </p>
        </>
      ) : (
        <p className="type-body text-slate">Nie wygenerowano jeszcze briefu zmiany.</p>
      )}

      {error && (
        <p role="alert" className="type-body rounded-2xl bg-alert/10 px-4 py-3 text-alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button variant={brief && !brief.takenOverAt ? "outline" : "primary"} size="lg" fullWidth isPending={busy} onPress={() => void run(api.generateBrief)} className="h-12 rounded-full font-semibold">
          Generuj brief zmiany
        </Button>
        {brief && !brief.takenOverAt && (
          <Button variant="primary" size="lg" fullWidth isPending={busy} onPress={() => void run(() => api.takeOver(brief.handoverId))} className="wb-lift h-12 rounded-full font-semibold">
            Przejmuję wachtę
          </Button>
        )}
      </div>
    </div>
  );
}
