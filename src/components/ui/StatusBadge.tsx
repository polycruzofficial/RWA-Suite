"use client";

interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
}

const variantStyles = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200/70",
  warning: "bg-amber-50 text-amber-800 ring-amber-200/70",
  error: "bg-red-50 text-red-800 ring-red-200/70",
  info: "bg-blue-50 text-blue-800 ring-blue-200/70",
  neutral: "bg-neutral-100 text-neutral-800 ring-neutral-200",
};

const dotStyles = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-neutral-500",
};

export default function StatusBadge({
  status,
  variant = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${variantStyles[variant]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />
      {status}
    </span>
  );
}
