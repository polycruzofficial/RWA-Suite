"use client";

/**
 * useLivePrices — polls /api/prices on a configurable interval.
 *
 * Returns merged price data (live where available, null otherwise),
 * a loading flag, the last-fetched Date, and a manual refetch fn.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { PricesResponse } from "@/app/api/prices/route";

export type { PricesResponse };

export interface UseLivePricesResult {
  prices: PricesResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refetch: () => void;
}

export function useLivePrices(pollIntervalMs = 60_000): UseLivePricesResult {
  const [prices, setPrices]         = useState<PricesResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/prices", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PricesResponse = await res.json();
      if (!mountedRef.current) return;
      setPrices(data);
      setLastFetched(new Date());
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to fetch live prices");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchPrices();
    const id = setInterval(fetchPrices, pollIntervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchPrices, pollIntervalMs]);

  return { prices, loading, error, lastFetched, refetch: fetchPrices };
}

/* ─── Helpers consumed by marketplace page ──────────────────────────────── */

/**
 * Returns how many seconds ago `date` was, updating every second.
 * Returns null while loading.
 */
export function useSecondsAgo(date: Date | null): number | null {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    if (!date) return;
    const tick = () => setSecs(Math.floor((Date.now() - date.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  return date ? secs : null;
}
