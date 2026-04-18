"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ScrollText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Radio,
} from "lucide-react";

interface LedgerEvent {
  id: string;
  type: "HEARTBEAT" | "SYNC_PASS" | "VALIDATION" | "TRANSFER" | "MINT" | "BURN" | "COMPLIANCE" | "DIVIDEND" | "YIELD";
  status: "success" | "pending" | "failed";
  from: string;
  to: string;
  amount: string;
  token: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  gasUsed: string;
}

const generateEvents = (): LedgerEvent[] => [
  { id: "1", type: "TRANSFER", status: "success", from: "0x1234...abcd", to: "0x5678...efgh", amount: "50,000 GILT26", token: "GILT26", txHash: "0xabc1...def1", blockNumber: 19542310, timestamp: "2024-04-04T09:00:15Z", gasUsed: "65,432" },
  { id: "2", type: "MINT", status: "success", from: "0x0000...0000", to: "0x1234...abcd", amount: "100,000 CREDIT1", token: "CREDIT1", txHash: "0xabc2...def2", blockNumber: 19542305, timestamp: "2024-04-04T08:55:30Z", gasUsed: "128,543" },
  { id: "3", type: "COMPLIANCE", status: "success", from: "0x1234...abcd", to: "Registry", amount: "—", token: "—", txHash: "0xabc3...def3", blockNumber: 19542300, timestamp: "2024-04-04T08:50:00Z", gasUsed: "45,210" },
  { id: "4", type: "DIVIDEND", status: "success", from: "0x1234...abcd", to: "Holders", amount: "£24,500", token: "EQFA", txHash: "0xabc4...def4", blockNumber: 19542290, timestamp: "2024-04-04T08:30:00Z", gasUsed: "210,876" },
  { id: "5", type: "VALIDATION", status: "success", from: "System", to: "0xdead...beef", amount: "Blocked", token: "GILT26", txHash: "0xabc5...def5", blockNumber: 19542285, timestamp: "2024-04-04T08:15:00Z", gasUsed: "32,100" },
  { id: "6", type: "YIELD", status: "success", from: "Vault", to: "0x9abc...ijkl", amount: "£1,250", token: "GILT26", txHash: "0xabc6...def6", blockNumber: 19542280, timestamp: "2024-04-04T08:00:00Z", gasUsed: "55,432" },
  { id: "7", type: "SYNC_PASS", status: "success", from: "Oracle", to: "System", amount: "—", token: "—", txHash: "0xabc7...def7", blockNumber: 19542275, timestamp: "2024-04-04T07:45:00Z", gasUsed: "21,000" },
  { id: "8", type: "TRANSFER", status: "pending", from: "0x5678...efgh", to: "0xdef0...mnop", amount: "15,000 GILT26", token: "GILT26", txHash: "0xabc8...def8", blockNumber: 19542270, timestamp: "2024-04-04T07:30:00Z", gasUsed: "—" },
  { id: "9", type: "BURN", status: "success", from: "0x1234...abcd", to: "0x0000...0000", amount: "5,000 CMDY01", token: "CMDY01", txHash: "0xabc9...def9", blockNumber: 19542265, timestamp: "2024-04-04T07:15:00Z", gasUsed: "42,100" },
  { id: "10", type: "HEARTBEAT", status: "success", from: "System", to: "System", amount: "—", token: "—", txHash: "—", blockNumber: 19542260, timestamp: "2024-04-04T07:00:00Z", gasUsed: "21,000" },
];

const typeColors: Record<string, "success" | "info" | "warning" | "error" | "neutral"> = {
  TRANSFER: "info",
  MINT: "success",
  BURN: "error",
  COMPLIANCE: "warning",
  DIVIDEND: "success",
  YIELD: "success",
  VALIDATION: "warning",
  SYNC_PASS: "neutral",
  HEARTBEAT: "neutral",
};

export default function LedgerPage() {
  const { isConnected } = useAccount();
  const [events] = useState(generateEvents);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLive, setIsLive] = useState(true);

  const filtered = events.filter((e) => {
    const matchSearch = e.txHash.includes(search) || e.from.includes(search) || e.to.includes(search) || e.token.includes(search);
    const matchType = filterType === "all" || e.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-950">Transaction Ledger</h2>
          <p className="text-sm text-neutral-600">Real-time on-chain event stream with cryptographic audit trails</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              isLive ? "border-emerald-500/30 bg-emerald-50 text-emerald-700" : "border-neutral-200 text-neutral-600"
            }`}
          >
            <Radio className={`h-3 w-3 ${isLive ? "animate-pulse" : ""}`} />
            {isLive ? "Live" : "Paused"}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:text-neutral-900">
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Total Events</p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">{events.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Latest Block</p>
          <p className="mt-1 text-2xl font-bold text-neutral-950 font-mono">{events[0]?.blockNumber}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Success Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {Math.round((events.filter((e) => e.status === "success").length / events.length) * 100)}%
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{events.filter((e) => e.status === "pending").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tx hash, address, or token..."
            className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {["all", "TRANSFER", "MINT", "BURN", "COMPLIANCE", "DIVIDEND", "YIELD"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs transition-colors ${
                filterType === t ? "border-neutral-950 bg-neutral-950/5 text-neutral-950" : "border-neutral-200 text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Event Stream */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Type</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">From</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">To</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">Amount</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Tx Hash</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">Block</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">Gas</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((event) => (
              <tr key={event.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3"><StatusBadge status={event.type} variant={typeColors[event.type]} /></td>
                <td className="px-4 py-3">
                  <span className={`h-2 w-2 rounded-full inline-block ${event.status === "success" ? "bg-emerald-400" : event.status === "pending" ? "bg-amber-400 animate-pulse" : "bg-red-400"}`} />
                </td>
                <td className="px-4 py-3 text-xs text-neutral-800 font-mono">{event.from}</td>
                <td className="px-4 py-3 text-xs text-neutral-800 font-mono">{event.to}</td>
                <td className="px-4 py-3 text-right text-xs text-neutral-900">{event.amount}</td>
                <td className="px-4 py-3 text-xs text-neutral-950 font-mono">{event.txHash}</td>
                <td className="px-4 py-3 text-right text-xs text-neutral-600 font-mono">{event.blockNumber}</td>
                <td className="px-4 py-3 text-right text-xs text-neutral-500">{event.gasUsed}</td>
                <td className="px-4 py-3 text-right text-xs text-neutral-500">{new Date(event.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
