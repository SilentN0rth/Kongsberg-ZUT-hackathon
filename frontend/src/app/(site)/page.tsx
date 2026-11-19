import type { Metadata, Viewport } from "next";
import { WelcomeScreen } from "@/components/welcome/welcome-screen";

export const metadata: Metadata = {
  title: "WatchBrief",
  description: "Zdawanie wachty i zgłaszanie usterek w 2 minuty.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#032a39",
};

export default function Home() {
  return <WelcomeScreen />;
}
