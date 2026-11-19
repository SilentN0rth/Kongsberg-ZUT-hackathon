"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Device, type ReportOut, type ShipSettingsDoc } from "@/lib/api";

export function useSettings() {
  const [settings, setSettings] = useState<ShipSettingsDoc | null>(null);
  useEffect(() => {
    let alive = true;
    api
      .settings()
      .then((s) => alive && setSettings(s))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return settings;
}

export function useDevices() {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    api
      .devices()
      .then((d) => alive && setDevices(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);
  return { devices, error };
}

// Lista zgłoszeń odpytywana cyklicznie (załoga widzi, które urządzenia mają otwarte zgłoszenia).
export function useReports(intervalMs = 2500) {
  const [reports, setReports] = useState<ReportOut[] | null>(null);
  const last = useRef("");

  const refresh = useCallback(async () => {
    try {
      const next = await api.reports();
      const key = JSON.stringify(next);
      if (key !== last.current) {
        last.current = key;
        setReports(next);
      }
    } catch {
      /* brak sieci: zostaje poprzednia lista */
    }
  }, []);

  useEffect(() => {
    // schedule instead of calling synchronously: keeps state updates out of the effect body
    const first = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => void refresh(), intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [refresh, intervalMs]);

  return { reports };
}
