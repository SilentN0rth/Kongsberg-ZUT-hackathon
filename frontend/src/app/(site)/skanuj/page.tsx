import type { Metadata, Viewport } from "next";
import { ScanScreen } from "@/components/scan/scan-screen";

export const metadata: Metadata = { title: "WatchBrief – Skanuj kod" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e1214",
};

export default function Page() {
  return <ScanScreen />;
}
