"use client";

import { type LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

const trendConfig = {
  up: {
    icon: ArrowUpRight,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/70",
  },
  down: {
    icon: ArrowDownRight,
    color: "text-red-700",
    bg: "bg-red-50",
    ring: "ring-red-200/70",
  },
  neutral: {
    icon: Minus,
    color: "text-neutral-700",
    bg: "bg-neutral-100",
    ring: "ring-neutral-200",
  },
};

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
}: StatCardProps) {
  const t = trendConfig[trend];
  const TrendIcon = t.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-900/30 hover:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[12px] font-medium text-neutral-500">{title}</p>
          <p className="text-[28px] font-semibold tracking-tight text-neutral-950">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${t.bg} ${t.color} ${t.ring}`}
              >
                <TrendIcon className="h-3 w-3" />
                {change}
              </span>
            </div>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
}
