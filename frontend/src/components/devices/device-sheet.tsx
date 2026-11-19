"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Button, Chip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { CloseIcon } from "@/components/ui/icons";
import { DeviceGlyph } from "@/components/devices/device-glyphs";
import type { Device, ReportOut } from "@/lib/api";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/catalog";
import { useMedia } from "@/lib/use-media";

// Critically damped spring: grows without bounce, like the App Store card.
export const SHEET_SPRING = { type: "spring", bounce: 0, duration: 0.5 } as const;

const PRIORITY_COLOR = { CRITICAL: "danger", MEDIUM: "warning", LOW: "default" } as const;
const time = (iso: string) => new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

// Phone: the card fills the screen. From `lg`: a centred panel, hero on the left, details on the right.
export function DeviceSheet({ device, reports, onClose }: { device: Device; reports: ReportOut[]; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMedia("(min-width: 1024px)");

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const open = reports.filter((r) => r.status !== "RESOLVED");

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-30 bg-ink/35 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 z-40 flex lg:items-center lg:justify-center lg:p-10">
        <motion.div
          layoutId={`card-${device.id}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`sheet-title-${device.id}`}
          className="pointer-events-auto relative flex h-full w-full flex-col overflow-hidden lg:h-[min(640px,100%)] lg:max-w-[980px] lg:flex-row lg:shadow-[0_30px_80px_rgb(3_42_57/0.35)]"
          style={{ borderRadius: isDesktop ? 32 : 0 }}
          initial={{ backgroundColor: "rgb(255 255 255 / 0.55)" }}
          animate={{ backgroundColor: "rgb(255 255 255 / 1)" }}
          exit={{ backgroundColor: "rgb(255 255 255 / 0.55)" }}
          transition={SHEET_SPRING}
        >
          <div className="relative flex shrink-0 items-center justify-center bg-linear-to-b from-ice via-ice/60 to-white pt-16 pb-6 lg:w-[42%] lg:bg-linear-to-br lg:from-ice lg:to-white lg:p-10">
            <Button
              ref={closeRef}
              isIconOnly
              variant="tertiary"
              onPress={onClose}
              aria-label="Zamknij szczegóły"
              className="wb-glass-chip absolute top-5 right-5 size-11 rounded-full text-ink [&_svg]:size-6"
            >
              <CloseIcon width={24} height={24} />
            </Button>
            <motion.div layoutId={`glyph-${device.id}`} transition={SHEET_SPRING} className="size-44 lg:size-60">
              <DeviceGlyph id={device.id} className="size-full" />
            </motion.div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <motion.div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-6 lg:px-10 lg:pt-12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { ...SHEET_SPRING, delay: 0.12 } }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
            >
              <h2 id={`sheet-title-${device.id}`} className="type-title text-ink lg:text-[2.25rem]">
                {device.name}
              </h2>
              <p className="type-body mt-1 text-slate">
                Sektor {device.sector} · {device.serial}
              </p>

              <h3 className="type-headline mt-6">Otwarte zgłoszenia</h3>
              {open.length === 0 ? (
                <p className="type-body mt-2 text-slate">Brak otwartych zgłoszeń dla tego urządzenia.</p>
              ) : (
                <ul className="mt-2 divide-y divide-ink/10">
                  {open.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="type-headline">{r.symptom}</p>
                        <p className="type-caption text-slate tabular-nums">
                          {time(r.createdAt)} · {STATUS_LABEL[r.status]}
                        </p>
                      </div>
                      <Chip color={PRIORITY_COLOR[r.priority]} variant="soft">
                        <Chip.Label>{PRIORITY_LABEL[r.priority]}</Chip.Label>
                      </Chip>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            <div
              className="wb-glass shrink-0 px-6 pt-4 lg:px-10"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <Link
                href={`/zglos?urzadzenie=${encodeURIComponent(device.id)}`}
                className={`${buttonVariants({ variant: "primary", size: "lg", fullWidth: true })} wb-lift h-14 rounded-full text-[1.0625rem] font-semibold`}
              >
                Zgłoś usterkę
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
