"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreateStrategy, useYieldStrategies } from "@/hooks/useContracts";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import {
  TrendingUp,
  Layers,
  ArrowLeftRight,
  Lock,
  Plus,
  Loader2,
  CheckCircle2,
  Droplets,
} from "lucide-react";

const strategyTypes = [
  { id: 0, label: "Fixed Yield", desc: "Guaranteed returns with principal protection", icon: "🔒", color: "emerald" },
  { id: 1, label: "Long Yield", desc: "Extended maturity positions for higher returns", icon: "📈", color: "indigo" },
  { id: 2, label: "Yield Swap", desc: "Exchange fixed for floating yield exposure", icon: "🔄", color: "purple" },
  { id: 3, label: "Liquidity Provision", desc: "Earn fees by providing protocol liquidity", icon: "💧", color: "blue" },
];

const existingStrategies = [
  { name: "UK Gilt Fixed 4.82%", type: "Fixed Yield", token: "GILT26", apy: "4.82%", staked: "£1,200,000", status: "active", lockDuration: "90 days" },
  { name: "Prime Credit Long Position", type: "Long Yield", token: "CREDIT1", apy: "6.50%", staked: "£680,000", status: "active", lockDuration: "180 days" },
  { name: "Fixed-Float Swap", type: "Yield Swap", token: "GILT26", apy: "5.10%", staked: "£450,000", status: "active", lockDuration: "30 days" },
  { name: "GILT/USDC LP", type: "Liquidity Provision", token: "GILT26", apy: "3.20%", staked: "£320,000", status: "active", lockDuration: "None" },
];

const yieldTokens = [
  { name: "PT-GILT26-JUN24", type: "Principal Token", underlying: "GILT26", value: "£0.96", maturity: "2024-06-30" },
  { name: "YT-GILT26-JUN24", type: "Yield Token", underlying: "GILT26", value: "£0.04", maturity: "2024-06-30" },
  { name: "PT-CREDIT1-SEP24", type: "Principal Token", underlying: "CREDIT1", value: "£0.94", maturity: "2024-09-30" },
  { name: "YT-CREDIT1-SEP24", type: "Yield Token", underlying: "CREDIT1", value: "£0.06", maturity: "2024-09-30" },
];

export default function YieldPage() {
  const { address, isConnected } = useAccount();
  const { data: strategyCount } = useYieldStrategies();
  const { create, isPending, isSuccess } = useCreateStrategy();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    strategyType: 0,
    underlyingToken: "",
    apyBps: "",
    minStake: "",
    lockDuration: "",
  });

  const handleCreate = () => {
    create({
      name: createForm.name,
      strategyType: createForm.strategyType,
      underlyingToken: (createForm.underlyingToken || "0x0000000000000000000000000000000000000000") as `0x${string}`,
      apyBps: BigInt(Math.round(parseFloat(createForm.apyBps || "0") * 100)),
      minStake: BigInt(Math.round(parseFloat(createForm.minStake || "0") * 1e18)),
      lockDuration: BigInt(parseInt(createForm.lockDuration || "0") * 86400), // days to seconds
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-950">Yield Tokenization</h2>
          <p className="text-sm text-neutral-600">Principal/yield separation, fixed yield positions, swaps, and liquidity strategies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" /> Create Strategy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Staked" value="£2.65M" change="+12%" icon={Lock} trend="up" />
        <StatCard title="Avg APY" value="4.91%" change="+0.2%" icon={TrendingUp} trend="up" />
        <StatCard title="Active Strategies" value="4" change="All performing" icon={Layers} trend="up" />
        <StatCard title="Yield Tokens" value="4" change="2 pairs" icon={Droplets} trend="neutral" />
      </div>

      {/* Strategy Types */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {strategyTypes.map((st) => (
          <div key={st.id} className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-950/20 transition-colors">
            <span className="text-2xl">{st.icon}</span>
            <h4 className="mt-2 text-sm font-semibold text-neutral-900">{st.label}</h4>
            <p className="mt-1 text-xs text-neutral-500">{st.desc}</p>
          </div>
        ))}
      </div>

      {/* Active Strategies */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-950">Active Yield Strategies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Strategy</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Token</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">APY</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">Total Staked</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Lock</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {existingStrategies.map((s, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">{s.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.type} variant="info" /></td>
                  <td className="px-4 py-3 text-sm font-mono text-neutral-800">{s.token}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-700">{s.apy}</td>
                  <td className="px-4 py-3 text-right text-sm text-neutral-900">{s.staked}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{s.lockDuration}</td>
                  <td className="px-4 py-3"><StatusBadge status="Active" variant="success" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Principal/Yield Token Pairs */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-950">Principal & Yield Tokens</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {yieldTokens.map((yt, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900 font-mono">{yt.name}</p>
                <p className="text-xs text-neutral-500">{yt.type} • {yt.underlying}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-950">{yt.value}</p>
                <p className="text-xs text-neutral-500">Matures {yt.maturity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Strategy Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-950">Create Yield Strategy</h3>
            <input
              type="text"
              placeholder="Strategy Name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
            />
            <select
              value={createForm.strategyType}
              onChange={(e) => setCreateForm({ ...createForm, strategyType: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
            >
              {strategyTypes.map((st) => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Underlying Token Address (0x...)"
              value={createForm.underlyingToken}
              onChange={(e) => setCreateForm({ ...createForm, underlyingToken: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <input type="number" step="0.01" placeholder="APY %" value={createForm.apyBps} onChange={(e) => setCreateForm({ ...createForm, apyBps: e.target.value })} className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none" />
              <input type="number" placeholder="Min Stake (ETH)" value={createForm.minStake} onChange={(e) => setCreateForm({ ...createForm, minStake: e.target.value })} className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none" />
              <input type="number" placeholder="Lock (days)" value={createForm.lockDuration} onChange={(e) => setCreateForm({ ...createForm, lockDuration: e.target.value })} className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none" />
            </div>
            {isPending && <p className="flex items-center gap-2 text-sm text-amber-700"><Loader2 className="h-4 w-4 animate-spin" />Creating on-chain...</p>}
            {isSuccess && <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Strategy created!</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100">Cancel</button>
              <button onClick={handleCreate} disabled={!createForm.name || isPending} className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50">
                {isPending ? "Creating..." : "Create Strategy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
