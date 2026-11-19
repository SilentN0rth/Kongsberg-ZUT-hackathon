import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { WatchScreen } from "@/components/watch/watch-screen";

export const metadata: Metadata = {
  title: "WatchBrief – Moja wachta",
  description: "Zdawanie wachty i zgłaszanie usterek w 2 minuty, także offline.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#14202a",
};

export default function WachtaPage() {
  return (
    <AppShell active="wachta">
      <WatchScreen />
    </AppShell>
  );
}
