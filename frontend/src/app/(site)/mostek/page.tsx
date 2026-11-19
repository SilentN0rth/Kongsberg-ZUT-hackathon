import type { Metadata, Viewport } from "next";
import config from "@payload-config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { BridgeScreen } from "@/components/bridge/bridge-screen";

export const metadata: Metadata = { title: "WatchBrief – Mostek" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

// Widok mostka wymaga zalogowania (sesja Payload). Załoga na telefonach nie loguje się, tu wchodzą tylko oficerowie.
export default async function Page() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login?redirect=%2Fmostek");
  return <BridgeScreen userName={user.name || user.email} />;
}
