import { mainnet, polygon, base, bsc, avalanche, arbitrum, sepolia, polygonAmoy, hardhat } from "wagmi/chains";

export interface DeploymentNetwork {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: string;
  explorer: string;
  color: string;
}

// The mainnets issuers can deploy real, live tokens to from the Studio.
export const DEPLOYMENT_NETWORKS: DeploymentNetwork[] = [
  {
    id: mainnet.id,
    name: "Ethereum Mainnet",
    shortName: "Ethereum",
    nativeCurrency: "ETH",
    explorer: "https://etherscan.io",
    color: "#627EEA",
  },
  {
    id: polygon.id,
    name: "Polygon Mainnet",
    shortName: "Polygon",
    nativeCurrency: "POL",
    explorer: "https://polygonscan.com",
    color: "#8247E5",
  },
  {
    id: base.id,
    name: "Base Mainnet",
    shortName: "Base",
    nativeCurrency: "ETH",
    explorer: "https://basescan.org",
    color: "#0052FF",
  },
  {
    id: bsc.id,
    name: "BNB Chain",
    shortName: "BNB Chain",
    nativeCurrency: "BNB",
    explorer: "https://bscscan.com",
    color: "#F0B90B",
  },
  {
    id: arbitrum.id,
    name: "Arbitrum One",
    shortName: "Arbitrum",
    nativeCurrency: "ETH",
    explorer: "https://arbiscan.io",
    color: "#28A0F0",
  },
  {
    id: avalanche.id,
    name: "Avalanche Mainnet",
    shortName: "Avalanche",
    nativeCurrency: "AVAX",
    explorer: "https://snowtrace.io",
    color: "#E84142",
  },
];

// Chains investors can browse/filter the marketplace by. Sepolia is included
// because it's the only chain with real deployed assets today; the mainnets
// will populate once issuers actually deploy to them.
export const MARKETPLACE_NETWORKS: DeploymentNetwork[] = [
  {
    id: sepolia.id,
    name: "Sepolia Testnet",
    shortName: "Sepolia",
    nativeCurrency: "ETH",
    explorer: "https://sepolia.etherscan.io",
    color: "#71717a",
  },
  ...DEPLOYMENT_NETWORKS,
];

const EXPLORERS_BY_CHAIN: Record<number, string> = {
  [mainnet.id]: "https://etherscan.io",
  [polygon.id]: "https://polygonscan.com",
  [base.id]: "https://basescan.org",
  [bsc.id]: "https://bscscan.com",
  [arbitrum.id]: "https://arbiscan.io",
  [avalanche.id]: "https://snowtrace.io",
  [sepolia.id]: "https://sepolia.etherscan.io",
  [polygonAmoy.id]: "https://amoy.polygonscan.com",
  [hardhat.id]: "",
};

export function getExplorerTxUrl(chainId: number | undefined, hash: string): string {
  const base = (chainId && EXPLORERS_BY_CHAIN[chainId]) || EXPLORERS_BY_CHAIN[sepolia.id];
  return base ? `${base}/tx/${hash}` : "";
}

export function getChainName(chainId: number | undefined): string {
  const known = DEPLOYMENT_NETWORKS.find((n) => n.id === chainId);
  if (known) return known.name;
  if (chainId === sepolia.id) return "Sepolia Testnet";
  if (chainId === polygonAmoy.id) return "Polygon Amoy Testnet";
  if (chainId === hardhat.id) return "Local Hardhat";
  return "Unknown Network";
}
