/**
 * /api/prices  — Live market data aggregator
 *
 * Sources (all free, no key needed by default):
 *   • CoinGecko public API  → PAXG (gold), BCT, NCT, MCO2 (carbon)
 *   • US Treasury Fiscal Data API → T-Bill / T-Note / T-Bond average yields
 *
 * Optional (add keys to .env.local to unlock):
 *   • METALS_API_KEY  → live XAG (silver) via metals-api.com
 *   • ALPHA_VANTAGE_API_KEY → equities / FX via alphavantage.co
 *   • FRED_API_KEY  → UK Gilt 10-year yield via FRED (St. Louis Fed)
 *
 * The route is cached server-side for 60 s (gold/carbon) and 1 h (treasuries).
 * Clients should poll no more than every 60 s.
 */

import { NextResponse } from "next/server";

/* ─── Types ────────────────────────────────────────────────────────────────── */

export interface PricePoint {
  price: number | null;
  change24h: number | null;
  source: string;
  live: boolean;
}

export interface YieldPoint {
  rate: number | null;       // annualised %, e.g. 5.12
  source: string;
  live: boolean;
}

export interface PricesResponse {
  commodities: {
    gold: PricePoint;          // PAXG – 1 token = 1 troy oz gold
    silver: PricePoint;        // requires METALS_API_KEY
  };
  carbon: {
    bct: PricePoint;           // Toucan Base Carbon Tonne (Polygon)
    nct: PricePoint;           // Toucan Nature Carbon Tonne (Polygon)
    mco2: PricePoint;          // Moss Carbon Credit (Polygon)
    basket: PricePoint;        // simple average of bct + nct + mco2
  };
  treasuries: {
    us_tbill: YieldPoint;      // rolling 30d T-Bill
    us_tnote: YieldPoint;      // 2–10 y T-Note
    us_tbond: YieldPoint;      // 30 y T-Bond
    uk_gilt: YieldPoint;       // UK 10 y gilt – requires FRED_API_KEY
  };
  equities: {
    sp500_etf: PricePoint;     // bCSPX proxy – requires ALPHA_VANTAGE_API_KEY
  };
  lastUpdated: string;         // ISO-8601
  errors: string[];
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function nullPoint(source: string): PricePoint {
  return { price: null, change24h: null, source, live: false };
}
function nullYield(source: string): YieldPoint {
  return { rate: null, source, live: false };
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch {
    return null;
  }
}

/* ─── Route handler ─────────────────────────────────────────────────────────── */

export async function GET() {
  const errors: string[] = [];

  /* ── 1. CoinGecko (no API key required) ──────────────────────────────────── */
  const gold   = nullPoint("CoinGecko/PAXG");
  const bct    = nullPoint("CoinGecko/BCT");
  const nct    = nullPoint("CoinGecko/NCT");
  const mco2   = nullPoint("CoinGecko/MCO2");

  const cgIds =
    "pax-gold,toucan-protocol-base-carbon-tonne,toucan-protocol-nature-carbon-tonne,moss-carbon-credit";
  const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true`;

  const cgRes = await safeFetch(cgUrl, {
    headers: { Accept: "application/json", "User-Agent": "POLYCRUZ/1.0" },
    next: { revalidate: 60 },
  });

  if (cgRes?.ok) {
    const cg = await cgRes.json();

    if (cg["pax-gold"]?.usd != null) {
      gold.price     = cg["pax-gold"].usd;
      gold.change24h = cg["pax-gold"].usd_24h_change ?? null;
      gold.live      = true;
    }
    if (cg["toucan-protocol-base-carbon-tonne"]?.usd != null) {
      bct.price     = cg["toucan-protocol-base-carbon-tonne"].usd;
      bct.change24h = cg["toucan-protocol-base-carbon-tonne"].usd_24h_change ?? null;
      bct.live      = true;
    }
    if (cg["toucan-protocol-nature-carbon-tonne"]?.usd != null) {
      nct.price     = cg["toucan-protocol-nature-carbon-tonne"].usd;
      nct.change24h = cg["toucan-protocol-nature-carbon-tonne"].usd_24h_change ?? null;
      nct.live      = true;
    }
    if (cg["moss-carbon-credit"]?.usd != null) {
      mco2.price     = cg["moss-carbon-credit"].usd;
      mco2.change24h = cg["moss-carbon-credit"].usd_24h_change ?? null;
      mco2.live      = true;
    }
  } else {
    errors.push(`CoinGecko: HTTP ${cgRes?.status ?? "unreachable"}`);
  }

  // Carbon basket = simple average of available prices
  const cPrices  = [bct.price, nct.price, mco2.price].filter((x): x is number => x !== null);
  const cChanges = [bct.change24h, nct.change24h, mco2.change24h].filter((x): x is number => x !== null);
  const basket: PricePoint = {
    price:     cPrices.length  ? cPrices.reduce((a, b) => a + b, 0)  / cPrices.length  : null,
    change24h: cChanges.length ? cChanges.reduce((a, b) => a + b, 0) / cChanges.length : null,
    source:    "CoinGecko/BCT+NCT+MCO2 avg",
    live:      cPrices.length > 0,
  };

  /* ── 2. Silver via Metals-API (optional key) ─────────────────────────────── */
  const silver = nullPoint("metals-api.com/XAG");
  const METALS_KEY = process.env.METALS_API_KEY;
  if (METALS_KEY) {
    const mRes = await safeFetch(
      `https://metals-api.com/api/latest?access_key=${METALS_KEY}&base=USD&symbols=XAG`,
      { next: { revalidate: 300 } }
    );
    if (mRes?.ok) {
      const m = await mRes.json();
      if (m.rates?.XAG) {
        // API returns how many XAG per 1 USD; invert to get USD per troy oz
        silver.price = 1 / m.rates.XAG;
        silver.live  = true;
      }
    } else {
      errors.push(`Metals-API: HTTP ${mRes?.status ?? "unreachable"}`);
    }
  }

  /* ── 3. US Treasury Fiscal Data (no key required) ─────────────────────────── */
  const usTbill = nullYield("api.fiscaldata.treasury.gov");
  const usTnote = nullYield("api.fiscaldata.treasury.gov");
  const usTbond = nullYield("api.fiscaldata.treasury.gov");

  const tUrl =
    "https://api.fiscaldata.treasury.gov/services/api/v1/accounting/od/avg_interest_rates" +
    "?fields=record_date,security_desc,avg_interest_rate_amt" +
    "&filter=security_desc:in:(Treasury Bills,Treasury Notes,Treasury Bonds)" +
    "&sort=-record_date&page[number]=1&page[size]=20";

  const tRes = await safeFetch(tUrl, { next: { revalidate: 3600 } });
  if (tRes?.ok) {
    const tData = await tRes.json();
    const rows: Array<{ security_desc: string; avg_interest_rate_amt: string }> =
      tData.data ?? [];
    const seen = new Set<string>();
    for (const row of rows) {
      if (seen.has(row.security_desc)) continue;
      seen.add(row.security_desc);
      const rate = parseFloat(row.avg_interest_rate_amt);
      if (isNaN(rate)) continue;
      if (row.security_desc === "Treasury Bills") { usTbill.rate = rate; usTbill.live = true; }
      if (row.security_desc === "Treasury Notes") { usTnote.rate = rate; usTnote.live = true; }
      if (row.security_desc === "Treasury Bonds") { usTbond.rate = rate; usTbond.live = true; }
    }
  } else {
    errors.push(`US Treasury: HTTP ${tRes?.status ?? "unreachable"}`);
  }

  /* ── 4. UK Gilt 10 y via FRED (optional key) ──────────────────────────────── */
  const ukGilt = nullYield("FRED/IRLTLT01GBM156N");
  const FRED_KEY = process.env.FRED_API_KEY;
  if (FRED_KEY) {
    const fUrl =
      `https://api.stlouisfed.org/fred/series/observations?series_id=IRLTLT01GBM156N` +
      `&api_key=${FRED_KEY}&limit=1&sort_order=desc&file_type=json`;
    const fRes = await safeFetch(fUrl, { next: { revalidate: 3600 } });
    if (fRes?.ok) {
      const fData = await fRes.json();
      const obs = fData.observations?.[0];
      if (obs?.value && obs.value !== ".") {
        ukGilt.rate = parseFloat(obs.value);
        ukGilt.live = true;
      }
    } else {
      errors.push(`FRED: HTTP ${fRes?.status ?? "unreachable"}`);
    }
  }

  /* ── 5. S&P 500 ETF proxy via Alpha Vantage (optional key) ───────────────── */
  const sp500 = nullPoint("AlphaVantage/SPY");
  const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  if (AV_KEY) {
    const avUrl =
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${AV_KEY}`;
    const avRes = await safeFetch(avUrl, { next: { revalidate: 300 } });
    if (avRes?.ok) {
      const av = await avRes.json();
      const q = av["Global Quote"];
      if (q?.["05. price"]) {
        sp500.price     = parseFloat(q["05. price"]);
        sp500.change24h = parseFloat(q["10. change percent"]?.replace("%", "") ?? "0");
        sp500.live      = true;
      }
    } else {
      errors.push(`AlphaVantage: HTTP ${avRes?.status ?? "unreachable"}`);
    }
  }

  /* ── Build response ─────────────────────────────────────────────────────── */
  const body: PricesResponse = {
    commodities: { gold, silver },
    carbon:      { bct, nct, mco2, basket },
    treasuries:  { us_tbill: usTbill, us_tnote: usTnote, us_tbond: usTbond, uk_gilt: ukGilt },
    equities:    { sp500_etf: sp500 },
    lastUpdated: new Date().toISOString(),
    errors,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
