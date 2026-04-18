"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Coins,
  Users,
  PieChart,
  Shield,
  Vault,
  Waves,
  TrendingUp,
  ScrollText,
  Settings,
} from "lucide-react";

const issuerNav = [
  { label: "Portfolio", href: "/issuer/portfolio", icon: LayoutDashboard },
  { label: "Tokenization Studio", href: "/issuer/studio", icon: Coins },
  { label: "Investors", href: "/issuer/investors", icon: Users },
  { label: "Cap Table", href: "/issuer/cap-table", icon: PieChart },
  { label: "Compliance", href: "/issuer/compliance", icon: Shield },
  { label: "Treasury", href: "/issuer/treasury", icon: Vault },
  { label: "Liquidity", href: "/issuer/liquidity", icon: Waves },
  { label: "Yield", href: "/issuer/yield", icon: TrendingUp },
  { label: "Ledger", href: "/issuer/ledger", icon: ScrollText },
  { label: "Settings", href: "/issuer/settings", icon: Settings },
];

const titles: Record<string, string> = {
  portfolio: "Portfolio",
  studio: "Tokenization Studio",
  investors: "Investor Management",
  "cap-table": "Cap Table & Ownership",
  compliance: "Compliance Center",
  treasury: "Treasury Console",
  liquidity: "Liquidity Hub",
  yield: "Yield Strategies",
  ledger: "Transaction Ledger",
  settings: "Settings",
  _default: "Issuer Console",
};

export default function IssuerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      brand="Equitex"
      sectionLabel="Issuer Console"
      navItems={issuerNav}
      titles={titles}
      footerLabel="Switch to Investor →"
      footerHref="/investor/marketplace"
    >
      {children}
    </DashboardLayout>
  );
}
