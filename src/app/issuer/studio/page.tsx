"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { useDeployToken, useIssuerTokens } from "@/hooks/useContracts";
import { uploadJSONToIPFS } from "@/lib/ipfs";
import { saveAsset } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Coins,
  FileText,
  Globe,
  DollarSign,
  Calendar,
  Percent,
  Hash,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Building2,
} from "lucide-react";

type AssetType = "bond" | "credit" | "commodity" | "equity";

interface TokenForm {
  name: string;
  symbol: string;
  assetType: AssetType;
  jurisdiction: string;
  description: string;
  legalEntity: string;
  totalValueUSD: string;
  maturityDate: string;
  yieldBps: string;
  initialSupply: string;
  riskRating: string;
}

const assetTypeInfo: Record<AssetType, { label: string; desc: string; icon: string }> = {
  bond: { label: "Bond", desc: "Fixed-income securities, gilts, treasury bills", icon: "📊" },
  credit: { label: "Credit", desc: "Credit instruments, loan pools, receivables", icon: "💳" },
  commodity: { label: "Commodity", desc: "Precious metals, energy, agricultural products", icon: "🏗️" },
  equity: { label: "Equity", desc: "Private shares, fund interests, LP tokens", icon: "📈" },
};

const defaultForm: TokenForm = {
  name: "",
  symbol: "",
  assetType: "bond",
  jurisdiction: "GB",
  description: "",
  legalEntity: "",
  totalValueUSD: "",
  maturityDate: "",
  yieldBps: "",
  initialSupply: "",
  riskRating: "low",
};

export default function StudioPage() {
  const { address, isConnected } = useAccount();
  const { deploy, hash, isPending, isConfirming, isSuccess, error } = useDeployToken();
  const { data: issuerTokens, refetch } = useIssuerTokens(address);

  const [form, setForm] = useState<TokenForm>(defaultForm);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const updateField = (field: keyof TokenForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeploy = async () => {
    if (!address) return;

    try {
      setIsUploading(true);

      // Upload metadata to IPFS
      let ipfsHash = "";
      try {
        ipfsHash = await uploadJSONToIPFS(
          {
            name: form.name,
            symbol: form.symbol,
            assetType: form.assetType,
            jurisdiction: form.jurisdiction,
            description: form.description,
            legalEntity: form.legalEntity,
            totalValueUSD: form.totalValueUSD,
            riskRating: form.riskRating,
            createdAt: new Date().toISOString(),
          },
          `${form.symbol}-metadata`
        );
      } catch {
        // If IPFS fails, continue with empty hash (user can configure Pinata later)
        console.warn("IPFS upload skipped - configure Pinata credentials");
        ipfsHash = "placeholder-configure-pinata";
      }

      setIsUploading(false);

      // Calculate maturity as unix timestamp
      const maturityTimestamp = form.maturityDate
        ? BigInt(Math.floor(new Date(form.maturityDate).getTime() / 1000))
        : 0n;

      // Deploy on-chain
      deploy({
        name: form.name,
        symbol: form.symbol,
        assetType: form.assetType,
        jurisdiction: form.jurisdiction,
        ipfsDocHash: ipfsHash,
        totalValueUSD: parseEther(form.totalValueUSD || "0"),
        maturityDate: maturityTimestamp,
        yieldBps: BigInt(Math.round(parseFloat(form.yieldBps || "0") * 100)),
        initialSupply: parseUnits(form.initialSupply || "0", 18),
      });

      // Save to Supabase (off-chain metadata)
      try {
        await saveAsset({
          token_address: "pending-" + Date.now(),
          issuer_address: address,
          name: form.name,
          symbol: form.symbol,
          asset_type: form.assetType,
          jurisdiction: form.jurisdiction,
          description: form.description,
          legal_entity: form.legalEntity,
          ipfs_doc_hash: ipfsHash,
          total_value_usd: parseFloat(form.totalValueUSD || "0"),
          maturity_date: form.maturityDate || null,
          yield_bps: Math.round(parseFloat(form.yieldBps || "0") * 100),
          risk_rating: form.riskRating,
        });
      } catch {
        console.warn("Supabase save skipped - configure Supabase credentials");
      }
    } catch (err) {
      setIsUploading(false);
      console.error("Deploy error:", err);
    }
  };

  const canProceedStep1 = form.name && form.symbol && form.assetType;
  const canProceedStep2 = form.totalValueUSD && form.initialSupply;
  const canDeploy = canProceedStep1 && canProceedStep2 && isConnected;

  // Existing tokens list
  const existingTokens = (issuerTokens as Array<{
    name: string;
    symbol: string;
    assetType: string;
    tokenAddress: string;
    active: boolean;
    deployedAt: bigint;
  }>) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-950">Tokenization Studio</h2>
          <p className="text-sm text-neutral-600">Create and deploy regulated security tokens backed by real world assets</p>
        </div>
        {isConnected && (
          <StatusBadge status={`${existingTokens.length} tokens deployed`} variant="info" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tokenization Form */}
        <div className="col-span-2 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  step === s
                    ? "bg-neutral-950/10 text-neutral-950 border border-neutral-950/20"
                    : step > s
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-white text-neutral-500"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : <span>{s}</span>}
                {s === 1 && "Asset Details"}
                {s === 2 && "Token Config"}
                {s === 3 && "Deploy"}
              </button>
            ))}
          </div>

          {/* Step 1: Asset Details */}
          {step === 1 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">
              <h3 className="text-base font-semibold text-neutral-950">Asset Information</h3>

              {/* Asset Type Selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">Asset Class</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(assetTypeInfo) as AssetType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateField("assetType", type)}
                      className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                        form.assetType === type
                          ? "border-neutral-950 bg-neutral-950/5"
                          : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      <span className="text-2xl">{assetTypeInfo[type].icon}</span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{assetTypeInfo[type].label}</p>
                        <p className="text-xs text-neutral-500">{assetTypeInfo[type].desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Symbol */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Token Name</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="UK Gilt Bond 2026"
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Symbol</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={form.symbol}
                      onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
                      placeholder="GILT26"
                      maxLength={10}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    />
                  </div>
                </div>
              </div>

              {/* Jurisdiction & Legal Entity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Jurisdiction</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <select
                      value={form.jurisdiction}
                      onChange={(e) => updateField("jurisdiction", e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    >
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="EU">European Union</option>
                      <option value="SG">Singapore</option>
                      <option value="CH">Switzerland</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Legal Entity</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={form.legalEntity}
                      onChange={(e) => updateField("legalEntity", e.target.value)}
                      placeholder="Equitex Capital Ltd"
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Tokenized UK government gilt bond with 4.82% coupon, maturing 2026..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="flex items-center gap-2 rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Token Configuration */}
          {step === 2 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">
              <h3 className="text-base font-semibold text-neutral-950">Token Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Total Asset Value (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      value={form.totalValueUSD}
                      onChange={(e) => updateField("totalValueUSD", e.target.value)}
                      placeholder="1000000"
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Initial Token Supply</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      value={form.initialSupply}
                      onChange={(e) => updateField("initialSupply", e.target.value)}
                      placeholder="1000000"
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Annual Yield (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={form.yieldBps}
                      onChange={(e) => updateField("yieldBps", e.target.value)}
                      placeholder="4.82"
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">Maturity Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="date"
                      value={form.maturityDate}
                      onChange={(e) => updateField("maturityDate", e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Risk Rating</label>
                <div className="flex gap-3">
                  {["minimal", "low", "medium", "high"].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateField("riskRating", r)}
                      className={`rounded-lg border px-4 py-2 text-sm capitalize transition-colors ${
                        form.riskRating === r
                          ? "border-neutral-950 bg-neutral-950/5 text-neutral-950"
                          : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex items-center gap-2 rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review & Deploy <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Deploy */}
          {step === 3 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">
              <h3 className="text-base font-semibold text-neutral-950">Review & Deploy</h3>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <p className="text-neutral-600">Token Name</p>
                  <p className="text-neutral-950 font-medium">{form.name || "—"}</p>
                  <p className="text-neutral-600">Symbol</p>
                  <p className="text-neutral-950 font-medium">{form.symbol || "—"}</p>
                  <p className="text-neutral-600">Asset Class</p>
                  <p className="text-neutral-950 font-medium capitalize">{form.assetType}</p>
                  <p className="text-neutral-600">Jurisdiction</p>
                  <p className="text-neutral-950 font-medium">{form.jurisdiction}</p>
                  <p className="text-neutral-600">Total Value</p>
                  <p className="text-neutral-950 font-medium">${Number(form.totalValueUSD || 0).toLocaleString()}</p>
                  <p className="text-neutral-600">Initial Supply</p>
                  <p className="text-neutral-950 font-medium">{Number(form.initialSupply || 0).toLocaleString()} tokens</p>
                  <p className="text-neutral-600">Annual Yield</p>
                  <p className="text-neutral-950 font-medium">{form.yieldBps || "0"}%</p>
                  <p className="text-neutral-600">Maturity</p>
                  <p className="text-neutral-950 font-medium">{form.maturityDate || "No maturity"}</p>
                  <p className="text-neutral-600">Risk Rating</p>
                  <p className="text-neutral-950 font-medium capitalize">{form.riskRating}</p>
                </div>
              </div>

              {/* Deploy Info */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
                  <div className="text-xs text-amber-900/80 space-y-1">
                    <p>Deploying will create an ERC-20 security token with compliance controls on-chain.</p>
                    <p>The token will be whitelist-only by default. You will be the initial issuer and admin.</p>
                    <p>Metadata will be pinned to IPFS and stored in Supabase.</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              {isPending && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Loader2 className="h-4 w-4 animate-spin" /> Waiting for wallet confirmation...
                </div>
              )}
              {isConfirming && (
                <div className="flex items-center gap-2 text-sm text-neutral-950">
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirming transaction on-chain...
                </div>
              )}
              {isSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Token deployed successfully!
                  {hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4" /> {error.message.slice(0, 120)}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  Back
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={!canDeploy || isPending || isConfirming || isUploading}
                  className="flex items-center gap-2 rounded-lg bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading to IPFS...</>
                  ) : isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Deploying...</>
                  ) : (
                    <><Coins className="h-4 w-4" /> Deploy Token</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Deployed Tokens */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-neutral-950">Deployed Tokens</h3>
            {existingTokens.length === 0 ? (
              <p className="text-sm text-neutral-500">No tokens deployed yet. Use the form to create your first RWA token.</p>
            ) : (
              <div className="space-y-3">
                {existingTokens.map((token, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{token.name}</p>
                        <p className="text-xs text-neutral-500">{token.symbol} • {token.assetType}</p>
                      </div>
                      <StatusBadge
                        status={token.active ? "Active" : "Inactive"}
                        variant={token.active ? "success" : "neutral"}
                      />
                    </div>
                    <p className="mt-2 text-xs text-neutral-400 font-mono truncate">{token.tokenAddress}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-neutral-950">Token Features</h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <p>✓ ERC-20 with compliance controls</p>
              <p>✓ Whitelist-only transfers</p>
              <p>✓ Lockup period enforcement</p>
              <p>✓ Max holder limits</p>
              <p>✓ Dividend distribution</p>
              <p>✓ Forced transfer (regulatory)</p>
              <p>✓ Pause/unpause</p>
              <p>✓ IPFS document storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
