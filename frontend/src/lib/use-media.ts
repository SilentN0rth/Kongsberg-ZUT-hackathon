"use client";

import { useSyncExternalStore } from "react";

// SSR-safe media query: false on the server and first paint, then the real value.
export function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
