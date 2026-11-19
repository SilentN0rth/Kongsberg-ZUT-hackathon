"use client";

import Lenis from "lenis";
import { useEffect, useRef, type RefObject } from "react";

// Smooth scrolling for an inner scroll container (the screen is a phone-shaped frame, not the window).
// Touch keeps native momentum (syncTouch off); reduced-motion users get plain native scrolling.
export function useLenis(
  wrapper: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>,
  onScroll?: (y: number) => void,
) {
  const lenisRef = useRef<Lenis | null>(null);
  const onScrollRef = useRef(onScroll);

  useEffect(() => {
    onScrollRef.current = onScroll;
  });

  useEffect(() => {
    const w = wrapper.current;
    const c = content.current;
    if (!w || !c) return;

    const report = () => onScrollRef.current?.(w.scrollTop);
    w.addEventListener("scroll", report, { passive: true });

    let raf = 0;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const lenis = new Lenis({
        wrapper: w,
        content: c,
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenisRef.current = lenis;
      const tick = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      w.removeEventListener("scroll", report);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [wrapper, content]);

  return lenisRef;
}
