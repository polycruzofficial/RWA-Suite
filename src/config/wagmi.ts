"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, polygonAmoy, hardhat } from "wagmi/chains";

// Reown WalletConnect project ID — real institutional platform configuration.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "34fc8a5eafe142d51473e7e17e495d9c";

export const config = getDefaultConfig({
  appName: "EQUITEX — Institutional RWA Tokenization",
  projectId,
  chains: [sepolia, polygonAmoy, hardhat],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc.sepolia.org"),
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
