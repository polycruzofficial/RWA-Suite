"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTreasuryNAV, useTreasuryBalance, useAddYieldProduct } from "@/hooks/useContracts";
import { formatEther } from "viem";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Vault,
  TrendingUp,
  Shield,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const reserveComposition = [
  { name: "USDC-Institutional", value: 45, color: "#0a0a0a" },
  { name: "Tokenized GBP", value: 35, color: "#404040" },
  { name: "UK Treasury Bills", value: 15, color: "#737373" },
  { name: "Liquidity Buffers", value: 5, color: "#a3a3a3" },
];

const yieldHistory = [
  { week: "W1", yield: 4.2 },
  { week: "W2", yield: 4.35 },
  { week: "W3", yield: 4.5 },
  { week: "W4", yield: 4.65 },
  { week: "W5", yield: 4.72 },
  { week: "W6", yield: 4.8 },
  { week: "W7", yield: 4.82 },
  { week: "W8", yield: 4.95 },
];

const yieldProducts = [
  { name: "POLYCRUZ Gilt Fund", apy: "4.82%", risk: "Low", settlement: "T+1", provider: "HM Treasury", deposited: "£2,100,000" },
  { name: "Prime Money Market", apy: "5.12%", risk: "Minimal", settlement: "Instant", provider: "BlackRock", deposited: "£1,500,000" },
  { name: "High-Yield Credit Pool", apy: "7.45%", risk: "Medium", settlement: "30-day", provider: "Alpha Management", deposited: "£820,000" },
];

export default function TreasuryPage() {
  const { address, isConnected } = useAccount();
  const { data: navValue } = useTreasuryNAV();
  const { data: balance } = useTreasuryBalance();
  const { addProduct, isPending: isAddingProduct, isSuccess: productAdded } = useAddYieldProduct();

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", apyBps: "", riskLevel: "low", provider: "", maturityDate: "" });
  const [viewPeriod, setViewPeriod] = useState<"weekly" | "monthly" | "quarterly" | "annual">("weekly");

  const formattedBalance = balance ? formatEther(balance as bigint) : "0";
  const formattedNAV = navValue ? formatEther(navValue as bigint) : "0";

  const handleAddProduct = () => {
    addProduct({
      name: productForm.name,
      apyBps: BigInt(Math.round(parseFloat(productForm.apyBps) * 100)),
      riskLevel: productForm.riskLevel,
      provider: productForm.provider,
      maturityDate: productForm.maturityDate
        ? BigInt(Math.floor(new Date(productForm.maturityDate).getTime() / 1000))
        : 0n,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-950">Treasury Console</h2>
          <p className="text-sm text-neutral-600">Manage reserves, yield products, and capital rebalancing</p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" /> Add Yield Product
        </button>
      </div>

      {/* Treasury Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ledger Balance</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950">£4,820,400</p>
            </div>
            <Vault className="h-8 w-8 text-neutral-950/50" />
          </div>
          <p className="mt-2 text-xs text-neutral-500">MPC Vault Custody • Biometric Auth</p>
        </div>
        <StatCard title="MTD Performance" value="+2.4%" change="On track" icon={TrendingUp} trend="up" />
        <StatCard title="Yield (Annualized)" value="4.95%" change="+0.13% vs last week" icon={DollarSign} trend="up" />
        <StatCard title="Vault Security" value="Active" change="MPC + Ledger" icon={Shield} trend="up" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Yield Chart */}
        <div className="col-span-2 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-950">Yield Performance</h3>
            <div className="flex gap-1">
              {(["weekly", "monthly", "quarterly", "annual"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setViewPeriod(p)}
                  className={`rounded-md px-3 py-1 text-xs capitalize transition-colors ${
                    viewPeriod === p
                      ? "bg-neutral-950/10 text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldHistory}>
                <defs>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" />
                <XAxis dataKey="week" stroke="#86868b" fontSize={12} />
                <YAxis stroke="#86868b" fontSize={12} domain={[4, 5.5]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e5ea", borderRadius: "8px", color: "#0a0a0a" }}
                  formatter={(value) => [`${value}%`, "APY"]}
                />
                <Area type="monotone" dataKey="yield" stroke="#0a0a0a" strokeWidth={2} fillOpacity={1} fill="url(#yieldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reserve Pie Chart */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-neutral-950">Reserve Composition</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reserveComposition} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {reserveComposition.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e5ea", borderRadius: "8px", color: "#0a0a0a" }}
                  formatter={(value) => [`${value}%`, "Allocation"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {reserveComposition.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-800">{item.name}</span>
                </div>
                <span className="text-neutral-600">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yield Products */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-950">Yield Products</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {yieldProducts.map((product, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900">{product.name}</h4>
                <StatusBadge status={product.risk} variant={product.risk === "Minimal" ? "success" : product.risk === "Low" ? "info" : "warning"} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-neutral-500">APY</p><p className="font-semibold text-emerald-700">{product.apy}</p></div>
                <div><p className="text-neutral-500">Settlement</p><p className="text-neutral-800">{product.settlement}</p></div>
                <div><p className="text-neutral-500">Provider</p><p className="text-neutral-800">{product.provider}</p></div>
                <div><p className="text-neutral-500">Deposited</p><p className="text-neutral-800">{product.deposited}</p></div>
              </div>
              <button className="w-full rounded-md bg-neutral-950/5 py-2 text-xs font-medium text-neutral-950 hover:bg-neutral-950/10">
                Manage Position
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* On-chain balance */}
      {isConnected && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-neutral-950">On-Chain Treasury</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-600">Vault Balance (Native)</p>
              <p className="text-lg font-bold text-neutral-950">{parseFloat(formattedBalance).toFixed(4)} ETH</p>
            </div>
            <div>
              <p className="text-neutral-600">NAV (USD)</p>
              <p className="text-lg font-bold text-neutral-950">${parseFloat(formattedNAV).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-950">Add Yield Product</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="APY %"
                  value={productForm.apyBps}
                  onChange={(e) => setProductForm({ ...productForm, apyBps: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
                />
                <select
                  value={productForm.riskLevel}
                  onChange={(e) => setProductForm({ ...productForm, riskLevel: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
                >
                  <option value="minimal">Minimal</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Provider"
                value={productForm.provider}
                onChange={(e) => setProductForm({ ...productForm, provider: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
              />
              <input
                type="date"
                value={productForm.maturityDate}
                onChange={(e) => setProductForm({ ...productForm, maturityDate: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
              />
            </div>
            {isAddingProduct && <p className="flex items-center gap-2 text-sm text-amber-700"><Loader2 className="h-4 w-4 animate-spin" />Submitting...</p>}
            {productAdded && <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Product added on-chain!</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddProduct(false)} className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100">Cancel</button>
              <button onClick={handleAddProduct} disabled={!productForm.name || isAddingProduct} className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50">
                {isAddingProduct ? "Adding..." : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
