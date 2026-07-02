import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Issuer Studio", href: "/issuer/portfolio" },
      { label: "Investor Marketplace", href: "/investor/marketplace" },
      { label: "Treasury", href: "/issuer/treasury" },
      { label: "Liquidity", href: "/issuer/liquidity" },
    ],
  },
  {
    title: "Assets",
    links: [
      { label: "UK Gilts", href: "#" },
      { label: "Private Credit", href: "#" },
      { label: "Equities", href: "#" },
      { label: "Commodities", href: "#" },
    ],
  },
  {
    title: "Institutional",
    links: [
      { label: "For Asset Managers", href: "#" },
      { label: "For Banks", href: "#" },
      { label: "For Treasuries", href: "#" },
      { label: "White-label", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Compliance", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Disclosures", href: "#" },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-xs font-bold text-white">
                PC
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-neutral-950">
                POLYCRUZ
              </span>
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">
              Institutional-grade real-world asset tokenization. Regulated.
              Compliant. On-chain.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-neutral-700 transition hover:text-neutral-950"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-neutral-200 pt-8 text-[12px] text-neutral-500 md:flex-row">
          <p>© 2026 POLYCRUZ Technologies Ltd. All rights reserved.</p>
          <p>
            Authorised and regulated entity. MiFID II • FCA • MAS • SEC-friendly
            architecture.
          </p>
        </div>
      </div>
    </footer>
  );
}
