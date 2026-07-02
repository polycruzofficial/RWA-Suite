"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useIdentity } from "@/hooks/useContracts";
import { assets, assetClasses, type AssetClass, type MarketAsset } from "@/lib/catalog/assets";
import { useLivePrices, useSecondsAgo } from "@/hooks/useLivePrices";
import type { PricesResponse } from "@/app/api/prices/route";
import { useRwaAssets } from "@/hooks/useRwaAssets";
import type { RwaAsset } from "@/app/api/rwa-assets/route";
import { getAllAssets, type DBAsset } from "@/lib/supabase";
import { DEFAULT_CHAIN_ID } from "@/config/contracts";
import { getChainName, MARKETPLACE_NETWORKS, DEPLOYMENT_NETWORKS } from "@/config/chains";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Globe,
  Lock,
  BadgeCheck,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
  Leaf,
  Coins,
  BarChart3,
  ExternalLink,
  Radio,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface LiveAsset extends MarketAsset {
  livePrice:     number;
  liveChange24h: number;
  liveApy:       number;
  isLive:        boolean;
}

/* ─── Live price overlay ─────────────────────────────────────────────────── */

function applyLivePrices(asset: MarketAsset, prices: PricesResponse | null): LiveAsset {
  let livePrice     = asset.price;
  let liveChange24h = asset.priceChange24h;
  let liveApy       = asset.apy;
  let isLive        = false;

  if (!prices || !asset.liveKey) {
    return { ...asset, livePrice, liveChange24h, liveApy, isLive };
  }

  const { commodities, carbon, treasuries, equities } = prices;

  switch (asset.liveKey) {
    case "gold":
      if (commodities.gold.price !== null) {
        if (!asset.liveUpdatesApy) {
          livePrice     = commodities.gold.price;
          liveChange24h = commodities.gold.change24h ?? liveChange24h;
        }
        isLive = true;
      }
      break;
    case "silver":
      if (commodities.silver.price !== null) {
        livePrice = commodities.silver.price;
        liveChange24h = commodities.silver.change24h ?? liveChange24h;
        isLive = true;
      }
      break;
    case "bct":
      if (carbon.bct.price !== null) {
        livePrice     = carbon.bct.price;
        liveChange24h = carbon.bct.change24h ?? liveChange24h;
        isLive = true;
      }
      break;
    case "nct":
      if (carbon.nct.price !== null) {
        livePrice     = carbon.nct.price;
        liveChange24h = carbon.nct.change24h ?? liveChange24h;
        isLive = true;
      }
      break;
    case "mco2":
      if (carbon.mco2.price !== null) {
        livePrice     = carbon.mco2.price;
        liveChange24h = carbon.mco2.change24h ?? liveChange24h;
        isLive = true;
      }
      break;
    case "carbon_basket":
      if (carbon.basket.price !== null) {
        livePrice     = carbon.basket.price;
        liveChange24h = carbon.basket.change24h ?? liveChange24h;
        isLive = true;
      }
      break;
    case "us_tbill":
      if (treasuries.us_tbill.rate !== null) {
        if (asset.liveUpdatesApy) liveApy = treasuries.us_tbill.rate;
        else livePrice = treasuries.us_tbill.rate;
        isLive = true;
      }
      break;
    case "us_tnote":
      if (treasuries.us_tnote.rate !== null) {
        liveApy = treasuries.us_tnote.rate;
        isLive  = true;
      }
      break;
    case "us_tbond":
      if (treasuries.us_tbond.rate !== null) {
        liveApy = treasuries.us_tbond.rate;
        isLive  = true;
      }
      break;
    case "uk_gilt":
      if (treasuries.uk_gilt.rate !== null) {
        liveApy = treasuries.uk_gilt.rate;
        isLive  = true;
      }
      break;
    case "sp500_etf":
      if (equities.sp500_etf.price !== null) {
        livePrice     = equities.sp500_etf.price;
        liveChange24h = equities.sp500_etf.change24h ?? liveChange24h;
        isLive = true;
      }
      break;
  }

  return { ...asset, livePrice, liveChange24h, liveApy, isLive };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatUSD(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPrice(n: number) {
  if (n >= 1_000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (n >= 1)     return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

const riskVariant: Record<string, "success" | "info" | "warning" | "error"> = {
  Minimal: "success",
  Low:     "info",
  Medium:  "warning",
  High:    "error",
};

const classIcon: Record<string, React.ReactNode> = {
  "Sovereign Debt":  <BarChart3 className="h-3 w-3" />,
  "Carbon Credits":  <Leaf className="h-3 w-3" />,
  "Commodities":     <Coins className="h-3 w-3" />,
};

/* ─── Live Ticker ────────────────────────────────────────────────────────── */

interface TickerItem {
  label: string;
  value: string;
  change?: number | null;
  isYield?: boolean;
}

function LiveTicker({
  prices,
  loading,
  error,
  lastFetched,
  refetch,
}: {
  prices: PricesResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refetch: () => void;
}) {
  const secsAgo = useSecondsAgo(lastFetched);

  const items: TickerItem[] = useMemo(() => {
    if (!prices) return [];
    const arr: TickerItem[] = [];

    const { commodities, carbon, treasuries } = prices;

    if (commodities.gold.price !== null) {
      arr.push({
        label:  "XAU (PAXG)",
        value:  `$${commodities.gold.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        change: commodities.gold.change24h,
      });
    }
    if (commodities.silver.price !== null) {
      arr.push({
        label:  "XAG",
        value:  `$${commodities.silver.price.toFixed(2)}`,
        change: commodities.silver.change24h,
      });
    }
    if (carbon.bct.price !== null) {
      arr.push({
        label:  "BCT Carbon",
        value:  `$${carbon.bct.price.toFixed(4)}`,
        change: carbon.bct.change24h,
      });
    }
    if (carbon.nct.price !== null) {
      arr.push({
        label:  "NCT Carbon",
        value:  `$${carbon.nct.price.toFixed(4)}`,
        change: carbon.nct.change24h,
      });
    }
    if (carbon.mco2.price !== null) {
      arr.push({
        label:  "MCO2",
        value:  `$${carbon.mco2.price.toFixed(4)}`,
        change: carbon.mco2.change24h,
      });
    }
    if (treasuries.us_tbill.rate !== null) {
      arr.push({ label: "US T-Bill", value: `${treasuries.us_tbill.rate.toFixed(2)}%`, isYield: true });
    }
    if (treasuries.us_tnote.rate !== null) {
      arr.push({ label: "US T-Note", value: `${treasuries.us_tnote.rate.toFixed(2)}%`, isYield: true });
    }
    if (treasuries.us_tbond.rate !== null) {
      arr.push({ label: "US T-Bond", value: `${treasuries.us_tbond.rate.toFixed(2)}%`, isYield: true });
    }
    if (treasuries.uk_gilt.rate !== null) {
      arr.push({ label: "UK Gilt 10Y", value: `${treasuries.uk_gilt.rate.toFixed(2)}%`, isYield: true });
    }
    return arr;
  }, [prices]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[11px]">
      {/* Status dot */}
      <div className="flex shrink-0 items-center gap-1.5">
        {loading ? (
          <RefreshCw className="h-3 w-3 animate-spin text-neutral-400" />
        ) : error ? (
          <WifiOff className="h-3 w-3 text-red-500" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        )}
        <span className={`font-semibold uppercase tracking-widest ${error ? "text-red-600" : "text-emerald-700"}`}>
          {error ? "Offline" : "Live"}
        </span>
      </div>

      {/* Scrollable ticker items */}
      <div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading && !prices && (
          <span className="animate-pulse text-neutral-400">Fetching market data…</span>
        )}
        {items.map((item) => {
          const positive = (item.change ?? 0) >= 0;
          return (
            <span key={item.label} className="flex shrink-0 items-center gap-1.5 font-medium text-neutral-700">
              <span className="text-neutral-400">{item.label}</span>
              <span className="text-neutral-950">{item.value}</span>
              {item.change !== undefined && item.change !== null && (
                <span className={positive ? "text-emerald-600" : "text-red-600"}>
                  {positive ? "▲" : "▼"}{Math.abs(item.change).toFixed(2)}%
                </span>
              )}
              {item.isYield && (
                <span className="text-neutral-400">APY</span>
              )}
            </span>
          );
        })}
        {items.length === 0 && !loading && (
          <span className="text-neutral-400">No live data — add API keys in .env.local</span>
        )}
      </div>

      {/* Last updated + refresh */}
      <div className="flex shrink-0 items-center gap-2.5">
        {secsAgo !== null && (
          <span className="text-neutral-400">
            {secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`}
          </span>
        )}
        <button
          onClick={refetch}
          className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-neutral-200 transition hover:bg-neutral-100"
          title="Refresh prices"
        >
          <RefreshCw className="h-3 w-3 text-neutral-600" />
          <span className="text-neutral-600">Refresh</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Asset Card ─────────────────────────────────────────────────────────── */

function AssetCard({ a }: { a: LiveAsset }) {
  const positive = a.liveChange24h >= 0;

  return (
    <Link
      href={`/investor/asset/${a.symbol}`}
      className="card group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:border-neutral-900/30"
    >
      {/* LIVE badge */}
      {a.isLive && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          LIVE
        </span>
      )}

      <div className="flex items-start justify-between pr-14">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            {classIcon[a.assetClass]}
            {a.assetClass}
          </div>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-neutral-950">
            {a.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-neutral-500">{a.issuer}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 font-mono text-[10px] font-bold text-white">
          {a.symbol.slice(0, 4)}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-neutral-500">
            {a.liveUpdatesApy ? "Yield (live)" : "Price"}
          </p>
          {a.liveUpdatesApy ? (
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-950">
              {a.liveApy.toFixed(2)}% APY
            </p>
          ) : (
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-950">
              {formatPrice(a.livePrice)}
            </p>
          )}
        </div>
        {!a.liveUpdatesApy && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
              positive
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200/70"
                : "bg-red-50 text-red-800 ring-red-200/70"
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {positive ? "+" : ""}
            {a.liveChange24h.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-neutral-50 p-4 text-[11px]">
        <div>
          <p className="text-neutral-500">APY</p>
          <p className="mt-0.5 font-semibold text-neutral-950">
            {a.liveApy > 0 ? `${a.liveApy.toFixed(2)}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-neutral-500">TVL</p>
          <p className="mt-0.5 font-semibold text-neutral-950">{formatUSD(a.tvl)}</p>
        </div>
        <div>
          <p className="text-neutral-500">Min</p>
          <p className="mt-0.5 font-semibold text-neutral-950">
            {formatUSD(a.minInvestment)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-neutral-600">
          <Globe className="h-3 w-3" />
          {a.jurisdiction}
          <StatusBadge status={a.risk} variant={riskVariant[a.risk]} />
        </div>
        <div className="flex items-center gap-2">
          {a.dataProvider && (
            <span className="text-[10px] text-neutral-400">{a.dataProvider}</span>
          )}
          <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-neutral-950 transition group-hover:gap-1.5">
            View
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Live stats banner ──────────────────────────────────────────────────── */

function LiveStatsBanner({ liveCount, total }: { liveCount: number; total: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px]">
      <Zap className="h-4 w-4 shrink-0 text-emerald-600" />
      <span className="text-emerald-800">
        <strong>{liveCount} of {total} assets</strong> are showing real-time prices from
        CoinGecko, US Treasury Fiscal Data, and on-chain protocols.
        {" "}
        <span className="text-emerald-600">
          Add <code className="rounded bg-emerald-100 px-1 font-mono text-[11px]">FRED_API_KEY</code>,{" "}
          <code className="rounded bg-emerald-100 px-1 font-mono text-[11px]">METALS_API_KEY</code>, or{" "}
          <code className="rounded bg-emerald-100 px-1 font-mono text-[11px]">ALPHA_VANTAGE_API_KEY</code>{" "}
          to unlock more live feeds.
        </span>
      </span>
      <a
        href="https://docs.POLYCRUZ.io/live-data"
        className="ml-auto flex shrink-0 items-center gap-1 text-emerald-700 hover:text-emerald-900"
        onClick={(e) => e.preventDefault()}
      >
        Setup guide <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

/* ─── Live on-chain assets (real deployed tokens, from Supabase) ────────── */

function LiveOnChainAssets({ liveAssets, liveLoading }: { liveAssets: DBAsset[]; liveLoading: boolean }) {
  const [chainFilter, setChainFilter] = useState<number | "all">("all");

  const visibleLiveAssets = useMemo(() => {
    if (chainFilter === "all") return liveAssets;
    return liveAssets.filter((a) => (a.chain_id ?? DEFAULT_CHAIN_ID) === chainFilter);
  }, [liveAssets, chainFilter]);

  if (liveLoading) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-600" />
          <h3 className="text-[13px] font-semibold text-neutral-950">
            Live on-chain assets
          </h3>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
            {visibleLiveAssets.length} shown
          </span>
        </div>
        <select
          value={chainFilter}
          onChange={(e) => setChainFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-950 focus:border-neutral-950 focus:outline-none"
        >
          <option value="all">All Chains</option>
          {MARKETPLACE_NETWORKS.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      {visibleLiveAssets.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-10 text-center">
          <Radio className="h-5 w-5 text-neutral-400" />
          <p className="mt-3 text-[13px] font-medium text-neutral-900">
            No live assets {chainFilter === "all" ? "yet" : `on ${getChainName(chainFilter)} yet`}
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Assets appear here once an issuer deploys a token on that chain from the Tokenization Studio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleLiveAssets.map((a) => (
            <Link
              key={a.token_address}
              href={`/investor/asset/${a.symbol}`}
              className="card group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:border-neutral-900/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    {a.asset_type}
                  </p>
                  <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-neutral-950">
                    {a.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
                    {a.issuer_address.slice(0, 6)}…{a.issuer_address.slice(-4)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200/70">
                  <Radio className="h-2.5 w-2.5" /> Live
                </span>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-neutral-500">Total value</p>
                  <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-950">
                    ${a.total_value_usd.toLocaleString()}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-neutral-600">
                  {a.yield_bps > 0 ? `${(a.yield_bps / 100).toFixed(2)}% yield` : "No yield"}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                  <Globe className="h-3 w-3" />
                  {a.jurisdiction}
                  <StatusBadge status={a.risk_rating} variant="info" />
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                  {getChainName(a.chain_id ?? DEFAULT_CHAIN_ID)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Global live RWA market (real tokens, all 6 supported EVM chains) ──── */

function GlobalRwaMarket() {
  const { data, loading, error, refetch } = useRwaAssets(120_000);
  const [chainFilter, setChainFilter] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"marketCap" | "change" | "price">("marketCap");

  const chainColor = useMemo(() => {
    const m = new Map<number, string>();
    for (const n of DEPLOYMENT_NETWORKS) m.set(n.id, n.color);
    return m;
  }, []);

  const filtered = useMemo(() => {
    let list = data?.assets ?? [];
    if (chainFilter !== "all") {
      list = list.filter((a) => a.chains.some((c) => c.chainId === chainFilter));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
      );
    }
    list = [...list];
    if (sort === "marketCap") list.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
    if (sort === "change") list.sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
    if (sort === "price") list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return list;
  }, [data, chainFilter, query, sort]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-neutral-950" />
          <h3 className="text-[13px] font-semibold text-neutral-950">
            Global live RWA market
          </h3>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
            {filtered.length} shown
          </span>
          {!loading && !error && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search asset…"
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none"
          />
          <select
            value={chainFilter}
            onChange={(e) => setChainFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-950 focus:border-neutral-950 focus:outline-none"
          >
            <option value="all">All Chains</option>
            {DEPLOYMENT_NETWORKS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.shortName}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-950 focus:border-neutral-950 focus:outline-none"
          >
            <option value="marketCap">Market Cap</option>
            <option value="change">24h Change</option>
            <option value="price">Price</option>
          </select>
          <button
            onClick={refetch}
            className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[12px] text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-100"
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="card flex items-center justify-center py-10 text-[12px] text-neutral-400">
          Fetching live RWA market data from CoinGecko…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-10 text-center">
          <Globe className="h-5 w-5 text-neutral-400" />
          <p className="mt-3 text-[13px] font-medium text-neutral-900">
            No live RWA assets match your filters
          </p>
          {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <GlobalRwaCard key={a.id} a={a} chainColor={chainColor} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-neutral-400">
        Live token data from CoinGecko&apos;s tokenized RWA categories (gold, treasuries, private
        credit, money-market funds, commodities). Only assets with a contract on Ethereum, BNB
        Chain, Arbitrum, Base, Polygon, or Avalanche are shown. Refreshes every 2 minutes.
      </p>
    </div>
  );
}

function GlobalRwaCard({ a, chainColor }: { a: RwaAsset; chainColor: Map<number, string> }) {
  const positive = (a.change24h ?? 0) >= 0;
  return (
    <a
      href={`https://www.coingecko.com/en/coins/${a.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:border-neutral-900/30"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.image} alt="" className="h-8 w-8 rounded-full" />
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-neutral-950">
              {a.symbol}
            </h3>
            <p className="text-[11px] text-neutral-500">{a.name}</p>
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-300 transition group-hover:text-neutral-600" />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-neutral-500">Price</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight text-neutral-950">
            {a.price !== null ? formatPrice(a.price) : "—"}
          </p>
        </div>
        {a.change24h !== null && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
              positive
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200/70"
                : "bg-red-50 text-red-800 ring-red-200/70"
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {positive ? "+" : ""}
            {a.change24h.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {a.categories.slice(0, 2).map((c) => (
          <span
            key={c}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
        <div className="flex flex-wrap items-center gap-1">
          {a.chains.map((c) => (
            <span
              key={c.chainId}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: chainColor.get(c.chainId) ?? "#71717a" }}
            >
              {c.chainName}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-[11px] text-neutral-500">
          {a.marketCap !== null ? `MC ${formatUSD(a.marketCap)}` : ""}
        </span>
      </div>
    </a>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

const classes: (AssetClass | "All")[] = ["All", ...assetClasses];

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const { data: identity } = useIdentity(address);
  const { prices, loading, error, lastFetched, refetch } = useLivePrices(60_000);

  const [query, setQuery]           = useState("");
  const [activeClass, setActiveClass] = useState<AssetClass | "All">("All");
  const [sort, setSort]             = useState<"tvl" | "apy" | "risk" | "change">("tvl");

  const [dbAssets, setDbAssets] = useState<DBAsset[]>([]);
  const [dbAssetsLoading, setDbAssetsLoading] = useState(true);

  useEffect(() => {
    getAllAssets()
      .then(setDbAssets)
      .catch(() => setDbAssets([]))
      .finally(() => setDbAssetsLoading(false));
  }, []);

  const identityStatus =
    identity && typeof identity === "object" && "status" in identity
      ? Number((identity as { status: unknown }).status)
      : 0;
  const kycApproved = identityStatus >= 2;

  // Apply live prices to all catalog assets
  const liveAssets: LiveAsset[] = useMemo(
    () => assets.map((a) => applyLivePrices(a, prices)),
    [prices]
  );

  const liveCount = useMemo(() => liveAssets.filter((a) => a.isLive).length, [liveAssets]);

  const filtered = useMemo(() => {
    let list = [...liveAssets];
    if (activeClass !== "All") {
      list = list.filter((a) => a.assetClass === activeClass);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.symbol.toLowerCase().includes(q) ||
          a.issuer.toLowerCase().includes(q)
      );
    }
    if (sort === "tvl")    list.sort((a, b) => b.tvl - a.tvl);
    if (sort === "apy")    list.sort((a, b) => b.liveApy - a.liveApy);
    if (sort === "change") list.sort((a, b) => b.liveChange24h - a.liveChange24h);
    if (sort === "risk") {
      const order: Record<string, number> = { Minimal: 0, Low: 1, Medium: 2, High: 3 };
      list.sort((a, b) => order[a.risk] - order[b.risk]);
    }
    return list;
  }, [query, activeClass, sort, liveAssets]);

  return (
    <div className="space-y-6">
      {/* KYC banner */}
      {isConnected && !kycApproved && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-neutral-900/10 bg-neutral-950 p-6 text-white sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5" />
            <div>
              <p className="text-[14px] font-semibold">Complete KYC to enable trading</p>
              <p className="mt-1 text-[12px] text-white/70">
                Browse freely — buy/sell orders are gated until your wallet is verified.
              </p>
            </div>
          </div>
          <Link
            href="/investor/kyc"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-neutral-950 hover:bg-neutral-100"
          >
            <BadgeCheck className="h-4 w-4" /> Start KYC
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="display-lg text-neutral-950">Institutional marketplace.</h2>
          <p className="mt-1 text-[14px] text-neutral-600">
            {liveAssets.length} regulated assets •{" "}
            <span className="font-medium text-emerald-600">{liveCount} live</span> •{" "}
            {filtered.length} shown • T+0 settlement
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, name, issuer…"
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-[13px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none"
          />
        </div>
      </div>

      {/* Live ticker */}
      <LiveTicker
        prices={prices}
        loading={loading}
        error={error}
        lastFetched={lastFetched}
        refetch={refetch}
      />

      {/* Live stats banner (only after first load) */}
      {!loading && liveCount > 0 && (
        <LiveStatsBanner liveCount={liveCount} total={liveAssets.length} />
      )}

      {/* Live on-chain assets (real deployed tokens across chains) */}
      <LiveOnChainAssets liveAssets={dbAssets} liveLoading={dbAssetsLoading} />

      {/* Global live RWA market (real tokens across all 6 supported EVM chains) */}
      <GlobalRwaMarket />

      {/* Filter + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setActiveClass(c)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                activeClass === c
                  ? "bg-neutral-950 text-white"
                  : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:text-neutral-950"
              }`}
            >
              {c}
              {c !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {liveAssets.filter((a) => a.assetClass === c).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-neutral-500">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-950 focus:border-neutral-950 focus:outline-none"
          >
            <option value="tvl">TVL</option>
            <option value="apy">APY</option>
            <option value="change">24h Change</option>
            <option value="risk">Risk (low → high)</option>
          </select>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => (
          <AssetCard key={a.symbol} a={a} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="h-6 w-6 text-neutral-400" />
          <p className="mt-3 text-[14px] font-medium text-neutral-900">
            No assets match your filters
          </p>
          <p className="mt-1 text-[12px] text-neutral-500">
            Try clearing your search or switching asset class.
          </p>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-[11px] text-neutral-400">
        Live prices from CoinGecko (PAXG, BCT, NCT, MCO2) and US Treasury Fiscal Data API.
        Prices refresh every 60 s. Not investment advice.
      </p>
    </div>
  );
}
