"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@heroui/react";
import type { DefaultCellComponentProps } from "payload";
import type { ReportStatus } from "@/lib/catalog";

// Szybka weryfikacja prosto z listy zgłoszeń: zmienia status przez REST Payload (wymaga zalogowanego oficera).
export function VerifyCell({ rowData }: DefaultCellComponentProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const id = String(rowData?.id ?? "");
  const status = rowData?.status as ReportStatus | undefined;
  if (!id || !status) return null;

  async function set(next: ReportStatus) {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="wb-admin-actions">
      {status === "NEW" && (
        <>
          <Button size="sm" variant="primary" isPending={busy} onPress={() => void set("ACKNOWLEDGED")}>
            Potwierdź
          </Button>
          <Button size="sm" variant="outline" isDisabled={busy} onPress={() => void set("RESOLVED")}>
            Rozwiąż
          </Button>
        </>
      )}
      {status === "ACKNOWLEDGED" && (
        <Button size="sm" variant="primary" isPending={busy} onPress={() => void set("RESOLVED")}>
          Rozwiąż
        </Button>
      )}
      {status === "RESOLVED" && (
        <Button size="sm" variant="ghost" isPending={busy} onPress={() => void set("NEW")}>
          Otwórz ponownie
        </Button>
      )}
      {error && <span role="alert" className="wb-admin-error">Błąd zapisu</span>}
    </span>
  );
}
