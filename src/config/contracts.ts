export const CONTRACT_ADDRESSES = {
  factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  compliance: (process.env.NEXT_PUBLIC_COMPLIANCE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  treasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  yield: (process.env.NEXT_PUBLIC_YIELD_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

// ABI exports - we import the compiled artifacts
export { default as RWATokenFactoryABI } from "./abis/RWATokenFactory.json";
export { default as RWATokenABI } from "./abis/RWAToken.json";
export { default as ComplianceRegistryABI } from "./abis/ComplianceRegistry.json";
export { default as TreasuryVaultABI } from "./abis/TreasuryVault.json";
export { default as YieldDistributorABI } from "./abis/YieldDistributor.json";
