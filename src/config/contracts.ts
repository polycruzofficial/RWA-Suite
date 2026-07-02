import { mainnet, polygon, base, bsc, avalanche, sepolia, polygonAmoy, hardhat } from "wagmi/chains";

type Address = `0x${string}`;

export interface ChainContracts {
  factory: Address;
  compliance: Address;
  treasury: Address;
  yield: Address;
  feeManager: Address;
}

export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

function envAddress(key: string): Address {
  return (process.env[key] as Address | undefined) || ZERO_ADDRESS;
}

function chainContracts(suffix: string): ChainContracts {
  const withSuffix = (name: string) => (suffix ? `NEXT_PUBLIC_${name}_ADDRESS_${suffix}` : `NEXT_PUBLIC_${name}_ADDRESS`);
  return {
    factory: envAddress(withSuffix("FACTORY")),
    compliance: envAddress(withSuffix("COMPLIANCE")),
    treasury: envAddress(withSuffix("TREASURY")),
    yield: envAddress(withSuffix("YIELD")),
    feeManager: envAddress(withSuffix("FEE_MANAGER")),
  };
}

// Deployed contract addresses, keyed by chain. Mainnets default to the zero
// address until the contracts are actually deployed there and the matching
// NEXT_PUBLIC_*_ADDRESS_<CHAIN> env vars are set.
export const CONTRACTS_BY_CHAIN: Record<number, ChainContracts> = {
  [mainnet.id]: chainContracts("ETHEREUM"),
  [polygon.id]: chainContracts("POLYGON"),
  [base.id]: chainContracts("BASE"),
  [bsc.id]: chainContracts("BNB"),
  [avalanche.id]: chainContracts("AVALANCHE"),
  [sepolia.id]: chainContracts(""), // currently-deployed testnet uses the unsuffixed env vars
  [polygonAmoy.id]: chainContracts("AMOY"),
  [hardhat.id]: chainContracts("LOCAL"),
};

export const DEFAULT_CHAIN_ID = sepolia.id;

export function getContractsForChain(chainId: number | undefined): ChainContracts {
  if (chainId && CONTRACTS_BY_CHAIN[chainId]) return CONTRACTS_BY_CHAIN[chainId];
  return CONTRACTS_BY_CHAIN[DEFAULT_CHAIN_ID];
}

export function isChainDeployed(chainId: number | undefined): boolean {
  return getContractsForChain(chainId).factory !== ZERO_ADDRESS;
}

export function isFeeManagerDeployed(chainId: number | undefined): boolean {
  return getContractsForChain(chainId).feeManager !== ZERO_ADDRESS;
}

// Backward-compatible single-chain export (defaults to Sepolia, the only
// chain with contracts deployed today). Prefer getContractsForChain(chainId)
// in new code so behavior follows the connected wallet's chain.
export const CONTRACT_ADDRESSES = CONTRACTS_BY_CHAIN[DEFAULT_CHAIN_ID];

// ABI exports - we import the compiled artifacts
export { default as RWATokenFactoryABI } from "./abis/RWATokenFactory.json";
export { default as RWATokenABI } from "./abis/RWAToken.json";
export { default as ComplianceRegistryABI } from "./abis/ComplianceRegistry.json";
export { default as TreasuryVaultABI } from "./abis/TreasuryVault.json";
export { default as YieldDistributorABI } from "./abis/YieldDistributor.json";
export { default as PlatformFeeManagerABI } from "./abis/PlatformFeeManager.json";
