"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Device, type ReportOut } from "@/lib/api";

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

// Pełna lista zgłoszeń odpytywana cyklicznie (zmiany statusu nie zmieniają receivedAt, więc `since` by ich nie pokazało).
export function useReports(intervalMs = 2500) {
  const [reports, setReports] = useState<ReportOut[] | null>(null);
  const [online, setOnline] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set());
  const last = useRef("");
  const known = useRef<Set<string> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await api.reports();
      const key = JSON.stringify(next);
      if (key !== last.current) {
        last.current = key;
        setReports(next);
        // Reports that appeared after the first load are "fresh" for a few seconds.
        if (known.current) {
          const added = next.filter((r) => !known.current!.has(r.id)).map((r) => r.id);
          if (added.length) {
            setFresh((f) => new Set([...f, ...added]));
            setTimeout(() => setFresh((f) => new Set([...f].filter((id) => !added.includes(id)))), 8000);
          }
        }
        known.current = new Set(next.map((r) => r.id));
      }
      setOnline(true);
      setUpdatedAt(new Date());
    } catch {
      setOnline(false);
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

  const patch = useCallback((id: string, changes: Partial<ReportOut>) => {
    setReports((rs) => rs?.map((r) => (r.id === id ? { ...r, ...changes } : r)) ?? rs);
    last.current = "";
  }, []);

  return { reports, online, updatedAt, fresh, refresh, patch };
}
