import type { AdminViewServerProps } from "payload";
import { DemoTools } from "@/admin/DemoTools";
import { VerifyBoard } from "@/admin/VerifyBoard";
import { demoToolsEnabled } from "@/lib/server/demo";
import { getSettings } from "@/lib/server/settings";
import { currentWatch, watchTitle, watchWindow } from "@/lib/watch";

// Strona główna panelu: weryfikacja zgłoszeń zamiast listy kolekcji (te są w menu bocznym).
export async function Dashboard({ initPageResult }: AdminViewServerProps) {
  const { payload, user } = initPageResult.req;
  const settings = await getSettings(payload);
  const watch = currentWatch(settings.watches, settings.timezone);
  const who = (user as { name?: string; email?: string } | null)?.name || (user as { email?: string } | null)?.email || "";

  return (
    <div className="wb-dash">
      <header className="wb-dash__head">
        <h1 className="wb-dash__title">Weryfikacja zgłoszeń</h1>
        <p className="wb-dash__meta">
          {settings.vesselName} · {watchTitle(watch)}
          {watch ? ` (${watchWindow(watch)})` : ""}
          {who ? ` · ${who}` : ""}
        </p>
      </header>
      <VerifyBoard />
      <details className="wb-dash__tools">
        <summary>Narzędzia kolejki i demo</summary>
        <DemoTools demo={demoToolsEnabled()} />
      </details>
    </div>
  );
}
