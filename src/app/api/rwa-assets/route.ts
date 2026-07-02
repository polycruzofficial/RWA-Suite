/**
 * /api/rwa-assets — Live, real-world RWA token market across our 6 supported
 * EVM chains (Ethereum, BNB Chain, Arbitrum, Base, Polygon, Avalanche).
 *
 * Source (free, no key needed):
 *   • CoinGecko public API — tokenized RWA categories (broad RWA bucket,
 *     gold, treasuries, private credit) joined against CoinGecko's
 *     coins/list platform map to recover the on-chain contract address
 *     for each supported chain.
 *
 * Assets with no contract on any of our 6 supported chains are dropped —
 * this endpoint only surfaces tokens investors could actually hold here.
 */

import { NextResponse } from "next/server";

/* ─── Types ────────────────────────────────────────────────────────────────── */

export interface RwaChainListing {
  chainId: number;
  chainName: string;
  address: string;
  explorer: string;
}

export interface RwaAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number | null;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  categories: string[];
  chains: RwaChainListing[];
}

export interface RwaAssetsResponse {
  assets: RwaAsset[];
  lastUpdated: string;
  source: string;
  errors: string[];
}

/* ─── Category + chain maps ──────────────────────────────────────────────────── */

// Kept short and fetched sequentially (see GET) — CoinGecko's free anonymous
// tier rate-limits hard on bursts of parallel requests. "real-world-assets-rwa"
// is the broad parent bucket and already covers most tokens on its own; the
// rest fill in categories it sometimes misses.
const RWA_CATEGORIES: Record<string, string> = {
  "real-world-assets-rwa": "Real World Assets",
  "tokenized-gold": "Tokenized Gold",
  "tokenized-treasuries": "Tokenized Treasuries",
  "tokenized-private-credit": "Tokenized Private Credit",
};

// Maps CoinGecko's platform id -> one of our 6 supported EVM chains.
const CHAIN_BY_PLATFORM: Record<string, { chainId: number; chainName: string; explorer: string }> = {
  ethereum: { chainId: 1, chainName: "Ethereum", explorer: "https://etherscan.io" },
  "binance-smart-chain": { chainId: 56, chainName: "BNB Chain", explorer: "https://bscscan.com" },
  "arbitrum-one": { chainId: 42161, chainName: "Arbitrum", explorer: "https://arbiscan.io" },
  base: { chainId: 8453, chainName: "Base", explorer: "https://basescan.org" },
  "polygon-pos": { chainId: 137, chainName: "Polygon", explorer: "https://polygonscan.com" },
  avalanche: { chainId: 43114, chainName: "Avalanche", explorer: "https://snowtrace.io" },
};

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

async function safeFetchJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "POLYCRUZ/1.0" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CgMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
  total_volume: number | null;
}

interface CgListCoin {
  id: string;
  platforms?: Record<string, string>;
}

/* ─── Route handler ─────────────────────────────────────────────────────────── */

export async function GET() {
  const errors: string[] = [];

  // Bulk platform/contract-address lookup goes first and alone — one call
  // covers every coin CoinGecko tracks (far cheaper than N per-coin detail
  // calls), it's cached for 6h since contract mappings barely change, and
  // fetching it before the category loop means it isn't starved of time/
  // rate-limit headroom by whatever comes before it.
  const listData = await safeFetchJson<CgListCoin[]>(
    "https://api.coingecko.com/api/v3/coins/list?include_platform=true",
    21_600
  );
  if (!listData) errors.push("CoinGecko coins/list: unreachable (chain data unavailable)");

  const platformsById = new Map<string, Record<string, string>>();
  if (listData) {
    for (const c of listData) {
      if (c.platforms && Object.keys(c.platforms).length) platformsById.set(c.id, c.platforms);
    }
  }

  // Categories fetched one at a time with spacing — CoinGecko's free
  // anonymous tier returns 429s almost immediately on parallel requests.
  await sleep(2_000);
  const categoryEntries = Object.entries(RWA_CATEGORIES);
  const byId = new Map<string, { coin: CgMarketCoin; categories: Set<string> }>();

  for (let i = 0; i < categoryEntries.length; i++) {
    const [catId, label] = categoryEntries[i];
    const url =
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${catId}` +
      `&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;
    const data = await safeFetchJson<CgMarketCoin[]>(url, 300);
    if (!data) {
      errors.push(`CoinGecko category "${catId}": unreachable`);
    } else {
      for (const coin of data) {
        const existing = byId.get(coin.id);
        if (existing) existing.categories.add(label);
        else byId.set(coin.id, { coin, categories: new Set([label]) });
      }
    }
    if (i < categoryEntries.length - 1) await sleep(2_000);
  }

  if (byId.size === 0) {
    const body: RwaAssetsResponse = {
      assets: [],
      lastUpdated: new Date().toISOString(),
      source: "CoinGecko public API (free, no key)",
      errors: [...errors, "No RWA market data available"],
    };
    return NextResponse.json(body);
  }

  const result: RwaAsset[] = [];
  for (const { coin, categories } of byId.values()) {
    const platforms = platformsById.get(coin.id) ?? {};
    const chains: RwaChainListing[] = [];
    for (const [platformId, address] of Object.entries(platforms)) {
      const chainInfo = CHAIN_BY_PLATFORM[platformId];
      if (chainInfo && address) {
        chains.push({ chainId: chainInfo.chainId, chainName: chainInfo.chainName, address, explorer: chainInfo.explorer });
      }
    }
    if (chains.length === 0) continue; // only surface assets live on our 6 supported chains

    result.push({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      categories: Array.from(categories),
      chains,
    });
  }

  result.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));

  const body: RwaAssetsResponse = {
    assets: result,
    lastUpdated: new Date().toISOString(),
    source: "CoinGecko public API (free, no key)",
    errors,
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
