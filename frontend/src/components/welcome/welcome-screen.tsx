import Link from "next/link";
import { Chip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowRightIcon, QrScanIcon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { OceanCanvas } from "@/components/welcome/ocean-canvas";

const FEATURES = ["Skan kodu QR", "Praca offline", "Brief zmiany"];

// Ekran powitalny: morze na pełny ekran, duży lekki nagłówek, szklane kapsuły i jedno główne działanie.
export function WelcomeScreen() {
  return (
    <Screen tone="dark">
      <OceanCanvas />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(0deg,rgb(3_42_57/0.78)_0%,rgb(3_42_57/0.25)_42%,transparent_70%)]"
      />

      <div
        className="relative z-10 flex min-h-0 flex-1 flex-col justify-between px-6 py-6 text-white lg:px-12 lg:py-10"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
      >
        <header className="flex items-start justify-between gap-8">
          <Link href="/" className="wb-enter flex items-center gap-3" style={{ "--d": "0ms" } as React.CSSProperties}>
            <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-aqua backdrop-blur-md">
              <QrScanIcon width={24} height={24} />
            </span>
            <span className="text-[1.25rem] font-semibold tracking-[-0.02em]">WatchBrief</span>
          </Link>

          <div className="wb-enter hidden flex-col items-end gap-5 text-right lg:flex" style={{ "--d": "260ms" } as React.CSSProperties}>
            <p className="type-body max-w-sm text-white/85">
              Zgłoś usterkę skanem kodu przy urządzeniu, a zmiennik dostanie gotowy brief. Bez przepisywania notatek.
            </p>
            <Actions />
          </div>
        </header>

        <main className="flex flex-col gap-8 pb-16 lg:flex-row lg:items-end lg:justify-between lg:pb-14">
          <div>
            <h1 className="wb-enter wb-hero-title" style={{ "--d": "120ms" } as React.CSSProperties}>
              Zdaj wachtę
              <br />w 2 minuty
            </h1>
            <p className="wb-enter mt-5 text-[1.125rem] text-white/85 lg:text-[1.375rem]" style={{ "--d": "300ms" } as React.CSSProperties}>
              Zero zgubionych usterek.
            </p>
          </div>

          <div className="wb-enter flex flex-col gap-6 lg:hidden" style={{ "--d": "380ms" } as React.CSSProperties}>
            <p className="type-body text-white/85">
              Zgłoś usterkę skanem kodu przy urządzeniu, a zmiennik dostanie gotowy brief.
            </p>
            <Actions />
          </div>

          <ul className="wb-enter flex flex-wrap gap-2 lg:justify-end" style={{ "--d": "460ms" } as React.CSSProperties} aria-label="Najważniejsze cechy">
            {FEATURES.map((f) => (
              <li key={f}>
                <Chip size="lg" variant="soft" className="wb-glass-dark wb-lift h-auto px-4 py-2.5">
                  <Chip.Label className="type-body text-white">{f}</Chip.Label>
                </Chip>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </Screen>
  );
}

function Actions() {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:justify-end">
      <Link
        href="/urzadzenia"
        className="group wb-lift inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-7 whitespace-nowrap text-[1.0625rem] font-medium tracking-[-0.011em] text-ink transition-colors hover:bg-ice"
      >
        Zgłaszam usterkę
        <ArrowRightIcon width={22} height={22} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
      <Link
        href="/mostek"
        className={`${buttonVariants({ variant: "tertiary", size: "lg" })} wb-glass-dark wb-lift h-14 rounded-full px-7 text-[1.0625rem] font-medium whitespace-nowrap`}
      >
        Stanowisko mostka
      </Link>
    </div>
  );
}
