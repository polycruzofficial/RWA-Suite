"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { useIdentity } from "@/hooks/useContracts";
import { findAsset } from "@/lib/catalog/assets";
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
  const { data: identity } = useIdentity(address);
  const { sendTransaction, data: txHash, isPending, error } =
    useSendTransaction();

  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [settlement, setSettlement] = useState("USDC");

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

  if (!asset) {
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
    // Demo flow: settles a symbolic value to the wallet's own address to
    // exercise the wallet signing experience. In production this would route
    // through a settlement contract (e.g. Uniswap v4 hook or 0x).
    try {
      sendTransaction({
        to: address as `0x${string}`,
        value: parseEther("0.0001"),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const positive = asset.priceChange24h >= 0;

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
            <span>{asset.assetClass}</span>
            <span className="text-neutral-300">•</span>
            <span>{asset.jurisdiction}</span>
          </div>
          <h1 className="display-xl mt-3 text-neutral-950">{asset.name}</h1>
          <p className="mt-2 text-[15px] text-neutral-600">
            {asset.issuer} • Symbol{" "}
            <span className="font-mono font-medium text-neutral-950">
              {asset.symbol}
            </span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={asset.risk} variant={riskVariant[asset.risk]} />
            <StatusBadge status={`Rated ${asset.rating}`} variant="info" />
            <StatusBadge status="On-chain compliant" variant="success" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-right lg:min-w-[260px]">
          <p className="text-[11px] text-neutral-500">Last price</p>
          <p className="mt-1 text-[36px] font-semibold leading-none tracking-tight text-neutral-950">
            ${asset.price.toLocaleString()}
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
              {asset.priceChange24h.toFixed(2)}% 24h
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
              {asset.description}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <TrendingUp className="h-3 w-3" /> APY
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset.apy > 0 ? `${asset.apy}%` : "—"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Users className="h-3 w-3" /> Holders
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset.holders}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Globe2 className="h-3 w-3" /> Jurisdiction
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset.jurisdiction}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Calendar className="h-3 w-3" /> Maturity
                </dt>
                <dd className="mt-1 text-[18px] font-semibold text-neutral-950">
                  {asset.maturity === "Perpetual"
                    ? "Perpetual"
                    : asset.maturity}
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
              {asset.settlements.map((s) => (
                <option key={s} value={s} className="text-neutral-950">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-white/60">
            <span>Minimum investment</span>
            <span>${asset.minInvestment.toLocaleString()}</span>
          </div>

          <div className="mt-5 rounded-xl bg-white/5 p-4 text-[12px]">
            <div className="flex justify-between text-white/70">
              <span>You receive</span>
              <span className="font-medium text-white">
                {quote.tokens.toFixed(4)} {asset.symbol}
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
                  {mode === "buy" ? "Buy" : "Sell"} {asset.symbol}
                </>
              )}
            </button>
          )}

          {txHash && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Submitted •{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                View on Etherscan
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
