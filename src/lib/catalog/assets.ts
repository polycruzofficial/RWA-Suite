/**
 * Catalog of institutional RWA assets available on the POLYCRUZ marketplace.
 *
 * Static fields (issuer, description, risk, …) are always accurate.
 * `price`, `priceChange24h`, and `apy` are FALLBACK values used when the
 * live /api/prices feed is unavailable.  The marketplace page overlays real-
 * time data from useLivePrices() on top of these defaults.
 *
 * Assets tagged `liveKey` have a matching field in PricesResponse and will
 * show a "LIVE" badge in the UI.
 */

export type AssetClass =
  | "Sovereign Debt"
  | "Private Credit"
  | "Equities"
  | "Commodities"
  | "Real Estate"
  | "Carbon Credits";

export type LiveKey =
  | "gold"           // commodities.gold
  | "silver"         // commodities.silver
  | "bct"            // carbon.bct
  | "nct"            // carbon.nct
  | "mco2"           // carbon.mco2
  | "carbon_basket"  // carbon.basket
  | "us_tbill"       // treasuries.us_tbill  (drives APY)
  | "us_tnote"       // treasuries.us_tnote  (drives APY)
  | "us_tbond"       // treasuries.us_tbond  (drives APY)
  | "uk_gilt"        // treasuries.uk_gilt   (drives APY)
  | "sp500_etf";     // equities.sp500_etf

export interface MarketAsset {
  symbol:          string;
  name:            string;
  issuer:          string;
  assetClass:      AssetClass;
  jurisdiction:    string;
  /** Fallback price in USD – overridden by live feed when available */
  price:           number;
  /** Fallback 24-h change % */
  priceChange24h:  number;
  /** Fallback APY % (0 = no yield) */
  apy:             number;
  tvl:             number;       // total value locked, USD
  minInvestment:   number;       // USD
  maturity:        string;       // ISO date or "Perpetual"
  risk:            "Minimal" | "Low" | "Medium" | "High";
  rating:          "AAA" | "AA+" | "AA" | "A+" | "A" | "BBB+";
  description:     string;
  holders:         number;
  settlements:     string[];     // accepted stablecoins / ETH
  /** Which /api/prices field drives this asset's live price or APY */
  liveKey?:        LiveKey;
  /** If true, the live feed updates APY only (not price) */
  liveUpdatesApy?: boolean;
  /** Chain where the on-chain token lives */
  chain?:          string;
  /** On-chain contract address */
  contractAddress?: string;
  /** External data provider label shown in UI */
  dataProvider?:   string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOVEREIGN DEBT
═══════════════════════════════════════════════════════════════════════════ */

const sovereignDebt: MarketAsset[] = [
  {
    symbol:          "GILT26",
    name:            "UK Gilt Bond 2026",
    issuer:          "HM Treasury (wrapped)",
    assetClass:      "Sovereign Debt",
    jurisdiction:    "GB",
    price:           1.02,
    priceChange24h:  0.12,
    apy:             4.82,
    tvl:             2_400_000,
    minInvestment:   1_000,
    maturity:        "2026-12-31",
    risk:            "Minimal",
    rating:          "AAA",
    description:
      "Tokenized UK government gilt bond with 4.82% coupon, maturing December 2026. " +
      "Fully backed 1:1 by custodied underlying. Yield updated from DMO / FRED data.",
    holders:         142,
    settlements:     ["USDC", "GBPT", "ETH"],
    liveKey:         "uk_gilt",
    liveUpdatesApy:  true,
    dataProvider:    "UK DMO / FRED",
  },
  {
    symbol:          "USTB30",
    name:            "US Treasury 30D Bill",
    issuer:          "POLYCRUZ • Fidelity Custody",
    assetClass:      "Sovereign Debt",
    jurisdiction:    "US",
    price:           1.0,
    priceChange24h:  0.01,
    apy:             5.12,
    tvl:             3_820_000,
    minInvestment:   500,
    maturity:        "2026-05-10",
    risk:            "Minimal",
    rating:          "AAA",
    description:
      "Rolling 30-day US Treasury bill exposure. APY tracks the live T-Bill auction " +
      "rate from the US Treasury Fiscal Data API. T+0 settlement via Fidelity Digital Assets.",
    holders:         318,
    settlements:     ["USDC", "USDT", "PYUSD"],
    liveKey:         "us_tbill",
    liveUpdatesApy:  true,
    dataProvider:    "US Treasury Fiscal Data",
  },
  {
    symbol:          "OUSG",
    name:            "Ondo US Dollar Yield",
    issuer:          "Ondo Finance",
    assetClass:      "Sovereign Debt",
    jurisdiction:    "US",
    price:           1.0,
    priceChange24h:  0.0,
    apy:             5.05,
    tvl:             680_000_000,
    minInvestment:   5_000,
    maturity:        "Perpetual",
    risk:            "Minimal",
    rating:          "AAA",
    description:
      "OUSG is a tokenized short-duration US Treasury ETF (BlackRock iShares SHV). " +
      "Fully on-chain ERC-20, permissioned access. APY tracks the live US T-Bill rate.",
    holders:         2_140,
    settlements:     ["USDC"],
    liveKey:         "us_tbill",
    liveUpdatesApy:  true,
    chain:           "Ethereum / Polygon",
    contractAddress: "0x1B19C19F74f1Ae5628fbe1CdC57471b169b9EdC7",
    dataProvider:    "US Treasury Fiscal Data",
  },
  {
    symbol:          "EURB27",
    name:            "EU Bund 2027",
    issuer:          "Deutsche Bundesbank (wrapped)",
    assetClass:      "Sovereign Debt",
    jurisdiction:    "EU",
    price:           1.01,
    priceChange24h:  0.03,
    apy:             3.9,
    tvl:             1_420_000,
    minInvestment:   1_000,
    maturity:        "2027-06-15",
    risk:            "Minimal",
    rating:          "AAA",
    description:
      "Tokenized German Bund exposure with 3.9% coupon, settled T+0 on-chain. " +
      "Backed by custodied German federal bonds held at Clearstream.",
    holders:         112,
    settlements:     ["EURC", "USDC"],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   COMMODITIES
═══════════════════════════════════════════════════════════════════════════ */

const commodities: MarketAsset[] = [
  {
    symbol:          "PAXG",
    name:            "Paxos Gold",
    issuer:          "Paxos Trust Company",
    assetClass:      "Commodities",
    jurisdiction:    "US",
    price:           3_245.10,
    priceChange24h:  0.42,
    apy:             0,
    tvl:             592_000_000,
    minInvestment:   100,
    maturity:        "Perpetual",
    risk:            "Low",
    rating:          "AA+",
    description:
      "1 PAXG = 1 troy ounce of LBMA Good Delivery gold held in Brinks vaults. " +
      "Paxos-regulated, redeemable for physical delivery. Price is live from CoinGecko.",
    holders:         18_600,
    settlements:     ["USDC", "USDT", "ETH"],
    liveKey:         "gold",
    chain:           "Ethereum (ERC-20)",
    contractAddress: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
    dataProvider:    "CoinGecko / PAXG",
  },
  {
    symbol:          "GOLD",
    name:            "Tokenized LBMA Gold",
    issuer:          "Brinks Vault Zürich",
    assetClass:      "Commodities",
    jurisdiction:    "CH",
    price:           3_245.10,
    priceChange24h:  0.42,
    apy:             0,
    tvl:             420_000,
    minInvestment:   100,
    maturity:        "Perpetual",
    risk:            "Low",
    rating:          "AA+",
    description:
      "1 token = 1 gram of LBMA Good Delivery gold, redeemable for physical delivery. " +
      "Insured by Lloyd's of London. Price is live via PAXG spot (CoinGecko).",
    holders:         412,
    settlements:     ["USDC", "USDT", "ETH"],
    liveKey:         "gold",
    dataProvider:    "CoinGecko / PAXG proxy",
  },
  {
    symbol:          "SILVER",
    name:            "Tokenized LBMA Silver",
    issuer:          "Brinks Vault Zürich",
    assetClass:      "Commodities",
    jurisdiction:    "CH",
    price:           32.40,
    priceChange24h:  0.18,
    apy:             0,
    tvl:             85_000,
    minInvestment:   50,
    maturity:        "Perpetual",
    risk:            "Low",
    rating:          "AA",
    description:
      "1 token = 1 troy oz of LBMA silver. Physical delivery on redemption. " +
      "Live price via metals-api.com (add METALS_API_KEY to .env.local).",
    holders:         188,
    settlements:     ["USDC", "USDT"],
    liveKey:         "silver",
    dataProvider:    "metals-api.com / XAG",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CARBON CREDITS
═══════════════════════════════════════════════════════════════════════════ */

const carbonCredits: MarketAsset[] = [
  {
    symbol:          "BCT",
    name:            "Base Carbon Tonne",
    issuer:          "Toucan Protocol",
    assetClass:      "Carbon Credits",
    jurisdiction:    "SG",
    price:           0.72,
    priceChange24h:  -1.20,
    apy:             0,
    tvl:             12_400_000,
    minInvestment:   10,
    maturity:        "Perpetual",
    risk:            "Medium",
    rating:          "A",
    description:
      "BCT represents VERRA-verified carbon credits bridged on-chain via Toucan Protocol. " +
      "Each token = 1 tonne of CO₂ retirable from the voluntary carbon market. " +
      "Price is live from CoinGecko BCT/USD.",
    holders:         8_200,
    settlements:     ["USDC", "USDT"],
    liveKey:         "bct",
    chain:           "Polygon (ERC-20)",
    contractAddress: "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
    dataProvider:    "CoinGecko / BCT",
  },
  {
    symbol:          "NCT",
    name:            "Nature Carbon Tonne",
    issuer:          "Toucan Protocol",
    assetClass:      "Carbon Credits",
    jurisdiction:    "SG",
    price:           1.15,
    priceChange24h:  0.30,
    apy:             0,
    tvl:             8_600_000,
    minInvestment:   10,
    maturity:        "Perpetual",
    risk:            "Medium",
    rating:          "A",
    description:
      "NCT is a nature-based carbon credit pool on Toucan Protocol from forest protection " +
      "projects (VCS + CCB certified). 1 NCT = 1 tonne CO₂. Live price from CoinGecko.",
    holders:         5_400,
    settlements:     ["USDC", "USDT"],
    liveKey:         "nct",
    chain:           "Polygon (ERC-20)",
    contractAddress: "0xD838290e877E0188a4A44700463419ED96c16107",
    dataProvider:    "CoinGecko / NCT",
  },
  {
    symbol:          "MCO2",
    name:            "Moss Carbon Credit",
    issuer:          "Moss Earth",
    assetClass:      "Carbon Credits",
    jurisdiction:    "BR",
    price:           0.95,
    priceChange24h:  -0.80,
    apy:             0,
    tvl:             3_200_000,
    minInvestment:   10,
    maturity:        "Perpetual",
    risk:            "Medium",
    rating:          "A",
    description:
      "MCO2 represents VERRA-verified Amazon rainforest carbon credits from Moss Earth. " +
      "Redeemable via the Moss platform or directly on-chain. Live price from CoinGecko.",
    holders:         3_100,
    settlements:     ["USDC"],
    liveKey:         "mco2",
    chain:           "Ethereum / Polygon",
    contractAddress: "0xAa7DbD1598251f856C12f63557A4C4397c253Cea",
    dataProvider:    "CoinGecko / MCO2",
  },
  {
    symbol:          "CMDY01",
    name:            "Carbon Credit Basket",
    issuer:          "ClimateX Registry",
    assetClass:      "Carbon Credits",
    jurisdiction:    "SG",
    price:           0.94,
    priceChange24h:  -0.57,
    apy:             0,
    tvl:             340_000,
    minInvestment:   100,
    maturity:        "Perpetual",
    risk:            "Medium",
    rating:          "A",
    description:
      "Equal-weight basket of BCT + NCT + MCO2 — diversified on-chain voluntary carbon " +
      "market exposure. Retireable on-chain. Price is the live basket average.",
    holders:         87,
    settlements:     ["USDC", "USDT"],
    liveKey:         "carbon_basket",
    dataProvider:    "CoinGecko / BCT+NCT+MCO2 avg",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PRIVATE CREDIT
═══════════════════════════════════════════════════════════════════════════ */

const privateCredit: MarketAsset[] = [
  {
    symbol:          "CREDIT1",
    name:            "Prime Credit Pool I",
    issuer:          "Alpha Management LP",
    assetClass:      "Private Credit",
    jurisdiction:    "GB",
    price:           0.98,
    priceChange24h:  -0.08,
    apy:             7.45,
    tvl:             1_100_000,
    minInvestment:   25_000,
    maturity:        "2028-03-01",
    risk:            "Medium",
    rating:          "A+",
    description:
      "Senior secured direct lending fund. 120-borrower portfolio, quarterly " +
      "distributions, 30-day redemption window. Administered on Centrifuge.",
    holders:         28,
    settlements:     ["USDC", "USDT"],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   EQUITIES
═══════════════════════════════════════════════════════════════════════════ */

const equities: MarketAsset[] = [
  {
    symbol:          "BCSPX",
    name:            "Tokenized S&P 500 ETF",
    issuer:          "Backed Finance",
    assetClass:      "Equities",
    jurisdiction:    "CH",
    price:           589.20,
    priceChange24h:  0.84,
    apy:             0,
    tvl:             48_000_000,
    minInvestment:   500,
    maturity:        "Perpetual",
    risk:            "Medium",
    rating:          "A+",
    description:
      "bCSPX tracks the iShares Core S&P 500 UCITS ETF on-chain. Each token is backed " +
      "1:1 by custodied ETF shares (Clearstream). Live price requires ALPHA_VANTAGE_API_KEY.",
    holders:         4_200,
    settlements:     ["USDC", "USDT"],
    liveKey:         "sp500_etf",
    chain:           "Polygon / Base",
    dataProvider:    "AlphaVantage / SPY",
  },
  {
    symbol:          "EQFA",
    name:            "Equity Fund A",
    issuer:          "POLYCRUZ Ventures",
    assetClass:      "Equities",
    jurisdiction:    "GB",
    price:           1.15,
    priceChange24h:  1.4,
    apy:             0,
    tvl:             680_000,
    minInvestment:   10_000,
    maturity:        "Perpetual",
    risk:            "High",
    rating:          "BBB+",
    description:
      "Pre-IPO equity interests in European fintech portfolio. NAV struck quarterly, " +
      "transferable on-chain via ERC-3643.",
    holders:         57,
    settlements:     ["USDC", "ETH"],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   REAL ESTATE
═══════════════════════════════════════════════════════════════════════════ */

const realEstate: MarketAsset[] = [
  {
    symbol:          "REIT-LON",
    name:            "London Prime Real Estate",
    issuer:          "POLYCRUZ Real Assets",
    assetClass:      "Real Estate",
    jurisdiction:    "GB",
    price:           1.08,
    priceChange24h:  0.06,
    apy:             5.6,
    tvl:             1_850_000,
    minInvestment:   5_000,
    maturity:        "Perpetual",
    risk:            "Low",
    rating:          "AA",
    description:
      "Prime Mayfair commercial property fund. Quarterly rental distributions, " +
      "annual re-valuations via RICS-certified surveyors.",
    holders:         96,
    settlements:     ["USDC", "GBPT"],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Combined exports
═══════════════════════════════════════════════════════════════════════════ */

export const assets: MarketAsset[] = [
  ...sovereignDebt,
  ...commodities,
  ...carbonCredits,
  ...privateCredit,
  ...equities,
  ...realEstate,
];

export function findAsset(symbol: string): MarketAsset | undefined {
  return assets.find(
    (a) => a.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/** All distinct asset classes present in the catalog (for filter tabs) */
export const assetClasses: AssetClass[] = [
  "Sovereign Debt",
  "Commodities",
  "Carbon Credits",
  "Private Credit",
  "Equities",
  "Real Estate",
];
