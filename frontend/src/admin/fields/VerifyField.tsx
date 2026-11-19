"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";
import { Button } from "@heroui/react";
import { STATUS_LABEL, type ReportStatus } from "@/lib/catalog";

// Weryfikacja w widoku zgłoszenia (panel boczny): te same akcje co w liście, bez zapisywania całego formularza.
export function VerifyField() {
  const { id } = useDocumentInfo();
  const status = useFormFields(([fields]) => fields.status?.value) as ReportStatus | undefined;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  if (!id || !status) return null;

  async function set(next: ReportStatus) {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(String(id))}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      window.location.reload(); // formularz Payload ma stary stan, więc wczytujemy dokument od nowa
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <section className="wb-verify" aria-label="Weryfikacja zgłoszenia">
      <p className="wb-admin-muted">Status: {STATUS_LABEL[status]}</p>
      <div className="wb-admin-actions wb-verify__actions">
        {status === "NEW" && (
          <>
            <Button variant="primary" isPending={busy} onPress={() => void set("ACKNOWLEDGED")}>
              Potwierdź zgłoszenie
            </Button>
            <Button variant="outline" isDisabled={busy} onPress={() => void set("RESOLVED")}>
              Oznacz jako rozwiązane
            </Button>
          </>
        )}
        {status === "ACKNOWLEDGED" && (
          <>
            <Button variant="primary" isPending={busy} onPress={() => void set("RESOLVED")}>
              Oznacz jako rozwiązane
            </Button>
            <Button variant="ghost" isDisabled={busy} onPress={() => void set("NEW")}>
              Cofnij do weryfikacji
            </Button>
          </>
        )}
        {status === "RESOLVED" && (
          <Button variant="outline" isPending={busy} onPress={() => void set("NEW")}>
            Otwórz ponownie
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="wb-admin-error">
          Nie udało się zmienić statusu.
        </p>
      )}
    </section>
  );
}
