"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { useMintTokens, useContractAddresses } from "@/hooks/useContracts";
import { getAssetsByIssuer, saveTransaction, type DBAsset } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import {
  Waves,
  ArrowLeftRight,
  Users,
  TrendingUp,
  Lock,
  Unlock,
  DollarSign,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
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

const liquidityData = [
  { day: "Mon", volume: 320000 },
  { day: "Tue", volume: 450000 },
  { day: "Wed", volume: 280000 },
  { day: "Thu", volume: 520000 },
  { day: "Fri", volume: 680000 },
  { day: "Sat", volume: 150000 },
  { day: "Sun", volume: 90000 },
];

const liquidityPools = [
  { pair: "GILT26 / USDC", tvl: "£2,400,000", apr: "3.2%", volume24h: "£180,000", status: "active" },
  { pair: "CREDIT1 / GBP", tvl: "£1,100,000", apr: "4.8%", volume24h: "£95,000", status: "active" },
  { pair: "EQFA / ETH", tvl: "£680,000", apr: "6.1%", volume24h: "£42,000", status: "active" },
  { pair: "CMDY01 / USDC", tvl: "£340,000", apr: "2.9%", volume24h: "£18,000", status: "paused" },
];

const p2pOrders = [
  { type: "buy", token: "GILT26", amount: "10,000", price: "£1.02", trader: "0x5678...efgh", time: "5 min ago" },
  { type: "sell", token: "CREDIT1", amount: "5,000", price: "£0.98", trader: "0x9abc...ijkl", time: "12 min ago" },
  { type: "buy", token: "EQFA", amount: "25,000", price: "£1.15", trader: "0xdef0...mnop", time: "30 min ago" },
];

const collateralPositions = [
  { asset: "GILT26", locked: "50,000 tokens", collateralRatio: "150%", borrowCapacity: "£34,000", status: "healthy" },
  { asset: "CREDIT1", locked: "20,000 tokens", collateralRatio: "135%", borrowCapacity: "£14,500", status: "healthy" },
  { asset: "EQFA", locked: "10,000 tokens", collateralRatio: "110%", borrowCapacity: "£11,200", status: "warning" },
];

export default function LiquidityPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"pools" | "p2p" | "lending">("pools");

  const [myAssets, setMyAssets] = useState<DBAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setMyAssets([]);
      return;
    }
    setAssetsLoading(true);
    getAssetsByIssuer(address)
      .then(setMyAssets)
      .catch(() => setMyAssets([]))
      .finally(() => setAssetsLoading(false));
  }, [address]);

  const { mint, hash, isPending, isConfirming, isSuccess, error: mintError } = useMintTokens();
  const { treasury: treasuryAddress } = useContractAddresses();

  const [activePool, setActivePool] = useState<(typeof liquidityPools)[number] | null>(null);
  const [liquidityForm, setLiquidityForm] = useState({ tokenAddress: "", amount: "" });
  const [logged, setLogged] = useState(false);

  const openAddLiquidity = (pool: (typeof liquidityPools)[number]) => {
    const symbol = pool.pair.split("/")[0].trim();
    const matched = myAssets.find((a) => a.symbol === symbol);
    setLiquidityForm({ tokenAddress: matched?.token_address ?? myAssets[0]?.token_address ?? "", amount: "" });
    setLogged(false);
    setActivePool(pool);
  };

  const closeAddLiquidity = () => {
    setActivePool(null);
    setLiquidityForm({ tokenAddress: "", amount: "" });
  };

  const handleAddLiquidity = () => {
    if (!liquidityForm.tokenAddress || !liquidityForm.amount || !address) return;
    mint(
      liquidityForm.tokenAddress as `0x${string}`,
      treasuryAddress,
      parseEther(liquidityForm.amount)
    );
  };

  useEffect(() => {
    if (isSuccess && hash && !logged) {
      setLogged(true);
      saveTransaction({
        tx_hash: hash,
        event_type: "LIQUIDITY_ADD",
        token_address: liquidityForm.tokenAddress,
        from_address: address,
        to_address: treasuryAddress,
        amount: liquidityForm.amount,
        metadata: { pair: activePool?.pair },
      }).catch(() => {});
    }
  }, [isSuccess, hash, logged, liquidityForm, address, activePool]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-950">Liquidity Hub</h2>
        <p className="text-sm text-neutral-600">Secondary market access, P2P transfers, and collateral-based lending</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Liquidity" value="£4.52M" change="+8.3%" icon={Waves} trend="up" />
        <StatCard title="24h Volume" value="£335K" change="+15.2%" icon={ArrowLeftRight} trend="up" />
        <StatCard title="Active Pools" value="4" change="3 active, 1 paused" icon={TrendingUp} trend="neutral" />
        <StatCard title="Collateral Locked" value="£59.7K" change="3 positions" icon={Lock} trend="neutral" />
      </div>

      {/* Volume Chart */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-950">Trading Volume (7d)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liquidityData}>
              <defs>
                <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" />
              <XAxis dataKey="day" stroke="#86868b" fontSize={12} />
              <YAxis stroke="#86868b" fontSize={12} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e5ea", borderRadius: "8px", color: "#0a0a0a" }}
                formatter={(value) => [`£${Number(value).toLocaleString()}`, "Volume"]}
              />
              <Area type="monotone" dataKey="volume" stroke="#0a0a0a" strokeWidth={2} fillOpacity={1} fill="url(#volumeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {[
          { key: "pools", label: "Liquidity Pools" },
          { key: "p2p", label: "P2P Orderbook" },
          { key: "lending", label: "Collateral & Lending" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pools */}
      {activeTab === "pools" && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Pair</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-neutral-600">TVL</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-neutral-600">APR</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-neutral-600">24h Volume</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {liquidityPools.map((pool, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-5 py-4 text-sm font-medium text-neutral-900">{pool.pair}</td>
                  <td className="px-5 py-4 text-right text-sm text-neutral-900">{pool.tvl}</td>
                  <td className="px-5 py-4 text-right text-sm font-medium text-emerald-700">{pool.apr}</td>
                  <td className="px-5 py-4 text-right text-sm text-neutral-800">{pool.volume24h}</td>
                  <td className="px-5 py-4"><StatusBadge status={pool.status} variant={pool.status === "active" ? "success" : "warning"} /></td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openAddLiquidity(pool)}
                      className="rounded-md bg-neutral-950/5 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-neutral-950/10"
                    >
                      Add Liquidity
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* P2P */}
      {activeTab === "p2p" && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-neutral-950">Open Orders</h3>
          <div className="space-y-3">
            {p2pOrders.map((order, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${order.type === "buy" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {order.type.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{order.amount} {order.token}</p>
                    <p className="text-xs text-neutral-500">@ {order.price} per token</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-neutral-500">{order.trader} • {order.time}</p>
                  <button className="rounded-md bg-neutral-950/5 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-neutral-950/10">Fill</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lending */}
      {activeTab === "lending" && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Asset</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Locked</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Collateral Ratio</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Borrow Capacity</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {collateralPositions.map((pos, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-5 py-4 text-sm font-medium text-neutral-900 font-mono">{pos.asset}</td>
                  <td className="px-5 py-4 text-sm text-neutral-800">{pos.locked}</td>
                  <td className="px-5 py-4 text-sm font-medium text-neutral-900">{pos.collateralRatio}</td>
                  <td className="px-5 py-4 text-sm text-neutral-800">{pos.borrowCapacity}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={pos.status} variant={pos.status === "healthy" ? "success" : "warning"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Liquidity Modal */}
      {activePool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">Add Liquidity</h3>
              <p className="text-sm text-neutral-600">{activePool.pair} pool</p>
            </div>

            {!isConnected && (
              <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4" /> Connect your wallet to add liquidity on-chain.
              </p>
            )}

            {isConnected && !assetsLoading && myAssets.length === 0 && (
              <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4" /> No deployed tokens found for this wallet. Deploy an asset in Issuer Studio first.
              </p>
            )}

            {isConnected && myAssets.length > 0 && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">On-chain Asset</label>
                  <select
                    value={liquidityForm.tokenAddress}
                    onChange={(e) => setLiquidityForm({ ...liquidityForm, tokenAddress: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
                  >
                    {myAssets.map((a) => (
                      <option key={a.token_address} value={a.token_address}>
                        {a.symbol} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Amount to Add</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.00"
                    value={liquidityForm.amount}
                    onChange={(e) => setLiquidityForm({ ...liquidityForm, amount: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Mints new supply directly into the treasury vault, backing this pool's liquidity.
                  </p>
                </div>
              </div>
            )}

            {isPending && <p className="flex items-center gap-2 text-sm text-amber-700"><Loader2 className="h-4 w-4 animate-spin" />Confirm in wallet...</p>}
            {isConfirming && <p className="flex items-center gap-2 text-sm text-amber-700"><Loader2 className="h-4 w-4 animate-spin" />Adding liquidity on-chain...</p>}
            {isSuccess && <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Liquidity added on-chain!</p>}
            {mintError && <p className="text-sm text-red-700">{mintError.message}</p>}

            <div className="flex justify-end gap-3">
              <button onClick={closeAddLiquidity} className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100">
                {isSuccess ? "Close" : "Cancel"}
              </button>
              {!isSuccess && (
                <button
                  onClick={handleAddLiquidity}
                  disabled={!isConnected || !liquidityForm.tokenAddress || !liquidityForm.amount || isPending || isConfirming}
                  className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isPending || isConfirming ? "Adding..." : "Add Liquidity"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
