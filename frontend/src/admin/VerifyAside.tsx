"use client";

import { Button, Chip, Separator, Tabs } from "@heroui/react";
import { BriefPanel } from "@/admin/BriefPanel";
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type ReportStatus } from "@/lib/catalog";

export type AsideReport = {
  id: string;
  symptom: string;
  priority: Priority;
  status: ReportStatus;
  note?: string | null;
  reportedAt: string;
  createdAt: string;
  device: { name: string; sector: string };
};

type Side = "details" | "handover";

const PRIORITY_COLOR = { CRITICAL: "danger", MEDIUM: "warning", LOW: "default" } as const;
const STATUS_COLOR = { NEW: "accent", ACKNOWLEDGED: "warning", RESOLVED: "success" } as const;

const hm = (iso: string) => new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

function ago(iso: string) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "przed chwilą";
  if (min < 60) return `${min} min temu`;
  const h = Math.floor(min / 60);
  return h < 24 ? `${h} godz. temu` : `${Math.floor(h / 24)} dni temu`;
}

type Props = {
  report: AsideReport | null;
  side: Side;
  onSideChange: (side: Side) => void;
  busy: boolean;
  error: boolean;
  onStatus: (status: ReportStatus) => void;
};

// Panel boczny pulpitu zbudowany z komponentów HeroUI (Tabs, Chip, Button, Separator) na szklanym tle.
export function VerifyAside({ report: r, side, onSideChange, busy, error, onStatus }: Props) {
  return (
    <aside className="wb-aside" aria-label="Szczegóły zgłoszenia">
      <Tabs selectedKey={side} onSelectionChange={(key) => onSideChange(key as Side)} className="wb-aside__tabs">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Widok panelu bocznego">
            <Tabs.Tab id="details">
              Szczegóły
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="handover">
              Zmiana wachty
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <div className="wb-aside__body">
        {side === "handover" ? (
          <BriefPanel />
        ) : !r ? (
          <p className="wb-board__empty">Wybierz zgłoszenie z listy.</p>
        ) : (
          <>
            <div className="wb-aside__chips">
              <Chip color={PRIORITY_COLOR[r.priority]} variant={r.priority === "CRITICAL" ? "primary" : "soft"}>
                <Chip.Label>{PRIORITY_LABEL[r.priority]}</Chip.Label>
              </Chip>
              <Chip color={STATUS_COLOR[r.status]} variant="soft">
                <Chip.Label>{STATUS_LABEL[r.status]}</Chip.Label>
              </Chip>
            </div>

            <header className="wb-aside__head">
              <h2>{r.device.name}</h2>
              <p>{r.symptom}</p>
            </header>

            {r.note && <blockquote className="wb-aside__note">{r.note}</blockquote>}

            <dl className="wb-aside__facts">
              <dt>Sektor</dt>
              <dd>{r.device.sector}</dd>
              <dt>Zgłoszono</dt>
              <dd>
                {hm(r.reportedAt)} <span>({ago(r.reportedAt)})</span>
              </dd>
              <dt>Odebrano przez serwer</dt>
              <dd>{hm(r.createdAt)}</dd>
            </dl>

            <Separator />

            <div className="wb-aside__actions">
              {r.status === "NEW" && (
                <>
                  <Button variant="primary" fullWidth isPending={busy} onPress={() => onStatus("ACKNOWLEDGED")}>
                    Potwierdź zgłoszenie
                  </Button>
                  <Button variant="secondary" fullWidth isDisabled={busy} onPress={() => onStatus("RESOLVED")}>
                    Oznacz jako rozwiązane
                  </Button>
                </>
              )}
              {r.status === "ACKNOWLEDGED" && (
                <>
                  <Button variant="primary" fullWidth isPending={busy} onPress={() => onStatus("RESOLVED")}>
                    Oznacz jako rozwiązane
                  </Button>
                  <Button variant="secondary" fullWidth isDisabled={busy} onPress={() => onStatus("NEW")}>
                    Cofnij do weryfikacji
                  </Button>
                </>
              )}
              {r.status === "RESOLVED" && (
                <Button variant="secondary" fullWidth isPending={busy} onPress={() => onStatus("NEW")}>
                  Otwórz ponownie
                </Button>
              )}
              <a className="wb-aside__link" href={`/admin/collections/reports/${encodeURIComponent(r.id)}`}>
                Otwórz pełny wpis w CMS
              </a>
            </div>
            {error && (
              <p role="alert" className="wb-admin-error">
                Nie udało się zmienić statusu.
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
