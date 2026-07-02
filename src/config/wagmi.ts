"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, polygon, base, bsc, avalanche, sepolia, polygonAmoy, hardhat } from "wagmi/chains";

// Reown WalletConnect project ID — real institutional platform configuration.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "34fc8a5eafe142d51473e7e17e495d9c";

export const config = getDefaultConfig({
  appName: "POLYCRUZ — Institutional RWA Tokenization",
  projectId,
  chains: [mainnet, polygon, base, bsc, avalanche, sepolia, polygonAmoy, hardhat],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC || "https://eth.llamarpc.com"),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC || "https://polygon-rpc.com"),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org"),
    [bsc.id]: http(process.env.NEXT_PUBLIC_BNB_RPC || "https://bsc-dataseed.binance.org"),
    [avalanche.id]: http(process.env.NEXT_PUBLIC_AVALANCHE_RPC || "https://api.avax.network/ext/bc/C/rpc"),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc.sepolia.org"),
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
