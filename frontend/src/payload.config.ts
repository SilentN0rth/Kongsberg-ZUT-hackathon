import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildConfig, type Endpoint } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { pl } from "@payloadcms/translations/languages/pl";
import sharp from "sharp";
import { Devices } from "@/collections/Devices";
import { Handovers } from "@/collections/Handovers";
import { Queue } from "@/collections/Queue";
import { Reports } from "@/collections/Reports";
import { Users } from "@/collections/Users";
import { Settings } from "@/globals/Settings";
import { migrations } from "@/migrations";
import { DEFAULT_WATCHES } from "@/lib/watch";
import { DEVICES, SCENARIOS, demoToolsEnabled, ensureDevices, loadScenario, simulate, type Scenario } from "@/lib/server/demo";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Lokalna baza SQLite w pliku. SQLite nie tworzy katalogu, więc robimy to przy starcie.
const databaseUrl = process.env.DATABASE_URI || "file:./data/watchbrief.db";
if (databaseUrl.startsWith("file:")) fs.mkdirSync(path.dirname(databaseUrl.slice("file:".length)), { recursive: true });

const guard = (req: { user?: unknown }) => {
  if (!req.user) return Response.json({ error: "Wymagane logowanie" }, { status: 401 });
  if (!demoToolsEnabled()) return Response.json({ error: "Narzędzia demo są wyłączone (WATCHBRIEF_DEMO_TOOLS)" }, { status: 403 });
  return null;
};

// Narzędzia demo (dawne /api/demo/* z Javy). Kasują dane, więc wymagają logowania i flagi środowiskowej.
const demoEndpoints: Endpoint[] = [
  { path: "/demo/scenarios", method: "get", handler: (req) => guard(req) ?? Response.json(SCENARIOS) },
  {
    path: "/demo/scenarios/:name",
    method: "post",
    handler: async (req) => {
      const denied = guard(req);
      if (denied) return denied;
      const name = req.routeParams?.name as Scenario;
      if (!SCENARIOS.includes(name)) return Response.json({ error: `Nieznany scenariusz: ${name}` }, { status: 400 });
      await loadScenario(req.payload, name);
      return Response.json({ loaded: name });
    },
  },
  {
    path: "/demo/simulate",
    method: "post",
    handler: async (req) => {
      const denied = guard(req);
      if (denied) return denied;
      const count = Number(new URL(req.url ?? "http://x").searchParams.get("count") ?? 1);
      if (!Number.isInteger(count) || count < 1 || count > 20) return Response.json({ error: "count musi być 1-20" }, { status: 400 });
      return Response.json({ created: await simulate(req.payload, count) });
    },
  },
];

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " – WatchBrief",
      applicationName: "WatchBrief",
      icons: [{ rel: "apple-touch-icon", url: "/icons/apple-touch-icon.png" }],
      appleWebApp: { capable: true, title: "WatchBrief", statusBarStyle: "black-translucent" },
    },
    dateFormat: "dd.MM.yyyy HH:mm",
    // Jeden, jasny motyw w stylu aplikacji (bez przełącznika jasny/ciemny).
    theme: "light",
    components: {
      graphics: { Logo: "/admin/Logo#Logo", Icon: "/admin/Icon#Icon" },
      views: { dashboard: { Component: "/admin/Dashboard#Dashboard" } },
      beforeLogin: ["/admin/LoginHero#LoginHero"],
      afterNavLinks: ["/admin/NavWatch#NavWatch"],
    },
  },
  collections: [Devices, Reports, Queue, Handovers, Users],
  globals: [Settings],
  endpoints: demoEndpoints,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  // W produkcji (next start) schemat tworzą migracje z src/migrations; w dev Payload synchronizuje go sam.
  db: sqliteAdapter({ client: { url: databaseUrl }, prodMigrations: migrations }),
  graphQL: { disable: true },
  i18n: { supportedLanguages: { pl }, fallbackLanguage: "pl" },
  sharp,
  onInit: async (payload) => {
    // Jak seed-on-empty w Javie: pierwsze uruchomienie dostaje listę urządzeń.
    if (await ensureDevices(payload)) payload.logger.info(`Dodano ${DEVICES.length} urządzeń startowych`);
    // Ustawienia statku: pierwszy zapis z domyślnym grafikiem wacht.
    const settings = await payload.findGlobal({ slug: "settings", depth: 0 }).catch(() => null);
    if (settings && !settings.watches?.length) {
      await payload.updateGlobal({ slug: "settings", data: { watches: DEFAULT_WATCHES } });
      payload.logger.info("Zapisano domyślne ustawienia statku");
    }
  },
});
