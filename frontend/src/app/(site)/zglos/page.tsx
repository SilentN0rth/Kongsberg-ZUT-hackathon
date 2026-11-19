import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { ReportFlow } from "@/components/report/report-flow";

export const metadata: Metadata = { title: "WatchBrief – Zgłoś usterkę" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Link z kodu QR/NFC: /zglos?urzadzenie=pompa-03. Identyfikator jest sprawdzany względem listy z backendu.
async function Flow({ searchParams }: { searchParams: PageProps<"/zglos">["searchParams"] }) {
  const q = await searchParams;
  return <ReportFlow initialDeviceId={first(q.urzadzenie)} />;
}

export default function Page({ searchParams }: PageProps<"/zglos">) {
  return (
    <Suspense fallback={<p role="status" className="p-6 text-lg">Ładowanie formularza…</p>}>
      <Flow searchParams={searchParams} />
    </Suspense>
  );
}
