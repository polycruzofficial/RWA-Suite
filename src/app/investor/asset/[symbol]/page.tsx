"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useChainId, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import { useIdentity, useTokenDetails, usePlatformFeeConfig, useCollectBuyFee } from "@/hooks/useContracts";
import { findAsset } from "@/lib/catalog/assets";
import { getAssetBySymbol, saveTransaction, type DBAsset } from "@/lib/supabase";
import { getContractsForChain, DEFAULT_CHAIN_ID } from "@/config/contracts";
import { getChainName, getExplorerTxUrl } from "@/config/chains";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Users,
  TrendingUp,
  Globe2,
  Calendar,
  Radio,
  RefreshCw,
  Coins,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const priceHistory = [
  { t: "Mon", p: 1.0 },
  { t: "Tue", p: 1.01 },
  { t: "Wed", p: 1.005 },
  { t: "Thu", p: 1.012 },
  { t: "Fri", p: 1.018 },
  { t: "Sat", p: 1.015 },
  { t: "Sun", p: 1.02 },
];

const riskVariant: Record<string, "success" | "info" | "warning" | "error"> = {
  Minimal: "success",
  Low: "info",
  Medium: "warning",
  High: "error",
};

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const symbol = (params?.symbol as string) || "";
  const asset = findAsset(symbol);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: identity } = useIdentity(address);
  const { sendTransaction, data: txHash, isPending, error } =
    useSendTransaction();
  const feeConfig = usePlatformFeeConfig();
  const {
    collectBuyFee,
    hash: feeBuyHash,
    isPending: isFeeBuyPending,
    isConfirming: isFeeBuyConfirming,
    error: feeBuyError,
  } = useCollectBuyFee();

  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [settlement, setSettlement] = useState("USDC");

  // Fall back to a real deployed asset (from Supabase / on-chain) when the
  // symbol isn't in the curated demo catalog.
  const [liveAsset, setLiveAsset] = useState<DBAsset | null>(null);
  const [liveLoading, setLiveLoading] = useState(!asset);
  const [orderLogged, setOrderLogged] = useState(false);

  useEffect(() => {
    if (asset || !symbol) {
      setLiveLoading(false);
      return;
    }
    setLiveLoading(true);
    getAssetBySymbol(symbol)
      .then(setLiveAsset)
      .catch(() => setLiveAsset(null))
      .finally(() => setLiveLoading(false));
  }, [asset, symbol]);

  const { totalSupply, holderCount } = useTokenDetails(
    liveAsset?.token_address as `0x${string}` | undefined
  );

  const identityStatus =
    identity && typeof identity === "object" && "status" in identity
      ? Number((identity as { status: unknown }).status)
      : 0;
  const kycApproved = identityStatus >= 2;

  const quote = useMemo(() => {
    if (!asset || !amount) return { tokens: 0, total: 0, fee: 0 };
    const total = parseFloat(amount) || 0;
    const fee = total * 0.0015; // 15 bps
    const tokens = total > 0 ? (total - fee) / asset.price : 0;
    return { tokens, total, fee };
  }, [amount, asset]);

  // The chain this specific asset's factory/treasury actually lives on — not
  // necessarily the wallet's currently connected chain. Falls back to the
  // default chain for rows saved before multi-chain support tracked chain_id.
  const requiredChainId = liveAsset?.chain_id ?? DEFAULT_CHAIN_ID;
  const targetTreasury = getContractsForChain(requiredChainId).treasury;
  const networkMatched = chainId === requiredChainId;

  // Route through PlatformFeeManager when it's deployed on this chain so the
  // platform's cut and the issuer's settlement happen atomically; otherwise
  // fall back to paying the treasury directly (today's default everywhere).
  const buyThroughFeeManager = feeConfig.isDeployed;
  const buyFeeBps = buyThroughFeeManager ? ((feeConfig.buyFeeBps.data as bigint | undefined) ?? 0n) : 0n;
  const buyHash = buyThroughFeeManager ? feeBuyHash : txHash;
  const buyIsPending = buyThroughFeeManager ? isFeeBuyPending : isPending;
  const buyIsConfirming = buyThroughFeeManager ? isFeeBuyConfirming : false;
  const buyError = buyThroughFeeManager ? feeBuyError : error;

  useEffect(() => {
    if (liveAsset && buyHash && !orderLogged) {
      setOrderLogged(true);
      saveTransaction({
        tx_hash: buyHash,
        event_type: "BUY_ORDER",
        token_address: liveAsset.token_address,
        from_address: address,
        to_address: targetTreasury,
        amount,
        metadata: { symbol: liveAsset.symbol, status: "pending_settlement", viaFeeManager: buyThroughFeeManager },
      }).catch(() => {});
    }
  }, [liveAsset, buyHash, orderLogged, address, amount, targetTreasury, buyThroughFeeManager]);

  if (!asset && liveLoading) {
    return (
      <div className="card flex items-center justify-center gap-2 p-10 text-center text-[13px] text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading asset…
      </div>
    );
  }

  if (!asset && !liveAsset) {
    return (
      <div className="card p-10 text-center">
        <p className="text-[14px] font-medium text-neutral-900">
          Asset not found
        </p>
        <p className="mt-1 text-[12px] text-neutral-500">
          "{symbol}" is not in the marketplace.
        </p>
        <Link href="/investor/marketplace" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
      </div>
    );
  }

  const handleTrade = () => {
    if (!isConnected || !kycApproved || !amount) return;
    try {
      sendTransaction({
        to: address as `0x${string}`,
        value: parseEther("0.0001"),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLiveBuy = () => {
    if (!isConnected || !kycApproved || !amount || !liveAsset) return;
    if (!networkMatched) {
      switchChain({ chainId: requiredChainId });
      return;
    }
    try {
      if (buyThroughFeeManager) {
        collectBuyFee(liveAsset.token_address as `0x${string}`, targetTreasury, parseEther(amount));
      } else {
        sendTransaction({ to: targetTreasury, value: parseEther(amount) });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Live on-chain asset (from Supabase, not in the curated demo catalog) ──
  if (liveAsset) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-600 hover:text-neutral-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
        </button>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              <span>{liveAsset.asset_type}</span>
              <span className="text-neutral-300">•</span>
              <span>{liveAsset.jurisdiction}</span>
            </div>
            <h1 className="display-xl mt-3 text-neutral-950">{liveAsset.name}</h1>
            <p className="mt-2 text-[15px] text-neutral-600">
              Issued by{" "}
              <span className="font-mono font-medium text-neutral-950">
                {liveAsset.issuer_address.slice(0, 6)}…{liveAsset.issuer_address.slice(-4)}
              </span>{" "}
              • Symbol{" "}
              <span className="font-mono font-medium text-neutral-950">
                {liveAsset.symbol}
              </span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StatusBadge status={liveAsset.risk_rating} variant={riskVariant[liveAsset.risk_rating] ?? "info"} />
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/70">
                <Radio className="h-3 w-3" /> Live on {getChainName(requiredChainId)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-right lg:min-w-[260px]">
            <p className="text-[11px] text-neutral-500">Total asset value</p>
            <p className="mt-1 text-[36px] font-semibold leading-none tracking-tight text-neutral-950">
              ${liveAsset.total_value_usd.toLocaleString()}
            </p>
            <p className="mt-3 text-[11px] text-neutral-500">
              {liveAsset.yield_bps > 0 ? `${(liveAsset.yield_bps / 100).toFixed(2)}% annual yield` : "No yield"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-[13px] font-semibold text-neutral-950">On-chain overview</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-700">
                {liveAsset.description || "No description provided by the issuer."}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Coins className="h-3 w-3" /> Total supply
                  </dt>
                  <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                    {totalSupply.data ? Number(totalSupply.data as bigint) / 1e18 : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Users className="h-3 w-3" /> Holders
                  </dt>
                  <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                    {holderCount.data !== undefined ? Number(holderCount.data as bigint) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Globe2 className="h-3 w-3" /> Jurisdiction
                  </dt>
                  <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                    {liveAsset.jurisdiction}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Calendar className="h-3 w-3" /> Maturity
                  </dt>
                  <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                    {liveAsset.maturity_date || "Perpetual"}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 font-mono text-[11px] text-neutral-400">
                Token contract: {liveAsset.token_address}
              </p>
            </div>
          </div>

          <div className="card-dark sticky top-24 h-fit p-6">
            <p className="text-[13px] font-semibold text-white">Buy {liveAsset.symbol}</p>
            <p className="mt-1 text-[11px] text-white/60">
              Payment settles on-chain to the issuer's treasury. Token transfer completes once the issuer confirms compliance-gated settlement.
            </p>

            <label className="mt-5 block text-[11px] text-white/60">Amount to pay</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-[20px] font-semibold text-white placeholder:text-white/30 focus:outline-none"
              />
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white">
                ETH
              </span>
            </div>

            {buyThroughFeeManager && buyFeeBps > 0n && amount && (
              <div className="mt-3 flex justify-between text-[11px] text-white/60">
                <span>Platform fee ({(Number(buyFeeBps) / 100).toFixed(2)}%)</span>
                <span className="font-medium text-white">
                  {((parseFloat(amount) * Number(buyFeeBps)) / 10_000).toFixed(6)} ETH
                </span>
              </div>
            )}

            {isConnected && !networkMatched && (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-[11px] text-amber-200 ring-1 ring-amber-500/30">
                <span>Switch to {getChainName(requiredChainId)} to buy this asset.</span>
                <button
                  onClick={() => switchChain({ chainId: requiredChainId })}
                  disabled={isSwitching}
                  className="flex shrink-0 items-center gap-1 rounded-md bg-white px-2.5 py-1 font-medium text-neutral-950 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isSwitching ? "animate-spin" : ""}`} />
                  Switch
                </button>
              </div>
            )}

            {!isConnected ? (
              <Link
                href="/get-started?role=investor"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-neutral-950 hover:bg-neutral-100"
              >
                Connect Wallet
              </Link>
            ) : !kycApproved ? (
              <Link
                href="/investor/kyc"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-neutral-950 hover:bg-neutral-100"
              >
                <ShieldCheck className="h-4 w-4" />
                Complete KYC to trade
              </Link>
            ) : (
              <button
                onClick={handleLiveBuy}
                disabled={!amount || buyIsPending || buyIsConfirming}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-neutral-950 hover:bg-neutral-100 disabled:opacity-50"
              >
                {buyIsPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing…
                  </>
                ) : buyIsConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                  </>
                ) : !networkMatched ? (
                  "Switch network to buy"
                ) : (
                  `Buy ${liveAsset.symbol}`
                )}
              </button>
            )}

            {buyHash && getExplorerTxUrl(chainId, buyHash) && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Order submitted •{" "}
                <a
                  href={getExplorerTxUrl(chainId, buyHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  View transaction
                </a>
              </p>
            )}
            {buyError && (
              <p className="mt-3 flex items-start gap-1.5 text-[11px] text-red-300">
                <AlertTriangle className="mt-0.5 h-3 w-3" />
                {buyError.message.slice(0, 160)}
              </p>
            )}

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-white/50">
              <ShieldCheck className="h-3 w-3" />
              Compliance enforced on-chain (ERC-3643)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Curated demo catalog asset ──
  const positive = asset!.priceChange24h >= 0;

  return (
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-600 hover:text-neutral-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            <span>{asset!.assetClass}</span>
            <span className="text-neutral-300">•</span>
            <span>{asset!.jurisdiction}</span>
          </div>
          <h1 className="display-xl mt-3 text-neutral-950">{asset!.name}</h1>
          <p className="mt-2 text-[15px] text-neutral-600">
            {asset!.issuer} • Symbol{" "}
            <span className="font-mono font-medium text-neutral-950">
              {asset!.symbol}
            </span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={asset!.risk} variant={riskVariant[asset!.risk]} />
            <StatusBadge status={`Rated ${asset!.rating}`} variant="info" />
            <StatusBadge status="On-chain compliant" variant="success" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-right lg:min-w-[260px]">
          <p className="text-[11px] text-neutral-500">Last price</p>
          <p className="mt-1 text-[36px] font-semibold leading-none tracking-tight text-neutral-950">
            ${asset!.price.toLocaleString()}
          </p>
          <div className="mt-3 flex justify-end">
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                positive
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-200/70"
                  : "bg-red-50 text-red-800 ring-red-200/70"
              }`}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {positive ? "+" : ""}
              {asset!.priceChange24h.toFixed(2)}% 24h
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart + details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-[13px] font-semibold text-neutral-950">
              Price (7d)
            </h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" />
                  <XAxis dataKey="t" stroke="#86868b" fontSize={11} />
                  <YAxis
                    stroke="#86868b"
                    fontSize={11}
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5ea",
                      borderRadius: "12px",
                      color: "#0a0a0a",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="p"
                    stroke="#0a0a0a"
                    strokeWidth={2}
                    fill="url(#priceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-[13px] font-semibold text-neutral-950">
              Asset overview
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-neutral-700">
              {asset!.description}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <TrendingUp className="h-3 w-3" /> APY
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset!.apy > 0 ? `${asset!.apy}%` : "—"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Users className="h-3 w-3" /> Holders
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset!.holders}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Globe2 className="h-3 w-3" /> Jurisdiction
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset!.jurisdiction}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Calendar className="h-3 w-3" /> Maturity
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset!.maturity === "Perpetual"
                    ? "Perpetual"
                    : asset!.maturity}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Trade widget */}
        <div className="card-dark sticky top-24 h-fit p-6">
          <div className="mb-5 flex rounded-full bg-white/10 p-1">
            <button
              onClick={() => setMode("buy")}
              className={`flex-1 rounded-full px-3 py-2 text-[12px] font-medium transition ${
                mode === "buy" ? "bg-white text-neutral-950" : "text-white/70"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setMode("sell")}
              className={`flex-1 rounded-full px-3 py-2 text-[12px] font-medium transition ${
                mode === "sell" ? "bg-white text-neutral-950" : "text-white/70"
              }`}
            >
              Sell
            </button>
          </div>

          <label className="text-[11px] text-white/60">
            {mode === "buy" ? "You pay" : "You receive"}
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-[20px] font-semibold text-white placeholder:text-white/30 focus:outline-none"
            />
            <select
              value={settlement}
              onChange={(e) => setSettlement(e.target.value)}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white focus:outline-none"
            >
              {asset!.settlements.map((s) => (
                <option key={s} value={s} className="text-neutral-950">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-white/60">
            <span>Minimum investment</span>
            <span>${asset!.minInvestment.toLocaleString()}</span>
          </div>

          <div className="mt-5 rounded-xl bg-white/5 p-4 text-[12px]">
            <div className="flex justify-between text-white/70">
              <span>You receive</span>
              <span className="font-medium text-white">
                {quote.tokens.toFixed(4)} {asset!.symbol}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-white/70">
              <span>Platform fee (0.15%)</span>
              <span className="font-medium text-white">
                ${quote.fee.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-white/70">
              <span>Settlement</span>
              <span className="font-medium text-white">Atomic • T+0</span>
            </div>
          </div>

          {/* Gate + CTA */}
          {!isConnected ? (
            <Link
              href="/get-started?role=investor"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-neutral-950 hover:bg-neutral-100"
            >
              Connect Wallet
            </Link>
          ) : !kycApproved ? (
            <Link
              href="/investor/kyc"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-neutral-950 hover:bg-neutral-100"
            >
              <ShieldCheck className="h-4 w-4" />
              Complete KYC to trade
            </Link>
          ) : (
            <button
              onClick={handleTrade}
              disabled={!amount || isPending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-neutral-950 hover:bg-neutral-100 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing…
                </>
              ) : (
                <>
                  {mode === "buy" ? "Buy" : "Sell"} {asset!.symbol}
                </>
              )}
            </button>
          )}

          {txHash && getExplorerTxUrl(chainId, txHash) && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Submitted •{" "}
              <a
                href={getExplorerTxUrl(chainId, txHash)}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                View transaction
              </a>
            </p>
          )}
          {error && (
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-red-300">
              <AlertTriangle className="mt-0.5 h-3 w-3" />
              {error.message.slice(0, 160)}
            </p>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-white/50">
            <ShieldCheck className="h-3 w-3" />
            Compliance enforced on-chain (ERC-3643)
          </div>
        </div>
      </div>
    </div>
  );
}
