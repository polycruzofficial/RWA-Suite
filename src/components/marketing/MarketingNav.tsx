"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#assets", label: "Assets" },
  { href: "#compliance", label: "Compliance" },
  { href: "#institutions", label: "Institutions" },
  { href: "/docs", label: "Docs" },
];

export default function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-xs font-bold text-white">
            PC
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-950">
            POLYCRUZ
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.href.startsWith("/") ? (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-700 transition hover:text-neutral-950"
              >
                {l.label === "Docs" && <BookOpen className="h-3.5 w-3.5" />}
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] font-medium text-neutral-700 transition hover:text-neutral-950"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/get-started"
            className="text-[13px] font-medium text-neutral-700 transition hover:text-neutral-950"
          >
            Sign in
          </Link>
          <Link
            href="/get-started"
            className="rounded-full bg-neutral-950 px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-neutral-800"
          >
            Launch App
          </Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-900 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/get-started"
              className="mt-2 rounded-full bg-neutral-950 px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
