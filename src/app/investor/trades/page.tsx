"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";

const trades = [
  {
    side: "buy" as const,
    symbol: "GILT26",
    amount: 12_500,
    price: 1.02,
    total: 12_750,
    settlement: "USDC",
    txHash: "0x4fa2…9ee1",
    status: "Settled",
    time: "2 min ago",
  },
  {
    side: "buy" as const,
    symbol: "USTB30",
    amount: 8_000,
    price: 1.0,
    total: 8_000,
    settlement: "PYUSD",
    txHash: "0x12bc…44a0",
    status: "Settled",
    time: "18 min ago",
  },
  {
    side: "sell" as const,
    symbol: "EQFA",
    amount: 1_200,
    price: 1.15,
    total: 1_380,
    settlement: "USDC",
    txHash: "0x88de…bcaa",
    status: "Settled",
    time: "1 hr ago",
  },
  {
    side: "buy" as const,
    symbol: "GOLD",
    amount: 6,
    price: 2_342.1,
    total: 14_052.6,
    settlement: "USDC",
    txHash: "0xa1e9…77fb",
    status: "Pending",
    time: "3 hr ago",
  },
];

export default function InvestorTradesPage() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="display-lg text-neutral-950">Trade history.</h2>
          <p className="mt-1 text-[14px] text-neutral-600">
            Every fill, settlement, and transfer routed through your wallet.
          </p>
        </div>
        <Link
          href="/investor/marketplace"
          className="btn-primary"
        >
          New trade <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {!isConnected && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] text-amber-900">
          Connect your wallet to see your real on-chain trade history.
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Side
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Asset
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Price
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Total
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Settlement
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Tx
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {trades.map((t, i) => (
              <tr key={i} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                      t.side === "buy"
                        ? "bg-emerald-50 text-emerald-800 ring-emerald-200/70"
                        : "bg-red-50 text-red-800 ring-red-200/70"
                    }`}
                  >
                    {t.side === "buy" ? (
                      <ArrowDownLeft className="h-3 w-3" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3" />
                    )}
                    {t.side.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-[13px] font-medium text-neutral-950">
                  {t.symbol}
                </td>
                <td className="px-6 py-4 text-right font-mono text-[13px] text-neutral-900">
                  {t.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-[13px] text-neutral-900">
                  ${t.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-[13px] font-medium text-neutral-950">
                  ${t.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-[12px] text-neutral-700">
                  {t.settlement}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge
                    status={t.status}
                    variant={t.status === "Settled" ? "success" : "warning"}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-600 hover:text-neutral-950"
                  >
                    {t.txHash}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
