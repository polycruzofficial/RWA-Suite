"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useIdentity } from "@/hooks/useContracts";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  TrendingUp,
  Lock,
  Zap,
  ArrowRight,
  ShieldCheck,
  Coins,
  Repeat,
} from "lucide-react";

type Risk = "Minimal" | "Low" | "Medium" | "High";

interface Strategy {
  key: string;
  name: string;
  description: string;
  apy: number;
  tvl: number;
  lockup: string;
  risk: Risk;
  settlement: string;
  type: "Fixed" | "Variable" | "Liquid" | "Swap";
}

const strategies: Strategy[] = [
  {
    key: "gilt-fixed",
    name: "UK Gilt Fixed Yield",
    description:
      "Locked 4.82% APY backed by tokenized UK gilts. Quarterly coupon distribution to your wallet.",
    apy: 4.82,
    tvl: 2_100_000,
    lockup: "90 days",
    risk: "Minimal",
    settlement: "USDC",
    type: "Fixed",
  },
  {
    key: "prime-mm",
    name: "Prime Money Market",
    description:
      "Dynamic yield strategy backed by US Treasury bills and overnight repo. Liquid, no lockup.",
    apy: 5.12,
    tvl: 3_800_000,
    lockup: "Instant",
    risk: "Minimal",
    settlement: "USDC",
    type: "Liquid",
  },
  {
    key: "credit-pool",
    name: "High-Yield Credit Pool",
    description:
      "Senior secured direct lending exposure. Monthly distributions, 30-day redemption window.",
    apy: 7.45,
    tvl: 820_000,
    lockup: "30 days",
    risk: "Medium",
    settlement: "USDC",
    type: "Variable",
  },
  {
    key: "yield-swap",
    name: "Floating → Fixed Swap",
    description:
      "Lock in a fixed rate on any floating-yield RWA position. Offsets rate risk over 12 months.",
    apy: 4.4,
    tvl: 420_000,
    lockup: "12 months",
    risk: "Low",
    settlement: "USDC",
    type: "Swap",
  },
  {
    key: "real-estate",
    name: "London REIT Yield",
    description:
      "Quarterly rental distributions from tokenized Mayfair commercial property. 5.6% historical APY.",
    apy: 5.6,
    tvl: 1_850_000,
    lockup: "Quarterly",
    risk: "Low",
    settlement: "USDC",
    type: "Variable",
  },
  {
    key: "carbon-lp",
    name: "Carbon Credit LP",
    description:
      "Provide liquidity to the verified carbon credit pool. Earn fees plus retirement premium.",
    apy: 9.2,
    tvl: 340_000,
    lockup: "60 days",
    risk: "High",
    settlement: "USDC",
    type: "Liquid",
  },
];

const riskVariant: Record<Risk, "success" | "info" | "warning" | "error"> = {
  Minimal: "success",
  Low: "info",
  Medium: "warning",
  High: "error",
};

const typeIcon: Record<Strategy["type"], typeof Lock> = {
  Fixed: Lock,
  Variable: TrendingUp,
  Liquid: Zap,
  Swap: Repeat,
};

function formatUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function InvestorYieldPage() {
  const { address, isConnected } = useAccount();
  const { data: identity } = useIdentity(address);
  const [filter, setFilter] = useState<Strategy["type"] | "All">("All");

  const identityStatus =
    identity && typeof identity === "object" && "status" in identity
      ? Number((identity as { status: unknown }).status)
      : 0;
  const kycApproved = identityStatus >= 2;

  const filtered =
    filter === "All" ? strategies : strategies.filter((s) => s.type === filter);

  const tvlSum = strategies.reduce((a, s) => a + s.tvl, 0);
  const avgApy =
    strategies.reduce((a, s) => a + s.apy, 0) / strategies.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="display-lg text-neutral-950">Yield strategies.</h2>
        <p className="mt-1 text-[14px] text-neutral-600">
          Institutional-grade yield backed by real-world assets. Deposit in any
          supported stablecoin and start earning instantly.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Strategies Live"
          value={strategies.length.toString()}
          change={`${filtered.length} shown`}
          icon={TrendingUp}
          trend="neutral"
        />
        <StatCard
          title="Total TVL"
          value={formatUSD(tvlSum)}
          change="+$240K this week"
          icon={Coins}
          trend="up"
        />
        <StatCard
          title="Average APY"
          value={`${avgApy.toFixed(2)}%`}
          change="Net of fees"
          icon={Zap}
          trend="up"
        />
        <StatCard
          title="Active Positions"
          value="3"
          change="Earning now"
          icon={Lock}
          trend="up"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-neutral-200 pb-4">
        {(["All", "Fixed", "Variable", "Liquid", "Swap"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
              filter === f
                ? "bg-neutral-950 text-white"
                : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:text-neutral-950"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Strategy cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => {
          const Icon = typeIcon[s.type];
          return (
            <div
              key={s.key}
              className="card group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:border-neutral-900/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                      {s.type}
                    </p>
                    <h3 className="text-[15px] font-semibold text-neutral-950">
                      {s.name}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={s.risk} variant={riskVariant[s.risk]} />
              </div>

              <p className="mt-4 text-[12px] leading-relaxed text-neutral-600">
                {s.description}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-neutral-50 p-4 text-[11px]">
                <div>
                  <p className="text-neutral-500">APY</p>
                  <p className="mt-0.5 text-[16px] font-semibold text-emerald-700">
                    {s.apy}%
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">TVL</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-neutral-950">
                    {formatUSD(s.tvl)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Lockup</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-neutral-950">
                    {s.lockup}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  Settles in {s.settlement}
                </span>
                {!isConnected ? (
                  <Link
                    href="/get-started?role=investor"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-950"
                  >
                    Connect <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : !kycApproved ? (
                  <Link
                    href="/investor/kyc"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-950"
                  >
                    KYC required <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <button className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3.5 py-1.5 text-[11px] font-medium text-white hover:bg-neutral-800">
                    Deposit <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-dark flex items-center gap-4 p-6">
        <ShieldCheck className="h-6 w-6 text-white/80" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-white">
            Yield backed by real-world assets, not crypto-native leverage
          </p>
          <p className="mt-1 text-[12px] text-white/70">
            Every strategy is collateralized 1:1 by custodied underlying with
            daily attestations by independent auditors.
          </p>
        </div>
      </div>
    </div>
  );
}
