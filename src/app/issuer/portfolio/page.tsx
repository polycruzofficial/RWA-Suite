"use client";

import { useAccount } from "wagmi";
import { useIssuerTokens, useTokenCount } from "@/hooks/useContracts";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Wallet,
  Coins,
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
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

const performanceData = [
  { month: "Sep", value: 3200000 },
  { month: "Oct", value: 3450000 },
  { month: "Nov", value: 3380000 },
  { month: "Dec", value: 3720000 },
  { month: "Jan", value: 4100000 },
  { month: "Feb", value: 4350000 },
  { month: "Mar", value: 4820000 },
];

const allocationData = [
  { name: "Bonds", value: 45, color: "#0a0a0a" },
  { name: "Credit", value: 25, color: "#404040" },
  { name: "Commodities", value: 15, color: "#737373" },
  { name: "Equity", value: 15, color: "#a3a3a3" },
];

const recentActivity = [
  { action: "Token Minted", asset: "UK Gilt Bond 2026", amount: "£1,200,000", time: "2 min ago", type: "MINT" as const },
  { action: "Investor Whitelisted", asset: "Prime Credit Pool", amount: "—", time: "15 min ago", type: "COMPLIANCE" as const },
  { action: "Dividend Declared", asset: "Equity Fund A", amount: "£24,500", time: "1 hr ago", type: "DIVIDEND" as const },
  { action: "Transfer", asset: "UK Gilt Bond 2026", amount: "£500,000", time: "3 hr ago", type: "TRANSFER" as const },
  { action: "KYC Approved", asset: "—", amount: "—", time: "5 hr ago", type: "COMPLIANCE" as const },
];

const typeColors: Record<string, "success" | "info" | "warning"> = {
  MINT: "success",
  COMPLIANCE: "info",
  DIVIDEND: "warning",
  TRANSFER: "info",
};

const chartTooltip = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5ea",
  borderRadius: "12px",
  boxShadow: "0 12px 32px -12px rgba(0,0,0,0.2)",
  color: "#0a0a0a",
};

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { data: tokenCount } = useTokenCount();
  const { data: _issuerTokens } = useIssuerTokens(address);

  const tokenCountNum = tokenCount ? Number(tokenCount) : 0;

  return (
    <div className="space-y-8">
      {!isConnected && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <p className="text-[13px] text-amber-900">
            Connect your wallet to view on-chain portfolio data and interact with smart contracts.
          </p>
        </div>
      )}

      <div>
        <h2 className="display-lg text-neutral-950">Welcome back.</h2>
        <p className="mt-1 text-[14px] text-neutral-600">
          Here's a live snapshot of your tokenized assets, on-chain holders, and treasury position.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total AUM" value="£4,820,400" change="+12.4%" icon={Wallet} trend="up" />
        <StatCard
          title="Active Tokens"
          value={tokenCountNum.toString()}
          change={tokenCountNum > 0 ? `${tokenCountNum} deployed` : "Deploy first token"}
          icon={Coins}
          trend={tokenCountNum > 0 ? "up" : "neutral"}
        />
        <StatCard title="Total Holders" value="142" change="+8 this week" icon={Users} trend="up" />
        <StatCard title="Avg Yield" value="5.12%" change="+0.3%" icon={TrendingUp} trend="up" />
      </div>

      {/* Compliance tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-neutral-500">Risk Score</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-emerald-700">A+</p>
            </div>
            <Shield className="h-7 w-7 text-neutral-300" />
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">FCA compliant • MiFID II ready</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-neutral-500">KYC Sync</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">100%</p>
            </div>
            <Users className="h-7 w-7 text-neutral-300" />
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">All investors verified • Real-time AML</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-neutral-500">Active Restrictions</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-amber-700">14</p>
            </div>
            <AlertTriangle className="h-7 w-7 text-neutral-300" />
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">Whitelist-only enforced on-chain</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-neutral-950">Portfolio Performance</h3>
              <p className="text-[12px] text-neutral-500">Last 7 months AUM trend</p>
            </div>
            <BarChart3 className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" />
                <XAxis dataKey="month" stroke="#86868b" fontSize={11} />
                <YAxis
                  stroke="#86868b"
                  fontSize={11}
                  tickFormatter={(v) => `£${(v / 1e6).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={chartTooltip}
                  formatter={(value) => [`£${(Number(value) / 1e6).toFixed(2)}M`, "AUM"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0a0a0a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-[13px] font-semibold text-neutral-950">Asset Allocation</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltip} formatter={(value) => [`${value}%`, "Allocation"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-800">{item.name}</span>
                </div>
                <span className="text-neutral-500">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-neutral-950">Recent Activity</h3>
          <button className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-950 hover:opacity-70">
            View All <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={item.type} variant={typeColors[item.type]} />
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">{item.action}</p>
                  <p className="text-[11px] text-neutral-500">{item.asset}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium text-neutral-900">{item.amount}</p>
                <p className="text-[11px] text-neutral-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
