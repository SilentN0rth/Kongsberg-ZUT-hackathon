import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell/app-shell";

export const metadata: Metadata = { title: "WatchBrief – Nowa usterka" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#14202a",
};

export default function Page() {
  return (
    <AppShell active="nowa">
      <h1 className="text-3xl leading-tight font-semibold text-balance">Nowa usterka</h1>
      <p className="mt-2 text-base text-(--muted)">Ekran w budowie: zdjęcie, urządzenie, objaw i priorytet (Etap 2).</p>
    </AppShell>
  );
}
