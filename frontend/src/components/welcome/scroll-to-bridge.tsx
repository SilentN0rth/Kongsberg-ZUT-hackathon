"use client";

import { animate, motionValue } from "motion";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useMedia } from "@/lib/use-media";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/*
 * Przewijanie strony głównej „zanurza” w morze i prowadzi na stanowisko mostka (/admin, panel CMS).
 * Jeden postęp p (0 → 1) steruje wszystkimi elementami, ale każdy ma własne okno czasowe, więc ruchy się nakładają:
 *   fade  (nagłówek, kapsuły)   znikają do p = 0.4
 *   title (nagłówek hero)       unosi się i znika do p ≈ 0.74
 *   ocean (tło)                 powiększa się cały czas (nośnik ruchu)
 *   veil  (zasłona)             wchodzi od p = 0.25, pełna przy p ≈ 0.96; kolor jak tło ekranu logowania panelu,
 *                               a samo przejście dokumentów robi przeglądarka (View Transitions, patrz globals.css);
 *                               pierwsza klatka panelu jest w tym samym kolorze (admin-theme.css), więc nie ma błysku
 * Ruch jest odwracalny: sprężyna startuje z bieżącej wartości. Po 380 ms bez przewijania postęp skacze do 1 (jeśli
 * minął próg 0.45) albo wraca do 0. Tylko desktop i tylko bez „reduced motion” (reszta ma zwykły przycisk).
 * Tylko transform i opacity, ustawiane bezpośrednio na elementach.
 */
export function ScrollToBridge({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(() => void) | null>(null);
  const desktop = useMedia("(min-width: 1024px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const active = desktop && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !active) return;

    const all = (name: string) => [...root.querySelectorAll<HTMLElement>(`[data-dive="${name}"]`)];
    const fade = all("fade");
    const title = all("title");
    const ocean = all("ocean");
    const veil = all("veil");

    // Rozgrzewka: pierwsze wejście na /admin (w dev kompilacja) nie powinno trafić w sam moment przejścia.
    const warm = window.setTimeout(() => void fetch("/admin/login", { cache: "no-store", credentials: "omit" }).catch(() => {}), 1500);

    const apply = (v: number) => {
      const rest = v < 0.001;
      for (const el of fade) {
        el.style.opacity = rest ? "" : String(clamp01(1 - v * 2.5));
        el.style.transform = rest ? "" : `translate3d(0, ${-32 * v}px, 0)`;
      }
      for (const el of title) {
        el.style.opacity = rest ? "" : String(clamp01(1 - v * 1.35));
        el.style.transform = rest ? "" : `translate3d(0, ${-110 * v}px, 0) scale(${1 + v * 0.08})`;
      }
      for (const el of ocean) el.style.transform = rest ? "" : `scale(${1 + v * 0.3})`;
      for (const el of veil) el.style.opacity = rest ? "" : String(clamp01((v - 0.25) * 1.4));
    };

    const p = motionValue(0);
    const stop = p.on("change", apply);
    let target = 0;
    let leaving = false;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let run: ReturnType<typeof animate> | undefined;

    // Cel ustawiany z bieżącej wartości: przerwanie i odwrócenie ruchu nie robi skoku.
    const drive = (to: number) => {
      target = clamp01(to);
      run?.stop();
      run = animate(p, target, {
        type: "spring",
        bounce: 0,
        duration: target === 1 ? 0.7 : 0.45,
        onComplete: () => {
          if (target === 1 && !leaving) {
            leaving = true;
            // /admin ma osobny root layout, więc to i tak nawigacja dokumentu: robimy ją wprost, bez dodatkowego zapytania routera.
            // Pierwsza klatka panelu jest od razu w kolorze zasłony (admin-theme.css), więc przejście jest ciągłe.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/admin");
          }
        },
      });
    };

    const nudge = (delta: number) => {
      if (leaving) return;
      drive(target + delta);
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (!leaving) drive(target >= 0.45 ? 1 : 0);
      }, 380);
    };

    const onWheel = (e: WheelEvent) => nudge(e.deltaY / 900);
    let lastY = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      nudge((lastY - y) / (window.innerHeight * 0.6));
      lastY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.target !== document.body || leaving) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        drive(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        drive(0);
      }
    };
    // Powrót z bfcache (przycisk „wstecz”): strona wraca w stanie z zasłoną, więc zaczynamy od nowa.
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      leaving = false;
      run?.stop();
      p.set(0);
      target = 0;

    };

    goRef.current = () => drive(1);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pageshow", onShow);

    return () => {
      clearTimeout(idle);
      clearTimeout(warm);
      run?.stop();
      stop();
      goRef.current = null;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pageshow", onShow);
      apply(0);
    };
  }, [active]);

  return (
    <div ref={rootRef} className="relative flex min-h-0 flex-1 flex-col">
      {children}

      {active && (
        <>
          <div
            aria-hidden="true"
            data-dive="veil"
            className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(60%_50%_at_15%_10%,rgb(7_124_142/0.55),transparent_70%),radial-gradient(50%_45%_at_90%_85%,rgb(0_214_230/0.22),transparent_70%),#032a39] opacity-0"
          />

          <button
            type="button"
            data-dive="fade"
            onClick={() => goRef.current?.()}
            aria-label="Wejdź na stanowisko mostka (przewiń w dół lub kliknij)"
            className="wb-glass-dark absolute bottom-10 left-1/2 z-20 flex h-11 -translate-x-1/2 items-center gap-3 rounded-full px-5 text-[0.9375rem]"
          >
            Przewiń, aby wejść na mostek
            <span className="wb-nudge inline-flex">
              <ArrowRightIcon width={18} height={18} className="rotate-90" />
            </span>
          </button>
        </>
      )}
    </div>
  );
}
