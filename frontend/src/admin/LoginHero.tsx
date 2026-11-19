"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { OceanCanvas } from "@/components/welcome/ocean-canvas";

const noop = () => () => {};

// Ekran logowania jak strona główna: morze na pełny ekran, lekki duży napis i szklana karta z formularzem.
// Tło i hasło idą portalem do <body>, bo wewnątrz karty (backdrop-filter) `position: fixed` liczyłby się względem karty.
export function LoginHero() {
  const host = useSyncExternalStore(
    noop,
    () => document.body,
    () => null,
  );

  return (
    <>
      {host &&
        createPortal(
          <>
            <div className="wb-login-ocean" aria-hidden="true">
              <OceanCanvas />
              <div className="wb-login-ocean__shade" />
            </div>
            <p className="wb-login-tagline" aria-hidden="true">
              Zdaj wachtę
              <br />w 2 minuty
            </p>
          </>,
          host,
        )}
      <h1 className="wb-login-title">Stanowisko mostka</h1>
    </>
  );
}
