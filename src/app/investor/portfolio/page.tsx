"use client";

import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { useIdentity } from "@/hooks/useContracts";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { assets } from "@/lib/catalog/assets";
import {
  Wallet,
  TrendingUp,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Demo holdings (first 4 assets from the catalog)
const holdings = assets.slice(0, 4).map((a, i) => ({
  ...a,
  balance: [12500, 8000, 4200, 15600][i],
  cost: [1.0, 0.95, 1.08, 1.05][i],
}));

const equityCurve = [
  { m: "Oct", v: 92000 },
  { m: "Nov", v: 96500 },
  { m: "Dec", v: 101200 },
  { m: "Jan", v: 104700 },
  { m: "Feb", v: 110300 },
  { m: "Mar", v: 118400 },
  { m: "Apr", v: 124200 },
];

const allocation = holdings.map((h, i) => ({
  name: h.symbol,
  value: Math.round((h.balance * h.price) / 1000),
  color: ["#0a0a0a", "#404040", "#737373", "#a3a3a3"][i],
}));

const chartTooltip = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5ea",
  borderRadius: "12px",
  color: "#0a0a0a",
};

export default function InvestorPortfolioPage() {
  const { address, isConnected } = useAccount();
  const { data: identity } = useIdentity(address);
  const { data: ethBalance } = useBalance({ address });

  const totalValue = holdings.reduce((acc, h) => acc + h.balance * h.price, 0);
  const totalCost = holdings.reduce((acc, h) => acc + h.balance * h.cost, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = (pnl / totalCost) * 100;

  const identityStatus =
    identity && typeof identity === "object" && "status" in identity
      ? Number((identity as { status: unknown }).status)
      : 0;
  const kycApproved = identityStatus >= 2;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="display-lg text-neutral-950">Your portfolio.</h2>
          <p className="mt-1 text-[14px] text-neutral-600">
            On-chain holdings, yield, and performance across all tokenized
            assets.
          </p>
        </div>
        {isConnected && (
          <StatusBadge
            status={kycApproved ? "KYC Verified" : "KYC Pending"}
            variant={kycApproved ? "success" : "warning"}
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Portfolio Value"
          value={`$${totalValue.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}`}
          change={`${pnl >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`}
          icon={Wallet}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Unrealized P&L"
          value={`$${pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change="All time"
          icon={TrendingUp}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Holdings"
          value={holdings.length.toString()}
          change={`${new Set(holdings.map((h) => h.assetClass)).size} classes`}
          icon={Coins}
          trend="neutral"
        />
        <StatCard
          title="Wallet Balance"
          value={
            ethBalance
              ? `${parseFloat(ethBalance.formatted).toFixed(3)} ${ethBalance.symbol}`
              : "0.000 ETH"
          }
          change={isConnected ? "Connected" : "Not connected"}
          icon={PieChartIcon}
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-neutral-950">
                Equity curve
              </h3>
              <p className="text-[11px] text-neutral-500">
                Net asset value over the last 7 months
              </p>
            </div>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" />
                <XAxis dataKey="m" stroke="#86868b" fontSize={11} />
                <YAxis
                  stroke="#86868b"
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={chartTooltip}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, "NAV"]}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#0a0a0a"
                  strokeWidth={2}
                  fill="url(#eqGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-[13px] font-semibold text-neutral-950">
            Allocation
          </h3>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocation.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chartTooltip}
                  formatter={(v) => [`$${Number(v)}K`, "Value"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 text-[12px]">
            {allocation.map((a) => (
              <div key={a.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="font-mono text-neutral-800">{a.name}</span>
                </div>
                <span className="text-neutral-500">${a.value}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h3 className="text-[13px] font-semibold text-neutral-950">
            Your holdings
          </h3>
          <Link
            href="/investor/marketplace"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-950 hover:opacity-70"
          >
            Buy more <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Asset
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Balance
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Value
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                P&L
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                APY
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {holdings.map((h) => {
              const value = h.balance * h.price;
              const pnl = h.balance * (h.price - h.cost);
              const pnlPct = ((h.price - h.cost) / h.cost) * 100;
              const positive = pnl >= 0;
              return (
                <tr key={h.symbol} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 font-mono text-[10px] font-bold text-white">
                        {h.symbol.slice(0, 4)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-neutral-950">
                          {h.name}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {h.assetClass}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[13px] text-neutral-900">
                    {h.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-medium text-neutral-950">
                    ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 text-[12px] font-medium ${
                        positive ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {positive ? "+" : ""}
                      {pnlPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-medium text-emerald-700">
                    {h.apy > 0 ? `${h.apy}%` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/investor/asset/${h.symbol}`}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-950 hover:border-neutral-950"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card-dark flex items-center gap-4 p-6">
        <ShieldCheck className="h-6 w-6 text-white/80" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-white">
            Every holding is enforced on-chain
          </p>
          <p className="mt-1 text-[12px] text-white/70">
            Transfers pass the ERC-3643 compliance registry before execution.
            Your balances cannot be frozen without a regulatory action on the
            audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
