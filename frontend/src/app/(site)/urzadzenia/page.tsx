import type { Metadata, Viewport } from "next";
import { DevicesScreen } from "@/components/devices/devices-screen";
import { Screen } from "@/components/ui/screen";

export const metadata: Metadata = { title: "WatchBrief – Urządzenia" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function Page() {
  return (
    <Screen tone="light">
      <DevicesScreen />
    </Screen>
  );
}
