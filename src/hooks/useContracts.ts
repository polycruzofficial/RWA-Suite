"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import RWATokenFactoryABI from "@/config/abis/RWATokenFactory.json";
import RWATokenABI from "@/config/abis/RWAToken.json";
import ComplianceRegistryABI from "@/config/abis/ComplianceRegistry.json";
import TreasuryVaultABI from "@/config/abis/TreasuryVault.json";
import YieldDistributorABI from "@/config/abis/YieldDistributor.json";

// ── Factory Hooks ──

export function useTokenCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.factory,
    abi: RWATokenFactoryABI,
    functionName: "getTokenCount",
  });
}

export function useIssuerTokens(issuer: Address | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.factory,
    abi: RWATokenFactoryABI,
    functionName: "getTokensByIssuer",
    args: issuer ? [issuer] : undefined,
    query: { enabled: !!issuer },
  });
}

export function useDeployToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deploy = (params: {
    name: string;
    symbol: string;
    assetType: string;
    jurisdiction: string;
    ipfsDocHash: string;
    totalValueUSD: bigint;
    maturityDate: bigint;
    yieldBps: bigint;
    initialSupply: bigint;
  }) => {
    writeContract({
      address: CONTRACT_ADDRESSES.factory,
      abi: RWATokenFactoryABI,
      functionName: "deployToken",
      args: [
        params.name,
        params.symbol,
        params.assetType,
        params.jurisdiction,
        params.ipfsDocHash,
        params.totalValueUSD,
        params.maturityDate,
        params.yieldBps,
        params.initialSupply,
      ],
    });
  };

  return { deploy, hash, isPending, isConfirming, isSuccess, error };
}

// ── RWA Token Hooks ──

export function useTokenDetails(tokenAddress: Address | undefined) {
  const assetDetails = useReadContract({
    address: tokenAddress,
    abi: RWATokenABI,
    functionName: "assetDetails",
    query: { enabled: !!tokenAddress },
  });

  const totalSupply = useReadContract({
    address: tokenAddress,
    abi: RWATokenABI,
    functionName: "totalSupply",
    query: { enabled: !!tokenAddress },
  });

  const holderCount = useReadContract({
    address: tokenAddress,
    abi: RWATokenABI,
    functionName: "holderCount",
    query: { enabled: !!tokenAddress },
  });

  return { assetDetails, totalSupply, holderCount };
}

export function useSetWhitelist() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setWhitelist = (tokenAddress: Address, account: Address, status: boolean) => {
    writeContract({
      address: tokenAddress,
      abi: RWATokenABI,
      functionName: "setWhitelist",
      args: [account, status],
    });
  };

  return { setWhitelist, hash, isPending, isConfirming, isSuccess, error };
}

export function useMintTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = (tokenAddress: Address, to: Address, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: RWATokenABI,
      functionName: "mint",
      args: [to, amount],
    });
  };

  return { mint, hash, isPending, isConfirming, isSuccess, error };
}

export function useDeclareDividend() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const declare = (tokenAddress: Address, claimDeadline: bigint, value: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: RWATokenABI,
      functionName: "declareDividend",
      args: [claimDeadline],
      value,
    });
  };

  return { declare, hash, isPending, isConfirming, isSuccess, error };
}

// ── Compliance Hooks ──

export function useIdentity(account: Address | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.compliance,
    abi: ComplianceRegistryABI,
    functionName: "identities",
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });
}

export function useIsCompliant(account: Address | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.compliance,
    abi: ComplianceRegistryABI,
    functionName: "isCompliant",
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });
}

export function useSetIdentity() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setIdentity = (params: {
    account: Address;
    status: number;
    investorType: number;
    jurisdiction: string;
    kycDocHash: string;
    expiresAt: bigint;
    pep: boolean;
    riskScore: bigint;
  }) => {
    writeContract({
      address: CONTRACT_ADDRESSES.compliance,
      abi: ComplianceRegistryABI,
      functionName: "setIdentity",
      args: [
        params.account,
        params.status,
        params.investorType,
        params.jurisdiction,
        params.kycDocHash,
        params.expiresAt,
        params.pep,
        params.riskScore,
      ],
    });
  };

  return { setIdentity, hash, isPending, isConfirming, isSuccess, error };
}

export function useAuditLog(offset: number, limit: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.compliance,
    abi: ComplianceRegistryABI,
    functionName: "getAuditEntries",
    args: [BigInt(offset), BigInt(limit)],
  });
}

// ── Treasury Hooks ──

export function useTreasuryNAV() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.treasury,
    abi: TreasuryVaultABI,
    functionName: "totalTreasuryValueUSD",
  });
}

export function useTreasuryBalance() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.treasury,
    abi: TreasuryVaultABI,
    functionName: "getNativeBalance",
  });
}

export function useYieldProductCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.treasury,
    abi: TreasuryVaultABI,
    functionName: "getYieldProductCount",
  });
}

export function useAddYieldProduct() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addProduct = (params: {
    name: string;
    apyBps: bigint;
    riskLevel: string;
    provider: string;
    maturityDate: bigint;
  }) => {
    writeContract({
      address: CONTRACT_ADDRESSES.treasury,
      abi: TreasuryVaultABI,
      functionName: "addYieldProduct",
      args: [params.name, params.apyBps, params.riskLevel, params.provider, params.maturityDate],
    });
  };

  return { addProduct, hash, isPending, isConfirming, isSuccess, error };
}

// ── Yield Distributor Hooks ──

export function useYieldStrategies() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.yield,
    abi: YieldDistributorABI,
    functionName: "getStrategyCount",
  });
}

export function useCreateStrategy() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (params: {
    name: string;
    strategyType: number;
    underlyingToken: Address;
    apyBps: bigint;
    minStake: bigint;
    lockDuration: bigint;
  }) => {
    writeContract({
      address: CONTRACT_ADDRESSES.yield,
      abi: YieldDistributorABI,
      functionName: "createStrategy",
      args: [
        params.name,
        params.strategyType,
        params.underlyingToken,
        params.apyBps,
        params.minStake,
        params.lockDuration,
      ],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error };
}

export { parseEther, formatEther };
