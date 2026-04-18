"use client";

import { type LucideIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  brand: string;
  sectionLabel: string;
  navItems: NavItem[];
  titles: Record<string, string>;
  footerLabel?: string;
  footerHref?: string;
}

export default function DashboardLayout({
  children,
  brand,
  sectionLabel,
  navItems,
  titles,
  footerLabel,
  footerHref,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar
        brand={brand}
        sectionLabel={sectionLabel}
        items={navItems}
        footerLabel={footerLabel}
        footerHref={footerHref}
      />

      <div className="ml-[260px]">
        <Header titles={titles} />
        <main className="px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
