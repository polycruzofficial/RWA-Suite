"use client";

import { useAccount } from "wagmi";
import { useIssuerTokens } from "@/hooks/useContracts";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  PieChart as PieChartIcon,
  Users,
  ArrowUpRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const ownershipData = [
  { name: "Issuer (Treasury)", value: 45, color: "#0a0a0a", address: "0x1234...abcd" },
  { name: "BlackRock Fund I", value: 20, color: "#404040", address: "0x5678...efgh" },
  { name: "Fidelity UK", value: 15, color: "#737373", address: "0x9abc...ijkl" },
  { name: "Alpha Management", value: 10, color: "#a3a3a3", address: "0xdef0...mnop" },
  { name: "Other Holders (12)", value: 10, color: "#a3a3a3", address: "Various" },
];

const holdersByToken = [
  { token: "GILT26", holders: 42, totalSupply: "1,000,000" },
  { token: "CREDIT1", holders: 28, totalSupply: "500,000" },
  { token: "CMDY01", holders: 15, totalSupply: "250,000" },
  { token: "EQFA", holders: 57, totalSupply: "2,000,000" },
];

const jurisdictionBreakdown = [
  { jurisdiction: "GB", holders: 45, percentage: 52 },
  { jurisdiction: "US", holders: 22, percentage: 25 },
  { jurisdiction: "EU", holders: 12, percentage: 14 },
  { jurisdiction: "SG", holders: 5, percentage: 6 },
  { jurisdiction: "CH", holders: 3, percentage: 3 },
];

const barData = holdersByToken.map((t) => ({
  name: t.token,
  holders: t.holders,
}));

export default function CapTablePage() {
  const { address } = useAccount();
  const { data: issuerTokens } = useIssuerTokens(address);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-950">Cap Table & Ownership</h2>
        <p className="text-sm text-neutral-600">View token holder distribution, ownership structure, and shareholder registry</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ownership Distribution */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-neutral-950">Ownership Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ownershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ownershipData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5ea",
                    borderRadius: "8px",
                    color: "#0a0a0a",
                  }}
                  formatter={(value) => [`${value}%`, "Ownership"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {ownershipData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500 font-mono">{item.address}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-neutral-950">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holders by Token */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-neutral-950">Holders per Token</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" />
                  <XAxis dataKey="name" stroke="#86868b" fontSize={12} />
                  <YAxis stroke="#86868b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5ea",
                      borderRadius: "8px",
                      color: "#0a0a0a",
                    }}
                  />
                  <Bar dataKey="holders" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {holdersByToken.map((t) => (
                <div key={t.token} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-neutral-800">{t.token}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-600">{t.totalSupply} supply</span>
                    <StatusBadge status={`${t.holders} holders`} variant="info" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jurisdiction Breakdown */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-neutral-950">Jurisdiction Breakdown</h3>
            <div className="space-y-3">
              {jurisdictionBreakdown.map((j) => (
                <div key={j.jurisdiction} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-800">{j.jurisdiction}</span>
                    <span className="text-neutral-600">{j.holders} holders ({j.percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-neutral-950"
                      style={{ width: `${j.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Shareholder Registry */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-950">Shareholder Registry</h3>
          <button className="flex items-center gap-1 text-xs text-neutral-950 hover:text-neutral-700">
            Export CSV <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Holder</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Token</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">Balance</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-600">% Ownership</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">Jurisdiction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {ownershipData.map((item, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500 font-mono">{item.address}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-800 font-mono">GILT26</td>
                  <td className="px-4 py-3 text-right text-sm text-neutral-900">{(item.value * 10000).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-neutral-950">{item.value}%</td>
                  <td className="px-4 py-3"><StatusBadge status="Institutional" variant="info" /></td>
                  <td className="px-4 py-3 text-sm text-neutral-800">GB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
