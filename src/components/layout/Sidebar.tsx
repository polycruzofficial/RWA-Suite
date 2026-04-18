"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  brand: string;
  sectionLabel: string;
  items: NavItem[];
  footerLabel?: string;
  footerHref?: string;
}

export default function Sidebar({
  brand,
  sectionLabel,
  items,
  footerLabel,
  footerHref = "/",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-neutral-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-[11px] font-bold text-white">
            EQ
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-950">
            {brand}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          {sectionLabel}
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  <Icon
                    className={`h-[17px] w-[17px] shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-500 group-hover:text-neutral-900"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer switch */}
      {footerLabel && (
        <div className="border-t border-neutral-200 p-4">
          <Link
            href={footerHref}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-[12px] font-medium text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            {footerLabel}
          </Link>
        </div>
      )}
    </aside>
  );
}
