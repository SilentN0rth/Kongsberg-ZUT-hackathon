"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, Card, Chip, Drawer, Popover, Skeleton, Tabs } from "@heroui/react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { BellIcon, ClockIcon, MenuIcon, PlusIcon } from "@/components/ui/icons";
import { DeviceGlyph } from "@/components/devices/device-glyphs";
import { DeviceSheet, SHEET_SPRING } from "@/components/devices/device-sheet";
import { PRIORITY_LABEL, PRIORITY_RANK, type Priority } from "@/lib/catalog";
import { DEFAULT_WATCHES, currentWatch, watchTitle, watchWindow } from "@/lib/watch";
import { useOutboxCount } from "@/lib/queue";
import { useDevices, useReports, useSettings } from "@/lib/hooks";
import { useLenis } from "@/lib/use-lenis";

const DOT: Record<Priority, { color: "danger" | "warning" | "accent"; label: string }> = {
  CRITICAL: { color: "danger", label: "Krytyczna usterka" },
  MEDIUM: { color: "warning", label: "Otwarte zgłoszenie (średni priorytet)" },
  LOW: { color: "accent", label: "Otwarte zgłoszenie (niski priorytet)" },
};

type Filter = "all" | "open";

// Press and hover live in Motion (not CSS) because Motion also owns the card's transform during the open animation.
const CARD_VARIANTS = { hover: { y: -4 } };
const GLYPH_VARIANTS = { hover: { scale: 1.08 } };

export function DevicesScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const lastOpener = useRef<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useLenis(
    scrollRef,
    contentRef,
    useCallback((y: number) => setScrolled(y > 8), []),
  );

  // Freeze the list scroll while a card is open.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (selectedId) lenis?.stop();
    else lenis?.start();
  }, [selectedId, lenisRef]);

  const { devices, error } = useDevices();
  const { reports } = useReports();
  const settings = useSettings();
  const watch = currentWatch(settings?.watches?.length ? settings.watches : DEFAULT_WATCHES, settings?.timezone ?? "Europe/Warsaw");
  const queued = useOutboxCount();

  // Highest-priority unresolved report per device drives the dot on the card.
  const worst = new Map<string, Priority>();
  for (const r of reports ?? []) {
    if (r.status === "RESOLVED") continue;
    const cur = worst.get(r.deviceId);
    if (!cur || PRIORITY_RANK[r.priority] > PRIORITY_RANK[cur]) worst.set(r.deviceId, r.priority);
  }
  const unresolved = (reports ?? []).filter((r) => r.status !== "RESOLVED");
  const critical = unresolved.filter((r) => r.priority === "CRITICAL").length;
  const notifications = unresolved.slice(0, 5);

  const list = (devices ?? []).filter((d) => filter === "all" || worst.has(d.id));
  const selected = selectedId ? devices?.find((d) => d.id === selectedId) : undefined;

  const openCard = (id: string) => {
    lastOpener.current = id;
    setSelectedId(id);
  };
  const closeCard = useCallback(() => setSelectedId(null), []);

  return (
    <>
      <div className="absolute inset-0 flex">
        <div className="relative min-w-0 flex-1">
      <header
        data-scrolled={scrolled}
        className="wb-bar absolute inset-x-0 top-0 z-10 grid grid-cols-[3rem_1fr_3rem] items-center px-5 pb-3"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <Drawer>
          <Button isIconOnly variant="ghost" aria-label="Menu" className="size-12 rounded-full [&_svg]:size-7">
            <MenuIcon width={28} height={28} />
          </Button>
          <Drawer.Backdrop>
            <Drawer.Content placement="left">
              <Drawer.Dialog>
                <Drawer.CloseTrigger />
                <Drawer.Header>
                  <Drawer.Heading>{watchTitle(watch)}</Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="flex flex-col gap-4">
                  <p className="type-body flex items-center gap-2 text-muted">
                    <ClockIcon width={20} height={20} />
                    {watch ? watchWindow(watch) : "Brak aktywnej wachty"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip color="danger" variant="soft">
                      <Chip.Label>{critical} krytyczne</Chip.Label>
                    </Chip>
                    <Chip color="warning" variant="soft">
                      <Chip.Label>{unresolved.length} otwarte</Chip.Label>
                    </Chip>
                    {queued > 0 && (
                      <Chip variant="soft">
                        <Chip.Label>{queued} czeka na sieć</Chip.Label>
                      </Chip>
                    )}
                  </div>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button slot="close" variant="secondary">
                    Zamknij
                  </Button>
                </Drawer.Footer>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>

        <h1 className="type-title text-center text-ink">Urządzenia</h1>

        <Popover>
          <Button isIconOnly variant="ghost" aria-label={`Powiadomienia (${notifications.length})`} className="size-12 rounded-full [&_svg]:size-7">
            <Badge.Anchor>
              <BellIcon width={28} height={28} />
              {notifications.length > 0 && <Badge color="danger" size="sm" aria-hidden="true" />}
            </Badge.Anchor>
          </Button>
          <Popover.Content className="w-72">
            <Popover.Dialog>
              <Popover.Heading>Powiadomienia</Popover.Heading>
              {notifications.length === 0 ? (
                <p className="type-body mt-2 text-muted">Brak nowych zgłoszeń.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {notifications.map((r) => (
                    <li key={r.id} className="rounded-xl px-2 py-2 hover:bg-default">
                      <p className="type-headline">
                        {r.deviceName}: {r.symptom.toLowerCase()}
                      </p>
                      <p className="type-caption text-muted tabular-nums">
                        {new Date(r.createdAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} · {PRIORITY_LABEL[r.priority]}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </header>

      {/* layoutScroll: tells Motion this container scrolls, so shared-element measurements stay correct */}
      <motion.div
        ref={scrollRef}
        layoutScroll
        className="absolute inset-0 overflow-y-auto overscroll-contain"
        style={{ paddingTop: "calc(5.25rem + env(safe-area-inset-top))" } as CSSProperties}
      >
        <div ref={contentRef} className="mx-auto max-w-[1400px] px-4 pb-36 lg:px-10 lg:pb-16">
          <Tabs selectedKey={filter} onSelectionChange={(k) => setFilter(String(k) as Filter)} className="mb-4 w-full lg:mb-6 lg:max-w-sm">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Filtr urządzeń" className="w-full">
                <Tabs.Tab id="all" className="flex-1">
                  Wszystkie
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="open" className="flex-1">
                  Z usterką
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>

          {error && (
            <p role="alert" className="type-body mb-4 rounded-2xl bg-alert/10 px-4 py-3 text-alert">
              Nie mogę pobrać urządzeń. Sprawdź połączenie z komputerem na mostku.
            </p>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
            {!devices &&
              !error &&
              Array.from({ length: 6 }, (_, i) => (
                <li key={i} aria-hidden="true">
                  <Skeleton className="h-[13.5rem] rounded-3xl lg:h-[17rem]" />
                </li>
              ))}
            {list.map((d) => {
              const dot = worst.has(d.id) ? DOT[worst.get(d.id)!] : undefined;
              return (
                <li key={d.id} className="min-h-[13.5rem] lg:min-h-[17rem]">
                  {selectedId !== d.id && (
                    <Badge.Anchor className="block h-full">
                      <motion.div
                        id={`card-btn-${d.id}`}
                        layoutId={`card-${d.id}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Otwórz szczegóły: ${d.name}`}
                        onClick={() => openCard(d.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openCard(d.id);
                          }
                        }}
                        variants={CARD_VARIANTS}
                        whileHover="hover"
                        whileTap={{ scale: 0.97 }}
                        transition={SHEET_SPRING}
                        style={{ borderRadius: 24 }}
                        className="h-full cursor-pointer"
                      >
                        <Card className="wb-card wb-squircle h-full min-h-[13.5rem] items-center rounded-3xl px-3 pt-5 pb-4 text-center lg:min-h-[17rem]">
                          <Card.Header className="items-center">
                            <Card.Title className="type-headline">{d.name}</Card.Title>
                            <Card.Description className="type-caption">
                              Sektor {d.sector}
                            </Card.Description>
                          </Card.Header>
                          <Card.Content className="flex flex-1 items-center justify-center pt-2">
                            <motion.div layoutId={`glyph-${d.id}`} variants={GLYPH_VARIANTS} transition={SHEET_SPRING} className="size-24 lg:size-32">
                              <DeviceGlyph id={d.id} className="size-full" />
                            </motion.div>
                          </Card.Content>
                        </Card>
                      </motion.div>
                      {dot && <Badge color={dot.color} size="sm" aria-label={dot.label} />}
                    </Badge.Anchor>
                  )}
                </li>
              );
            })}
            <li>
              <Link
                href="/skanuj"
                className="wb-press wb-squircle type-headline flex h-full min-h-[13.5rem] flex-col items-center justify-center gap-2 rounded-3xl border-2 lg:min-h-[17rem] border-dashed border-sea/45 bg-white/25 px-3 text-center font-medium text-sea backdrop-blur-sm transition-colors hover:bg-white/60"
              >
                <PlusIcon width={30} height={30} />
                Zgłoś usterkę
              </Link>
            </li>
          </ul>
        </div>
      </motion.div>

      <BottomNav active="home" />
        </div>
      </div>

      <AnimatePresence
        onExitComplete={() => {
          if (lastOpener.current) document.getElementById(`card-btn-${lastOpener.current}`)?.focus();
        }}
      >
        {selected && (
          <DeviceSheet key={selected.id} device={selected} reports={(reports ?? []).filter((r) => r.deviceId === selected.id)} onClose={closeCard} />
        )}
      </AnimatePresence>
    </>
  );
}
