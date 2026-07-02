"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useIdentity } from "@/hooks/useContracts";
import { assets, type AssetClass } from "@/lib/catalog/assets";
import { getAllAssets, type DBAsset } from "@/lib/supabase";
import { DEFAULT_CHAIN_ID } from "@/config/contracts";
import { getChainName, MARKETPLACE_NETWORKS } from "@/config/chains";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Globe,
  Lock,
  BadgeCheck,
  Radio,
} from "lucide-react";

const classes: (AssetClass | "All")[] = [
  "All",
  "Sovereign Debt",
  "Private Credit",
  "Equities",
  "Commodities",
  "Real Estate",
];

const riskVariant: Record<
  string,
  "success" | "info" | "warning" | "error"
> = {
  Minimal: "success",
  Low: "info",
  Medium: "warning",
  High: "error",
};

function formatUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const { data: identity } = useIdentity(address);
  const [query, setQuery] = useState("");
  const [activeClass, setActiveClass] = useState<AssetClass | "All">("All");
  const [sort, setSort] = useState<"tvl" | "apy" | "risk">("tvl");

  const [liveAssets, setLiveAssets] = useState<DBAsset[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [chainFilter, setChainFilter] = useState<number | "all">("all");

  useEffect(() => {
    getAllAssets()
      .then(setLiveAssets)
      .catch(() => setLiveAssets([]))
      .finally(() => setLiveLoading(false));
  }, []);

  const visibleLiveAssets = useMemo(() => {
    if (chainFilter === "all") return liveAssets;
    return liveAssets.filter((a) => (a.chain_id ?? DEFAULT_CHAIN_ID) === chainFilter);
  }, [liveAssets, chainFilter]);

  const identityStatus =
    identity && typeof identity === "object" && "status" in identity
      ? Number((identity as { status: unknown }).status)
      : 0;
  const kycApproved = identityStatus >= 2;

  const filtered = useMemo(() => {
    let list = [...assets];
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
    if (sort === "tvl") list.sort((a, b) => b.tvl - a.tvl);
    if (sort === "apy") list.sort((a, b) => b.apy - a.apy);
    if (sort === "risk") {
      const order = { Minimal: 0, Low: 1, Medium: 2, High: 3 };
      list.sort((a, b) => order[a.risk] - order[b.risk]);
    }
    return list;
  }, [query, activeClass, sort]);

  return (
    <div className="space-y-8">
      {/* KYC banner */}
      {isConnected && !kycApproved && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-neutral-900/10 bg-neutral-950 p-6 text-white sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5" />
            <div>
              <p className="text-[14px] font-semibold">
                Complete KYC to enable trading
              </p>
              <p className="mt-1 text-[12px] text-white/70">
                You can browse the marketplace, but buy/sell orders are gated
                until your wallet is verified.
              </p>
            </div>
          </div>
          <Link
            href="/investor/kyc"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-neutral-950 hover:bg-neutral-100"
          >
            <BadgeCheck className="h-4 w-4" />
            Start KYC
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="display-lg text-neutral-950">
            Institutional marketplace.
          </h2>
          <p className="mt-1 text-[14px] text-neutral-600">
            {assets.length} regulated assets • {filtered.length} shown • T+0
            settlement
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

      {/* Live on-chain assets */}
      {!liveLoading && (
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
      )}

      {/* Filter tabs */}
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
            <option value="risk">Risk (low → high)</option>
          </select>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => {
          const positive = a.priceChange24h >= 0;
          return (
            <Link
              key={a.symbol}
              href={`/investor/asset/${a.symbol}`}
              className="card group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:border-neutral-900/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                    {a.assetClass}
                  </p>
                  <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-neutral-950">
                    {a.name}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-neutral-500">
                    {a.issuer}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 font-mono text-[10px] font-bold text-white">
                  {a.symbol.slice(0, 4)}
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-neutral-500">Price</p>
                  <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-950">
                    ${a.price.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                    positive
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200/70"
                      : "bg-red-50 text-red-800 ring-red-200/70"
                  }`}
                >
                  {positive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {positive ? "+" : ""}
                  {a.priceChange24h.toFixed(2)}%
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-neutral-50 p-4 text-[11px]">
                <div>
                  <p className="text-neutral-500">APY</p>
                  <p className="mt-0.5 font-semibold text-neutral-950">
                    {a.apy > 0 ? `${a.apy}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">TVL</p>
                  <p className="mt-0.5 font-semibold text-neutral-950">
                    {formatUSD(a.tvl)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Rating</p>
                  <p className="mt-0.5 font-semibold text-neutral-950">
                    {a.rating}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                  <Globe className="h-3 w-3" />
                  {a.jurisdiction}
                  <StatusBadge status={a.risk} variant={riskVariant[a.risk]} />
                </div>
                <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-neutral-950 transition group-hover:gap-1.5">
                  View
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
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
    </div>
  );
}
