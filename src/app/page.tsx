import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import {
  ArrowRight,
  ShieldCheck,
  Landmark,
  Layers3,
  TrendingUp,
  Lock,
  Globe2,
  Coins,
  FileCheck2,
  Building2,
  Wallet,
  Sparkles,
} from "lucide-react";

const institutions = [
  "BlackRock",
  "JP Morgan",
  "Goldman Sachs",
  "Fidelity",
  "Morgan Stanley",
  "HSBC",
  "UBS",
  "Standard Chartered",
  "Deutsche Bank",
  "BNP Paribas",
];

const features = [
  {
    icon: ShieldCheck,
    title: "Regulation-first",
    body: "On-chain ERC-3643 compliance. KYC, AML, transfer restrictions, and audit trails enforced at the contract level.",
  },
  {
    icon: Layers3,
    title: "Multi-asset tokenization",
    body: "Gilts, private credit, commodities, equities, real estate. One unified issuance layer for every real-world asset.",
  },
  {
    icon: Coins,
    title: "Stablecoin settlement",
    body: "Settle in USDC, USDT, PYUSD, EURC, GBPT. T+0 finality with on-chain reconciliation and instant atomic swaps.",
  },
  {
    icon: TrendingUp,
    title: "Institutional yield",
    body: "Native yield products across fixed-income, money market, and tokenized treasury strategies — from 4% to 12% APY.",
  },
  {
    icon: Lock,
    title: "MPC + biometric custody",
    body: "Fireblocks-grade vaulting. Multi-sig, hardware-key approval, and Ledger integration out of the box.",
  },
  {
    icon: Globe2,
    title: "Cross-jurisdiction ready",
    body: "MiFID II, FCA, MAS, ADGM, DIFC. Whitelisted investor bases and jurisdiction-aware transfer logic.",
  },
];

const assetClasses = [
  {
    label: "Sovereign Debt",
    value: "£2.4B",
    caption: "UK Gilts • US Treasuries • EU Bunds",
  },
  {
    label: "Private Credit",
    value: "£890M",
    caption: "Direct lending • CLO tranches",
  },
  {
    label: "Equities",
    value: "£1.1B",
    caption: "Pre-IPO • Fund-of-funds",
  },
  {
    label: "Commodities",
    value: "£420M",
    caption: "Gold • Energy • Carbon credits",
  },
];

const stats = [
  { value: "£4.8B+", label: "Tokenized AUM" },
  { value: "180+", label: "Institutional issuers" },
  { value: "T+0", label: "Settlement finality" },
  { value: "99.99%", label: "Platform uptime" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <MarketingNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 halo-light" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 text-center md:pt-28 md:pb-40">
          <div className="animate-fade-up">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Now live on Ethereum, Polygon & Base
            </div>

            <h1 className="display-hero mt-8 mx-auto max-w-5xl text-neutral-950">
              The institutional layer
              <br />
              <span className="text-neutral-400">for real-world assets.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600 md:text-xl">
              Equitex is the tokenization platform trusted by the world's
              largest asset managers. Issue, distribute, and settle regulated
              financial instruments — entirely on-chain.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/get-started?role=issuer" className="btn-primary">
                Launch Issuer Console
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/get-started?role=investor"
                className="btn-secondary"
              >
                Enter Marketplace
              </Link>
            </div>

            <p className="mt-6 text-[12px] text-neutral-500">
              No credit card required • Wallet-gated access • KYC via Onfido
            </p>
          </div>

          {/* Product chrome preview */}
          <div className="mt-20 animate-fade-up [animation-delay:160ms]">
            <div className="card-dark relative mx-auto max-w-5xl overflow-hidden p-1 shadow-2xl shadow-black/15">
              <div className="rounded-[20px] bg-neutral-950 p-8 md:p-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                      <Landmark className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] uppercase tracking-widest text-white/50">
                        Portfolio
                      </p>
                      <p className="text-sm font-semibold text-white">
                        BlackRock Treasury Fund
                      </p>
                    </div>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/80 md:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Mainnet • Settled T+0
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-6 text-left md:grid-cols-4">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-[11px] uppercase tracking-widest text-white/50">
                        {s.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {assetClasses.slice(0, 3).map((a) => (
                    <div
                      key={a.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left"
                    >
                      <p className="text-[11px] uppercase tracking-widest text-white/50">
                        {a.label}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {a.value}
                      </p>
                      <p className="mt-1 text-[12px] text-white/60">
                        {a.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Trusted by the world's top institutions
          </p>
          <div className="mt-8 overflow-hidden">
            <div className="flex animate-marquee gap-14 whitespace-nowrap">
              {[...institutions, ...institutions].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-2xl font-semibold tracking-tight text-neutral-400/80"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section id="platform" className="relative py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="eyebrow">The platform</p>
            <h2 className="display-xl mt-4 text-neutral-950">
              Built for the next trillion.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-neutral-600">
              Every building block a regulated institution needs to bring a
              real-world asset on-chain — unified, interoperable, audited.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card group p-8 transition hover:-translate-y-0.5 hover:border-neutral-900/30"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-neutral-950">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TWO-DASHBOARD SPLIT */}
      <section id="assets" className="bg-neutral-50 py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="eyebrow">Two sides. One rail.</p>
            <h2 className="display-xl mt-4 text-neutral-950">
              Issuers and investors,
              <br />
              <span className="text-neutral-400">perfectly aligned.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Issuer card */}
            <div className="card p-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                  Issuer Console
                </p>
              </div>
              <h3 className="display-lg mt-6 text-neutral-950">
                Tokenize any real-world asset in under 60 seconds.
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
                Upload offering documents, configure jurisdiction rules, mint
                ERC-3643 tokens, and manage your entire cap table — all from a
                single console.
              </p>
              <ul className="mt-8 space-y-3 text-[14px] text-neutral-700">
                {[
                  "Tokenization Studio with IPFS + Pinata",
                  "Live cap table & shareholder registry",
                  "Treasury vault with yield products",
                  "Compliance center (KYC, AML, sanctions)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <FileCheck2 className="h-4 w-4 text-neutral-950" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/get-started?role=issuer"
                  className="btn-primary w-full"
                >
                  Open Issuer Console
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Investor card */}
            <div className="card-dark p-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  Investor Marketplace
                </p>
              </div>
              <h3 className="display-lg mt-6 text-white">
                Access institutional yield, directly from your wallet.
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Complete KYC once. Browse every regulated asset on the platform.
                Trade with stablecoins, earn yield, and settle atomically
                on-chain.
              </p>
              <ul className="mt-8 space-y-3 text-[14px] text-white/85">
                {[
                  "Unified marketplace of 200+ assets",
                  "Stablecoin + top-coin trading (USDC, USDT, ETH)",
                  "Portfolio & performance analytics",
                  "Single-flow KYC with Onfido & Sumsub",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <FileCheck2 className="h-4 w-4 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/get-started?role=investor"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-neutral-950 transition hover:bg-neutral-100"
                >
                  Enter Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE SECTION */}
      <section id="compliance" className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Compliance</p>
              <h2 className="display-xl mt-4 text-neutral-950">
                Regulated by design,
                <br />
                <span className="text-neutral-400">not by retrofit.</span>
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-neutral-600">
                Equitex implements the ERC-3643 / T-REX standard at the
                contract level. Every transfer checks identity, jurisdiction,
                sanctions lists, and holding periods before it executes.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6">
                {[
                  { k: "ERC-3643", v: "T-REX compliance standard" },
                  { k: "MiFID II", v: "EU investor protection" },
                  { k: "FCA / MAS", v: "UK + Singapore ready" },
                  { k: "ISO 27001", v: "Information security" },
                ].map((c) => (
                  <div
                    key={c.k}
                    className="border-l-2 border-neutral-950 pl-4"
                  >
                    <p className="text-[14px] font-semibold text-neutral-950">
                      {c.k}
                    </p>
                    <p className="mt-1 text-[12px] text-neutral-600">{c.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-dark relative overflow-hidden p-10">
              <div className="absolute inset-0 bg-grid-dark opacity-40" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-white" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                    Live compliance feed
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    {
                      tag: "TRANSFER",
                      text: "0xA1…c23 → 0x84…9b1 • 12,500 GILT26",
                      status: "Approved",
                    },
                    {
                      tag: "KYC",
                      text: "BlackRock Treasury Desk verified (GB)",
                      status: "Tier 3",
                    },
                    {
                      tag: "SANCTIONS",
                      text: "OFAC screen • 0x47…dd0",
                      status: "Clear",
                    },
                    {
                      tag: "MINT",
                      text: "CREDIT1 • 500,000 tokens",
                      status: "Settled",
                    },
                    {
                      tag: "AUDIT",
                      text: "Quarterly attestation signed",
                      status: "On-chain",
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-white/80">
                          {row.tag}
                        </span>
                        <p className="text-[13px] text-white/85">{row.text}</p>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-300">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONS CTA */}
      <section id="institutions" className="bg-neutral-950 py-28 text-white md:py-36">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="absolute inset-0 bg-grid-dark opacity-30" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              For institutions
            </p>
            <h2 className="display-xl mt-6 text-white">
              The on-chain home for
              <br />
              <span className="text-white/50">regulated capital.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Equitex is the operating system for the next decade of capital
              markets. Join the leading banks, asset managers, and sovereigns
              already building on us.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-neutral-950 transition hover:bg-neutral-100"
              >
                Launch the App
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-white/10"
              >
                Book a briefing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
