export type AssetType = "bond" | "credit" | "commodity" | "equity";
export type RiskLevel = "minimal" | "low" | "medium" | "high";
export type KYCStatus = "none" | "pending" | "approved" | "rejected" | "expired";
export type InvestorType = "retail" | "professional" | "institutional";

export interface TokenizedAsset {
  id: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  assetType: AssetType;
  jurisdiction: string;
  ipfsDocHash: string;
  totalValueUSD: string;
  maturityDate: number;
  yieldBps: number;
  totalSupply: string;
  holderCount: number;
  isActive: boolean;
  deployedAt: number;
  issuer: string;
}

export interface InvestorIdentity {
  address: string;
  kycStatus: KYCStatus;
  investorType: InvestorType;
  jurisdiction: string;
  kycDocHash: string;
  verifiedAt: number;
  expiresAt: number;
  sanctioned: boolean;
  pep: boolean;
  riskScore: number;
}

export interface YieldProduct {
  id: number;
  name: string;
  apyBps: number;
  riskLevel: RiskLevel;
  provider: string;
  totalDeposited: string;
  maturityDate: number;
  active: boolean;
}

export interface Reserve {
  id: number;
  token: string;
  name: string;
  targetAllocationBps: number;
  active: boolean;
}

export interface YieldStrategy {
  id: number;
  name: string;
  strategyType: number; // 0: FixedYield, 1: LongYield, 2: YieldSwap, 3: LiquidityProvision
  underlyingToken: string;
  apyBps: number;
  totalStaked: string;
  totalYieldPaid: string;
  minStake: string;
  lockDuration: number;
  active: boolean;
}

export interface StakePosition {
  id: number;
  strategyId: number;
  staker: string;
  amount: string;
  stakedAt: number;
  lastClaimAt: number;
  totalClaimed: string;
  active: boolean;
}

export interface ComplianceRule {
  ruleId: string;
  description: string;
  active: boolean;
  jurisdiction: string;
  createdAt: number;
}

export interface AuditEntry {
  subject: string;
  action: string;
  performer: string;
  timestamp: number;
  details: string;
}

export interface TransactionEvent {
  id: string;
  type: "MINT" | "TRANSFER" | "BURN" | "DIVIDEND" | "COMPLIANCE" | "YIELD";
  from: string;
  to: string;
  amount: string;
  tokenAddress: string;
  tokenName: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface PortfolioMetrics {
  totalAUM: string;
  totalTokens: number;
  totalHolders: number;
  averageYield: number;
  complianceScore: string;
  activeRestrictions: number;
}

export interface CapTableEntry {
  address: string;
  tokenAddress: string;
  balance: string;
  percentage: number;
  investorType: InvestorType;
  jurisdiction: string;
}
