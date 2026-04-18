"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";

interface HeaderProps {
  titles: Record<string, string>;
}

export default function Header({ titles }: HeaderProps) {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop() || "";
  const pageTitle = titles[slug] || titles["_default"] || "Dashboard";
  const role = pathname.startsWith("/issuer")
    ? "Issuer"
    : pathname.startsWith("/investor")
    ? "Investor"
    : "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-8 backdrop-blur-xl">
      <div className="flex items-baseline gap-3">
        {role && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            {role}
          </p>
        )}
        <h1 className="text-[17px] font-semibold tracking-tight text-neutral-950">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-neutral-700">
            Sepolia Testnet
          </span>
        </div>

        <ConnectButton
          chainStatus="icon"
          accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
          showBalance={false}
        />
      </div>
    </header>
  );
}
