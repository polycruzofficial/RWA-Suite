"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Store,
  Briefcase,
  TrendingUp,
  BadgeCheck,
  ArrowLeftRight,
} from "lucide-react";

const investorNav = [
  { label: "Marketplace", href: "/investor/marketplace", icon: Store },
  { label: "Portfolio", href: "/investor/portfolio", icon: Briefcase },
  { label: "Yield", href: "/investor/yield", icon: TrendingUp },
  { label: "Trades", href: "/investor/trades", icon: ArrowLeftRight },
  { label: "KYC Status", href: "/investor/kyc", icon: BadgeCheck },
];

const titles: Record<string, string> = {
  marketplace: "Marketplace",
  portfolio: "Portfolio",
  yield: "Yield Strategies",
  trades: "Trade History",
  kyc: "Identity Verification",
  _default: "Investor",
};

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      brand="Equitex"
      sectionLabel="Investor"
      navItems={investorNav}
      titles={titles}
      footerLabel="Switch to Issuer →"
      footerHref="/issuer/portfolio"
    >
      {children}
    </DashboardLayout>
  );
}
