"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@heroui/react";

const SCENARIOS = [
  { id: "basic", label: "Podstawowy" },
  { id: "quiet", label: "Spokojny" },
  { id: "busy", label: "Ruchliwy" },
  { id: "critical", label: "Krytyczny" },
] as const;

// Narzędzia do pokazu: przetwarzanie kolejki, symulacja zgłoszeń ze skanerów i wczytanie scenariusza (kasuje dane).
export function DemoTools({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(key: string, url: string, ok: (data: Record<string, unknown>) => string) {
    setBusy(key);
    setMessage(null);
    try {
      const res = await fetch(url, { method: "POST", credentials: "include" });
      const data = (await res.json()) as Record<string, unknown>;
      setMessage(res.ok ? ok(data) : String(data.error ?? `Błąd ${res.status}`));
      if (res.ok) router.refresh();
    } catch {
      setMessage("Brak połączenia z serwerem.");
    }
    setBusy(null);
  }

  return (
    <div className="wb-admin-tools">
      <div className="wb-admin-row">
        <Button
          variant="secondary"
          isPending={busy === "queue"}
          onPress={() => void run("queue", "/api/queue/process", (d) => `Przetworzono ${d.processed}, błędów ${d.failed}.`)}
        >
          Przetwórz kolejkę
        </Button>
        {demo && (
          <Button
            variant="outline"
            isPending={busy === "sim"}
            onPress={() => void run("sim", "/api/demo/simulate?count=3", (d) => `Dodano ${d.created} zgłoszenia.`)}
          >
            Symuluj 3 zgłoszenia
          </Button>
        )}
      </div>
      {demo && (
        <div className="wb-admin-row">
          <span className="wb-admin-muted">Wczytaj scenariusz (kasuje dane):</span>
          {SCENARIOS.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant="ghost"
              isPending={busy === s.id}
              onPress={() => {
                if (window.confirm(`Wczytać scenariusz „${s.label}”? Wszystkie obecne dane zostaną usunięte.`)) {
                  void run(s.id, `/api/demo/scenarios/${s.id}`, () => `Wczytano scenariusz „${s.label}”.`);
                }
              }}
            >
              {s.label}
            </Button>
          ))}
        </div>
      )}
      {message && (
        <p role="status" className="wb-admin-muted">
          {message}
        </p>
      )}
    </div>
  );
}
