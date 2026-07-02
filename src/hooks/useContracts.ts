"use client";

import { useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { getContractsForChain, ZERO_ADDRESS } from "@/config/contracts";
import RWATokenFactoryABI from "@/config/abis/RWATokenFactory.json";
import RWATokenABI from "@/config/abis/RWAToken.json";
import ComplianceRegistryABI from "@/config/abis/ComplianceRegistry.json";
import TreasuryVaultABI from "@/config/abis/TreasuryVault.json";
import YieldDistributorABI from "@/config/abis/YieldDistributor.json";
import PlatformFeeManagerABI from "@/config/abis/PlatformFeeManager.json";

// Resolves contract addresses for whichever chain the connected wallet is
// currently on, so every hook below follows the active network rather than
// a single hardcoded deployment.
export function useContractAddresses() {
  const chainId = useChainId();
  return getContractsForChain(chainId);
}

// ── Factory Hooks ──

export function useTokenCount() {
  const { factory } = useContractAddresses();
  return useReadContract({
    address: factory,
    abi: RWATokenFactoryABI,
    functionName: "getTokenCount",
  });
}

export function useIssuerTokens(issuer: Address | undefined) {
  const { factory } = useContractAddresses();
  return useReadContract({
    address: factory,
    abi: RWATokenFactoryABI,
    functionName: "getTokensByIssuer",
    args: issuer ? [issuer] : undefined,
    query: { enabled: !!issuer },
  });
}

export function useDeployToken() {
  const { factory } = useContractAddresses();
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
      address: factory,
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
  const { compliance } = useContractAddresses();
  return useReadContract({
    address: compliance,
    abi: ComplianceRegistryABI,
    functionName: "identities",
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });
}

export function useIsCompliant(account: Address | undefined) {
  const { compliance } = useContractAddresses();
  return useReadContract({
    address: compliance,
    abi: ComplianceRegistryABI,
    functionName: "isCompliant",
    args: account ? [account] : undefined,
    query: { enabled: !!account },
  });
}

export function useSetIdentity() {
  const { compliance } = useContractAddresses();
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
      address: compliance,
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
  const { compliance } = useContractAddresses();
  return useReadContract({
    address: compliance,
    abi: ComplianceRegistryABI,
    functionName: "getAuditEntries",
    args: [BigInt(offset), BigInt(limit)],
  });
}

// ── Treasury Hooks ──

export function useTreasuryNAV() {
  const { treasury } = useContractAddresses();
  return useReadContract({
    address: treasury,
    abi: TreasuryVaultABI,
    functionName: "totalTreasuryValueUSD",
  });
}

export function useTreasuryBalance() {
  const { treasury } = useContractAddresses();
  return useReadContract({
    address: treasury,
    abi: TreasuryVaultABI,
    functionName: "getNativeBalance",
  });
}

export function useYieldProductCount() {
  const { treasury } = useContractAddresses();
  return useReadContract({
    address: treasury,
    abi: TreasuryVaultABI,
    functionName: "getYieldProductCount",
  });
}

export function useAddYieldProduct() {
  const { treasury } = useContractAddresses();
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
      address: treasury,
      abi: TreasuryVaultABI,
      functionName: "addYieldProduct",
      args: [params.name, params.apyBps, params.riskLevel, params.provider, params.maturityDate],
    });
  };

  return { addProduct, hash, isPending, isConfirming, isSuccess, error };
}

// ── Yield Distributor Hooks ──

export function useYieldStrategies() {
  const { yield: yieldAddress } = useContractAddresses();
  return useReadContract({
    address: yieldAddress,
    abi: YieldDistributorABI,
    functionName: "getStrategyCount",
  });
}

export function useCreateStrategy() {
  const { yield: yieldAddress } = useContractAddresses();
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
      address: yieldAddress,
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

// ── Platform Fee Manager Hooks ──
// No-ops until a PlatformFeeManager is actually deployed on the connected
// chain (feeManager address is the zero address by default) — callers should
// check `isDeployed` before relying on the read values or invoking writes.

export function usePlatformFeeConfig() {
  const { feeManager } = useContractAddresses();
  const isDeployed = feeManager !== ZERO_ADDRESS;

  const deploymentFeeWei = useReadContract({
    address: feeManager,
    abi: PlatformFeeManagerABI,
    functionName: "deploymentFeeWei",
    query: { enabled: isDeployed },
  });

  const buyFeeBps = useReadContract({
    address: feeManager,
    abi: PlatformFeeManagerABI,
    functionName: "buyFeeBps",
    query: { enabled: isDeployed },
  });

  return { feeManager, isDeployed, deploymentFeeWei, buyFeeBps };
}

export function usePayDeploymentFee() {
  const { feeManager } = useContractAddresses();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const payDeploymentFee = (symbol: string, feeWei: bigint) => {
    writeContract({
      address: feeManager,
      abi: PlatformFeeManagerABI,
      functionName: "payDeploymentFee",
      args: [symbol],
      value: feeWei,
    });
  };

  return { payDeploymentFee, hash, isPending, isConfirming, isSuccess, error };
}

export function useCollectBuyFee() {
  const { feeManager } = useContractAddresses();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const collectBuyFee = (asset: Address, settleTo: Address, amountWei: bigint) => {
    writeContract({
      address: feeManager,
      abi: PlatformFeeManagerABI,
      functionName: "collectBuyFee",
      args: [asset, settleTo],
      value: amountWei,
    });
  };

  return { collectBuyFee, hash, isPending, isConfirming, isSuccess, error };
}

export { parseEther, formatEther };
