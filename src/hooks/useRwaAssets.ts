"use client";

/**
 * useRwaAssets — polls /api/rwa-assets on a configurable interval.
 *
 * Surfaces the live, real-world RWA token market (gold, treasuries, private
 * credit, money-market funds, ...) across our 6 supported EVM chains.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { RwaAssetsResponse } from "@/app/api/rwa-assets/route";

export type { RwaAssetsResponse, RwaAsset, RwaChainListing } from "@/app/api/rwa-assets/route";

export interface UseRwaAssetsResult {
  data: RwaAssetsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRwaAssets(pollIntervalMs = 120_000): UseRwaAssetsResult {
  const [data, setData] = useState<RwaAssetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/rwa-assets", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: RwaAssetsResponse = await res.json();
      if (!mountedRef.current) return;
      setData(json);
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to fetch RWA assets");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAssets();
    const id = setInterval(fetchAssets, pollIntervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchAssets, pollIntervalMs]);

  return { data, loading, error, refetch: fetchAssets };
}
