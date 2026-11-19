"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

type Brief = { handoverId: number; text: string; createdAt: string; takenOverAt: string | null };

const hm = (iso: string) => new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

// Zmiana wachty na pulpicie: wygeneruj brief z otwartych usterek i oznacz przejęcie wachty.
export function BriefPanel() {
  const [brief, setBrief] = useState<Brief | null | undefined>(undefined);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/handovers/latest", { credentials: "include", cache: "no-store" })
      .then(async (res) => (res.status === 204 ? null : res.ok ? ((await res.json()) as Brief) : Promise.reject(res.status)))
      .then((b) => alive && setBrief(b))
      .catch(() => alive && (setBrief(null), setError("Nie udało się pobrać ostatniego briefu.")));
    return () => {
      alive = false;
    };
  }, []);

  async function run(key: string, url: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(url, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      setBrief((await res.json()) as Brief);
    } catch {
      setError("Operacja nie powiodła się. Sprawdź połączenie z serwerem.");
    }
    setBusy(null);
  }

  return (
    <div className="wb-admin-tools">
      <h3 className="wb-admin-subtitle">Zmiana wachty</h3>
      {brief === undefined ? (
        <p className="wb-admin-muted">Ładowanie…</p>
      ) : brief ? (
        <>
          <pre className="wb-admin-pre">{brief.text}</pre>
          <p className="wb-admin-muted">
            Wygenerowano {hm(brief.createdAt)}
            {brief.takenOverAt ? ` · wachta przejęta ${hm(brief.takenOverAt)}` : ""}
          </p>
        </>
      ) : (
        <p className="wb-admin-muted">Nie wygenerowano jeszcze briefu zmiany.</p>
      )}
      {error && (
        <p role="alert" className="wb-admin-error">
          {error}
        </p>
      )}
      <div className="wb-admin-row">
        <Button
          variant={brief && !brief.takenOverAt ? "outline" : "primary"}
          isPending={busy === "gen"}
          onPress={() => void run("gen", "/api/handovers/generate")}
        >
          Generuj brief zmiany
        </Button>
        {brief && !brief.takenOverAt && (
          <Button variant="primary" isPending={busy === "take"} onPress={() => void run("take", `/api/handovers/${brief.handoverId}/take`)}>
            Przejmuję wachtę
          </Button>
        )}
      </div>
    </div>
  );
}
