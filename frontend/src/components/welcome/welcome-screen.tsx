import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { OceanCanvas } from "@/components/welcome/ocean-canvas";
import { ScrollToBridge } from "@/components/welcome/scroll-to-bridge";

const FEATURES = ["Skan kodu QR", "Praca offline", "Brief zmiany"];

const enter = (delay: number) => ({ "--d": `${delay}ms` }) as React.CSSProperties;

// Ekran powitalny. Telefon to widok pracownika (zgłasza usterkę), komputer to stanowisko mostka (weryfikuje):
// każdy widzi tylko swoje wejście.
export function WelcomeScreen() {
  return (
    <Screen tone="dark">
      <ScrollToBridge>
      <div data-dive="ocean" className="absolute inset-0 origin-[62%_42%]">
        <OceanCanvas />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(0deg,rgb(3_42_57/0.78)_0%,rgb(3_42_57/0.25)_42%,transparent_70%)]"
      />

      <div
        className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-6 py-6 text-white lg:justify-between lg:px-12 lg:py-10"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
      >
        <header data-dive="fade" className="hidden justify-end lg:flex">
          <div className="wb-enter flex flex-col items-end gap-5 text-right" style={enter(260)}>
            <p className="type-body max-w-sm text-white/85">
              Weryfikuj zgłoszenia od załogi, potwierdzaj je i przekaż zmianę z gotowym briefem.
            </p>
            <Link href="/admin" className={cta}>
              Stanowisko mostka
              <ArrowRightIcon width={22} height={22} />
            </Link>
          </div>
        </header>

        <main className="flex flex-col gap-8 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pb-4">
          <div data-dive="title" className="origin-bottom-left">
            <h1 className="wb-enter wb-hero-title" style={enter(120)}>
              Zdaj wachtę
              <br />w 2 minuty
            </h1>
            <p className="wb-enter mt-5 text-[1.125rem] text-white/85 lg:text-[1.375rem]" style={enter(300)}>
              Zero zgubionych usterek.
            </p>
          </div>

          <div className="wb-enter flex flex-col gap-6 lg:hidden" style={enter(380)}>
            <p className="type-body text-white/85">
              Zgłoś usterkę skanem kodu przy urządzeniu, a zmiennik dostanie gotowy brief.
            </p>
            <Link href="/urzadzenia" className={`${cta} w-full`}>
              Zgłaszam usterkę
              <ArrowRightIcon width={22} height={22} />
            </Link>
          </div>

          <div data-dive="fade">
          <ul className="wb-enter flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end" style={enter(460)} aria-label="Najważniejsze cechy">
            {FEATURES.map((f, i) => (
              <li key={f} className="flex items-center gap-5 text-[0.9375rem] tracking-[0.01em] text-white/70">
                {i > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-aqua/70" />}
                {f}
              </li>
            ))}
          </ul>
          </div>
        </main>
      </div>
      </ScrollToBridge>
    </Screen>
  );
}

// Biały przycisk główny: zmienia tylko kolor tła, bez ruchu i poświaty.
const cta =
  "inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-7 text-[1.0625rem] font-medium tracking-[-0.011em] whitespace-nowrap text-ink transition-colors hover:bg-ice";
