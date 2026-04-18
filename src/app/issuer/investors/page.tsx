"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { type Address } from "viem";
import { useSetIdentity, useSetWhitelist, useIsCompliant } from "@/hooks/useContracts";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Filter,
} from "lucide-react";

interface InvestorRow {
  address: string;
  name: string;
  type: "retail" | "professional" | "institutional";
  jurisdiction: string;
  kycStatus: "approved" | "pending" | "rejected" | "expired";
  riskScore: number;
  onboardedAt: string;
}

const mockInvestors: InvestorRow[] = [
  { address: "0x1234...abcd", name: "BlackRock Fund I", type: "institutional", jurisdiction: "GB", kycStatus: "approved", riskScore: 12, onboardedAt: "2024-01-15" },
  { address: "0x5678...efgh", name: "Fidelity UK", type: "institutional", jurisdiction: "GB", kycStatus: "approved", riskScore: 8, onboardedAt: "2024-02-20" },
  { address: "0x9abc...ijkl", name: "Alpha Management LP", type: "professional", jurisdiction: "US", kycStatus: "approved", riskScore: 25, onboardedAt: "2024-03-10" },
  { address: "0xdef0...mnop", name: "Geneva Wealth SA", type: "professional", jurisdiction: "CH", kycStatus: "pending", riskScore: 35, onboardedAt: "2024-03-28" },
  { address: "0x1111...qrst", name: "Sakura Securities", type: "institutional", jurisdiction: "SG", kycStatus: "approved", riskScore: 15, onboardedAt: "2024-04-02" },
  { address: "0x2222...uvwx", name: "Pending Investor", type: "retail", jurisdiction: "EU", kycStatus: "pending", riskScore: 50, onboardedAt: "2024-04-15" },
];

const kycVariants: Record<string, "success" | "warning" | "error" | "info"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  expired: "warning",
};

export default function InvestorsPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const { setIdentity, isPending: isSettingId, isSuccess: idSuccess } = useSetIdentity();
  const { setWhitelist, isPending: isWhitelisting, isSuccess: wlSuccess } = useSetWhitelist();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New investor form
  const [newAddress, setNewAddress] = useState("");
  const [newType, setNewType] = useState<number>(2); // institutional
  const [newJurisdiction, setNewJurisdiction] = useState("GB");

  const filteredInvestors = mockInvestors.filter((inv) => {
    const matchSearch = inv.name.toLowerCase().includes(search.toLowerCase()) || inv.address.includes(search);
    const matchType = filterType === "all" || inv.type === filterType;
    return matchSearch && matchType;
  });

  const handleAddInvestor = () => {
    if (!newAddress || !newAddress.startsWith("0x")) return;

    // Set identity on compliance registry
    setIdentity({
      account: newAddress as Address,
      status: 2, // Approved
      investorType: newType,
      jurisdiction: newJurisdiction,
      kycDocHash: "",
      expiresAt: BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 3600), // 1 year
      pep: false,
      riskScore: 20n,
    });

    setShowAddModal(false);
    setNewAddress("");
  };

  const handleWhitelist = (investorAddr: string, tokenAddr: string) => {
    setWhitelist(tokenAddr as Address, investorAddr as Address, true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-950">Investor Management</h2>
          <p className="text-sm text-neutral-600">Onboard, verify, and manage investor access to your tokenized assets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <UserPlus className="h-4 w-4" /> Add Investor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Total Investors</p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">{mockInvestors.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">KYC Approved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{mockInvestors.filter(i => i.kycStatus === "approved").length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Pending Review</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{mockInvestors.filter(i => i.kycStatus === "pending").length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-600">Institutional</p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">{mockInvestors.filter(i => i.type === "institutional").length}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address..."
            className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          {["all", "institutional", "professional", "retail"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg border px-3 py-2 text-xs capitalize transition-colors ${
                filterType === t
                  ? "border-neutral-950 bg-neutral-950/5 text-neutral-950"
                  : "border-neutral-200 text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Investor Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Investor</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Type</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Jurisdiction</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">KYC Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Risk Score</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredInvestors.map((inv, i) => (
              <tr key={i} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{inv.name}</p>
                    <p className="text-xs text-neutral-500 font-mono">{inv.address}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm capitalize text-neutral-800">{inv.type}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-neutral-800">{inv.jurisdiction}</span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={inv.kycStatus} variant={kycVariants[inv.kycStatus]} />
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-medium ${inv.riskScore < 30 ? "text-emerald-700" : inv.riskScore < 60 ? "text-amber-700" : "text-red-700"}`}>
                    {inv.riskScore}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {inv.kycStatus === "pending" && (
                      <button className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20">
                        Approve
                      </button>
                    )}
                    <button className="rounded-md bg-neutral-950/5 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-neutral-950/10">
                      Whitelist
                    </button>
                    <button className="rounded-md bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-300">
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Investor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-950">Add Investor</h3>
            <p className="text-sm text-neutral-600">Register a new investor in the on-chain compliance registry.</p>

            <div>
              <label className="mb-1.5 block text-sm text-neutral-800">Wallet Address</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-neutral-800">Investor Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
                >
                  <option value={0}>Retail</option>
                  <option value={1}>Professional</option>
                  <option value={2}>Institutional</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-neutral-800">Jurisdiction</label>
                <select
                  value={newJurisdiction}
                  onChange={(e) => setNewJurisdiction(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
                >
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="EU">European Union</option>
                  <option value="SG">Singapore</option>
                  <option value="CH">Switzerland</option>
                </select>
              </div>
            </div>

            {isSettingId && (
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Loader2 className="h-4 w-4 animate-spin" /> Setting identity on-chain...
              </div>
            )}
            {idSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Identity set successfully!
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvestor}
                disabled={!newAddress || isSettingId || !isConnected}
                className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSettingId ? "Processing..." : "Add & Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
