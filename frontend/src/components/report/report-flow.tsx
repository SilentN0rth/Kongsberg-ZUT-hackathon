"use client";

import Link from "next/link";
import { useId, useState, type ComponentType, type SVGProps } from "react";
import { Button, Chip, FieldError, Label, TextArea, TextField } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { DeviceGlyph } from "@/components/devices/device-glyphs";
import { TileRadio } from "@/components/report/tile-radio";
import {
  AlertIcon,
  CheckIcon,
  ChevronLeftIcon,
  CloudOffIcon,
  DropIcon,
  FlameIcon,
  GaugeIcon,
  HeatIcon,
  PinIcon,
  PowerIcon,
  SoundIcon,
  VibrationIcon,
} from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { newId } from "@/lib/id";
import { PRIORITIES, PRIORITY_LABEL, SECTORS, SYMPTOMS, type Priority } from "@/lib/catalog";
import { useDevices, useReports } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { submitReport, useOutboxCount } from "@/lib/queue";
import { validateReport } from "@/lib/schemas";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const SYMPTOM_ICON: Record<(typeof SYMPTOMS)[number], IconType> = {
  Wyciek: DropIcon,
  "Nietypowy hałas": SoundIcon,
  "Spadek ciśnienia": GaugeIcon,
  "Podwyższona temperatura": HeatIcon,
  Drgania: VibrationIcon,
  "Brak odpowiedzi": PowerIcon,
  "Zapach spalenizny": FlameIcon,
  "Alarm na panelu": AlertIcon,
};

const PRIORITY_TONE: Record<Priority, string> = {
  CRITICAL: "var(--color-alert)",
  MEDIUM: "var(--color-signal)",
  LOW: "var(--color-aqua)",
};

function Step({ n, title, done, error, children }: { n: number; title: string; done: boolean; error?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`grid size-8 shrink-0 place-items-center rounded-full text-base font-semibold ${
            done ? "bg-aqua text-ink" : "border-2 border-ink/20 text-slate"
          }`}
        >
          {done ? <CheckIcon width={18} height={18} /> : n}
        </span>
        <h2 id={id} className="type-title text-[1.375rem]">
          {title}
        </h2>
      </div>
      {children}
      {error && (
        <p role="alert" className="type-body text-alert">
          {error}
        </p>
      )}
    </section>
  );
}

export function ReportFlow({ initialDeviceId }: { initialDeviceId?: string }) {
  const { devices, error: devicesError } = useDevices();
  const { reports } = useReports(8000);
  const queued = useOutboxCount();

  const [deviceId, setDeviceId] = useState(initialDeviceId ?? "");
  const [sector, setSector] = useState<string>("");
  const [symptom, setSymptom] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: "sent" | "queued"; time: string } | null>(null);

  const device = devices?.find((d) => d.id === deviceId);
  const fromCode = Boolean(initialDeviceId) && deviceId === initialDeviceId;
  const unknownDevice = Boolean(deviceId) && devices && !device;
  const openHere = reports?.filter((r) => r.deviceId === deviceId && r.status !== "RESOLVED") ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const checked = validateReport({ deviceId: unknownDevice ? "" : deviceId, symptom, priority, note: note || undefined });
    if (!checked.ok) {
      setErrors(checked.errors);
      document.getElementById("report-form")?.querySelector<HTMLElement>("[role=alert]")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setErrors({});
    setSubmitError(null);
    setBusy(true);
    try {
      const status = await submitReport({
        id: newId(),
        deviceId: checked.data.deviceId,
        symptom: checked.data.symptom,
        priority: checked.data.priority,
        note: checked.data.note || undefined,
        createdAt: new Date().toISOString(),
      });
      setResult({ status, time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) });
    } catch (e) {
      setSubmitError(e instanceof ApiError ? `Serwer odrzucił zgłoszenie: ${e.message}` : "Nie udało się wysłać zgłoszenia.");
    }
    setBusy(false);
  }

  function reset() {
    setDeviceId("");
    setSector("");
    setSymptom("");
    setPriority("");
    setNote("");
    setErrors({});
    setResult(null);
  }

  if (result) {
    return (
      <Screen tone="light">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 overflow-y-auto px-6 pt-16 pb-10">
          <span className={`grid size-20 place-items-center rounded-full ${result.status === "sent" ? "bg-aqua text-ink" : "bg-signal text-ink"}`}>
            {result.status === "sent" ? <CheckIcon width={44} height={44} /> : <CloudOffIcon width={44} height={44} />}
          </span>
          <div role="status">
            <h1 className="type-title text-[2rem] text-balance">{result.status === "sent" ? "Zgłoszenie wysłane" : "Zapisane, czeka na sieć"}</h1>
            <p className="type-body mt-2 text-slate">
              {result.status === "sent"
                ? "Mostek widzi je już na swojej liście."
                : "Wyślemy je automatycznie, gdy wróci połączenie. Możesz wracać do pracy."}
            </p>
          </div>
          <dl className="wb-card divide-y divide-ink/10 rounded-3xl px-5">
            {[
              ["Urządzenie", device?.name ?? deviceId],
              ["Objaw", symptom],
              ["Priorytet", priority ? PRIORITY_LABEL[priority] : ""],
              ["Godzina", result.time],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="type-body text-slate">{k}</dt>
                <dd className="type-headline tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex flex-col gap-3">
            <Button variant="primary" size="lg" fullWidth onPress={reset} className="wb-lift h-14 rounded-full text-[1.0625rem] font-semibold">
              Zgłoś kolejną usterkę
            </Button>
            <Link href="/urzadzenia" className={`${buttonVariants({ variant: "outline", size: "lg", fullWidth: true })} h-14 rounded-full text-[1.0625rem] font-semibold`}>
              Wróć do listy
            </Link>
          </div>
        </main>
      </Screen>
    );
  }

  return (
    <Screen tone="light">
      <header
        className="wb-glass relative z-10 flex shrink-0 items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Link
          href="/urzadzenia"
          aria-label="Wróć do listy urządzeń"
          className={`${buttonVariants({ variant: "ghost", isIconOnly: true })} size-12 rounded-full [&_svg]:size-7`}
        >
          <ChevronLeftIcon width={28} height={28} />
        </Link>
        <h1 className="type-title flex-1 text-[1.5rem]">Zgłoś usterkę</h1>
        {queued > 0 && (
          <Chip color="warning" variant="soft" size="lg">
            <CloudOffIcon width={16} height={16} />
            <Chip.Label>Czeka: {queued}</Chip.Label>
          </Chip>
        )}
      </header>

      <form id="report-form" onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex max-w-md flex-col gap-9 px-4 pt-6 pb-8">
            <Step n={1} title="Gdzie?" done={Boolean(device)} error={errors.deviceId?.[0] ?? (unknownDevice ? `Nieznane urządzenie: ${deviceId}` : undefined)}>
              {device ? (
                <div className="wb-card flex items-center gap-4 rounded-3xl p-4">
                  <DeviceGlyph id={device.id} className="size-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="type-headline">{device.name}</p>
                    <p className="type-caption text-slate">
                      Sektor {device.sector} · {device.serial}
                    </p>
                    {fromCode && (
                      <span className="type-caption mt-1 inline-flex items-center gap-1 text-sea">
                        <PinIcon width={14} height={14} /> Z kodu przy urządzeniu
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" onPress={() => setDeviceId("")} className="rounded-full">
                    Zmień
                  </Button>
                </div>
              ) : (
                <>
                  {devicesError && (
                    <p role="alert" className="type-body text-alert">
                      Nie mogę pobrać listy urządzeń. Sprawdź połączenie z komputerem na mostku.
                    </p>
                  )}
                  <div role="radiogroup" aria-label="Sektor" className="grid grid-cols-4 gap-2">
                    {SECTORS.map((s) => (
                      <TileRadio key={s} name="sektor" value={s} checked={sector === s} onSelect={setSector} className="min-h-16 justify-center">
                        <span className="type-title text-[1.5rem]">{s}</span>
                      </TileRadio>
                    ))}
                  </div>
                  {sector ? (
                    <div role="radiogroup" aria-label="Urządzenie" className="grid grid-cols-2 gap-2">
                      {devices?.filter((d) => d.sector === sector).map((d) => (
                        <TileRadio key={d.id} name="urzadzenie" value={d.id} checked={deviceId === d.id} onSelect={setDeviceId} className="min-h-20 pr-9">
                          <span className="type-headline">{d.name}</span>
                        </TileRadio>
                      ))}
                    </div>
                  ) : (
                    <p className="type-body text-slate">Wybierz sektor, potem urządzenie. Albo zeskanuj kod przy urządzeniu.</p>
                  )}
                </>
              )}
              {openHere.length > 0 && (
                <p className="type-body flex items-start gap-2 rounded-2xl bg-signal/20 px-4 py-3 text-ink">
                  <AlertIcon width={22} height={22} className="mt-0.5 shrink-0" />
                  Dla tego urządzenia są już {openHere.length} otwarte zgłoszenia ({openHere.map((r) => r.symptom.toLowerCase()).join(", ")}).
                </p>
              )}
            </Step>

            <Step n={2} title="Co się dzieje?" done={Boolean(symptom)} error={errors.symptom?.[0]}>
              <div role="radiogroup" aria-label="Objaw" className="grid grid-cols-2 gap-2">
                {SYMPTOMS.map((s) => {
                  const Icon = SYMPTOM_ICON[s];
                  return (
                    <TileRadio key={s} name="objaw" value={s} checked={symptom === s} onSelect={setSymptom} className="min-h-24 flex-col items-start justify-between pr-9">
                      <Icon width={30} height={30} className="text-sea" />
                      <span className="type-headline">{s}</span>
                    </TileRadio>
                  );
                })}
              </div>
            </Step>

            <Step n={3} title="Jak pilne?" done={Boolean(priority)} error={errors.priority?.[0]}>
              <div role="radiogroup" aria-label="Priorytet" className="flex flex-col gap-2">
                {PRIORITIES.map((p) => (
                  <TileRadio key={p.id} name="priorytet" value={p.id} checked={priority === p.id} onSelect={(v) => setPriority(v as Priority)} tone={PRIORITY_TONE[p.id]} className="min-h-20 gap-4 pr-10">
                    <span aria-hidden="true" className="size-4 shrink-0 rounded-full" style={{ background: PRIORITY_TONE[p.id] }} />
                    <span className="flex flex-col">
                      <span className="type-headline">{p.label}</span>
                      <span className="type-caption text-slate">{p.hint}</span>
                    </span>
                  </TileRadio>
                ))}
              </div>
            </Step>

            <Step n={4} title="Notatka" done={note.trim().length > 0}>
              <TextField value={note} onChange={setNote} isInvalid={Boolean(errors.note)} fullWidth>
                <Label>Opcjonalnie</Label>
                <TextArea rows={3} placeholder="np. rośnie z godziny na godzinę" maxLength={400} />
                <FieldError>{errors.note?.[0]}</FieldError>
              </TextField>
              <p className="type-caption text-right text-slate tabular-nums">{note.trim().length}/280</p>
            </Step>
          </div>
        </div>

        <div className="wb-glass shrink-0 px-4 pt-3" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          {submitError && (
            <p role="alert" className="type-body mx-auto mb-2 max-w-md text-alert">
              {submitError}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" fullWidth isPending={busy} className="wb-lift mx-auto h-14 max-w-md rounded-full text-[1.0625rem] font-semibold">
            Wyślij zgłoszenie
          </Button>
        </div>
      </form>
    </Screen>
  );
}
