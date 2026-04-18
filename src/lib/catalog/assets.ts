// Catalog of institutional RWA assets available on the Equitex marketplace.
// Values are indicative for the demo. In production these come from the
// RWATokenFactory via useIssuerTokens + chain reads.

export type AssetClass =
  | "Sovereign Debt"
  | "Private Credit"
  | "Equities"
  | "Commodities"
  | "Real Estate";

export interface MarketAsset {
  symbol: string;
  name: string;
  issuer: string;
  assetClass: AssetClass;
  jurisdiction: string;
  price: number;          // in USD
  priceChange24h: number; // %
  apy: number;            // %
  tvl: number;            // total value locked, USD
  minInvestment: number;  // USD
  maturity: string;       // ISO date or "Perpetual"
  risk: "Minimal" | "Low" | "Medium" | "High";
  rating: "AAA" | "AA+" | "AA" | "A+" | "A" | "BBB+";
  description: string;
  holders: number;
  settlements: string[];  // accepted settlement assets (e.g. USDC, USDT)
}

export const assets: MarketAsset[] = [
  {
    symbol: "GILT26",
    name: "UK Gilt Bond 2026",
    issuer: "HM Treasury (wrapped)",
    assetClass: "Sovereign Debt",
    jurisdiction: "GB",
    price: 1.02,
    priceChange24h: 0.12,
    apy: 4.82,
    tvl: 2_400_000,
    minInvestment: 1_000,
    maturity: "2026-12-31",
    risk: "Minimal",
    rating: "AAA",
    description:
      "Tokenized UK government gilt bond with 4.82% coupon, maturing December 2026. Fully backed 1:1 by custodied underlying.",
    holders: 142,
    settlements: ["USDC", "GBPT", "ETH"],
  },
  {
    symbol: "USTB30",
    name: "US Treasury 30D Bill",
    issuer: "Equitex • Fidelity Custody",
    assetClass: "Sovereign Debt",
    jurisdiction: "US",
    price: 1.0,
    priceChange24h: 0.01,
    apy: 5.12,
    tvl: 3_820_000,
    minInvestment: 500,
    maturity: "2026-05-10",
    risk: "Minimal",
    rating: "AAA",
    description:
      "Rolling 30-day US Treasury bill exposure. T+0 settlement via Fidelity Digital Assets custody.",
    holders: 318,
    settlements: ["USDC", "USDT", "PYUSD"],
  },
  {
    symbol: "CREDIT1",
    name: "Prime Credit Pool I",
    issuer: "Alpha Management LP",
    assetClass: "Private Credit",
    jurisdiction: "GB",
    price: 0.98,
    priceChange24h: -0.08,
    apy: 7.45,
    tvl: 1_100_000,
    minInvestment: 25_000,
    maturity: "2028-03-01",
    risk: "Medium",
    rating: "A+",
    description:
      "Senior secured direct lending fund. 120 borrower portfolio, quarterly distributions, 30-day redemption window.",
    holders: 28,
    settlements: ["USDC", "USDT"],
  },
  {
    symbol: "EQFA",
    name: "Equity Fund A",
    issuer: "Equitex Ventures",
    assetClass: "Equities",
    jurisdiction: "GB",
    price: 1.15,
    priceChange24h: 1.4,
    apy: 0,
    tvl: 680_000,
    minInvestment: 10_000,
    maturity: "Perpetual",
    risk: "High",
    rating: "BBB+",
    description:
      "Pre-IPO equity interests in European fintech portfolio. NAV struck quarterly, transferable on-chain.",
    holders: 57,
    settlements: ["USDC", "ETH"],
  },
  {
    symbol: "GOLD",
    name: "Tokenized LBMA Gold",
    issuer: "Brinks Vault Zurich",
    assetClass: "Commodities",
    jurisdiction: "CH",
    price: 2_342.1,
    priceChange24h: 0.42,
    apy: 0,
    tvl: 420_000,
    minInvestment: 100,
    maturity: "Perpetual",
    risk: "Low",
    rating: "AA+",
    description:
      "1 token = 1 gram of LBMA Good Delivery gold, redeemable for physical delivery. Insured by Lloyd's.",
    holders: 412,
    settlements: ["USDC", "USDT", "ETH"],
  },
  {
    symbol: "REIT-LON",
    name: "London Prime Real Estate",
    issuer: "Equitex Real Assets",
    assetClass: "Real Estate",
    jurisdiction: "GB",
    price: 1.08,
    priceChange24h: 0.06,
    apy: 5.6,
    tvl: 1_850_000,
    minInvestment: 5_000,
    maturity: "Perpetual",
    risk: "Low",
    rating: "AA",
    description:
      "Prime Mayfair commercial property fund. Quarterly rental distributions, annual re-valuations.",
    holders: 96,
    settlements: ["USDC", "GBPT"],
  },
  {
    symbol: "EURB27",
    name: "EU Bund 2027",
    issuer: "Deutsche Bundesbank (wrapped)",
    assetClass: "Sovereign Debt",
    jurisdiction: "EU",
    price: 1.01,
    priceChange24h: 0.03,
    apy: 3.9,
    tvl: 1_420_000,
    minInvestment: 1_000,
    maturity: "2027-06-15",
    risk: "Minimal",
    rating: "AAA",
    description:
      "Tokenized German Bund exposure with 3.9% coupon, settled T+0 on-chain.",
    holders: 112,
    settlements: ["EURC", "USDC"],
  },
  {
    symbol: "CMDY01",
    name: "Carbon Credit Basket",
    issuer: "ClimateX Registry",
    assetClass: "Commodities",
    jurisdiction: "SG",
    price: 0.72,
    priceChange24h: -1.2,
    apy: 0,
    tvl: 340_000,
    minInvestment: 100,
    maturity: "Perpetual",
    risk: "Medium",
    rating: "A",
    description:
      "Basket of verified voluntary carbon credits (VCS, Gold Standard). Retireable on-chain.",
    holders: 87,
    settlements: ["USDC", "USDT"],
  },
];

export function findAsset(symbol: string) {
  return assets.find((a) => a.symbol.toLowerCase() === symbol.toLowerCase());
}
