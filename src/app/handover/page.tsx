import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell/app-shell";

export const metadata: Metadata = { title: "WatchBrief – Zdaj wachtę" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#14202a",
};

export default function Page() {
  return (
    <AppShell active="handover">
      <h1 className="text-3xl leading-tight font-semibold text-balance">Zdaj wachtę</h1>
      <p className="mt-2 text-base text-(--muted)">Ekran w budowie: Handover Brief i przejęcie wachty (Etap 3).</p>
    </AppShell>
  );
}
