import type { ReactNode } from "react";
import { fallback } from "@/lib/fonts";

// One full-viewport surface for every screen. The layout itself adapts: a single column on phones,
// a sidebar + multi-column workspace from `lg` up (bridge workstations, tablets, desktops).
export function Screen({ tone, children }: { tone: "light" | "dark"; children: ReactNode }) {
  return (
    <div
      className={`${fallback.variable} font-sf relative flex h-dvh w-full flex-col overflow-hidden ${
        tone === "light" ? "wb-screen-light" : "wb-screen-dark"
      }`}
    >
      {children}
    </div>
  );
}
