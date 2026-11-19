import type { MetadataRoute } from "next";

// Manifest PWA: po „Dodaj do ekranu głównego” aplikacja otwiera się pełnoekranowo jak natywna.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WatchBrief",
    short_name: "WatchBrief",
    description: "Zdawanie wachty i zgłaszanie usterek w 2 minuty.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "pl",
    background_color: "#032a39",
    theme_color: "#032a39",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
