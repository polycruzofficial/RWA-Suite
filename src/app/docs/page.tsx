"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import {
  BookOpen, ChevronRight, Building2, Wallet, ShieldCheck, Coins,
  TrendingUp, Layers3, Globe2, Lock, DollarSign, Users, FileText,
  ArrowRight, AlertTriangle, CheckCircle2, Lightbulb, Zap,
  BarChart2, LayoutGrid, Settings, Upload, BadgeCheck, Rocket,
  CreditCard, Star, Clock, Search, Eye, RefreshCw, Fingerprint,
  HardDrive, Plus, ArrowLeftRight, Waves, FileCheck2, MapPin,
  Package, Landmark, Home, Leaf, Banknote, Palette,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────

type DocRole = "issuer" | "investor";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
}

// ─── Section registries ────────────────────────────────────────────────────

const ISSUER_SECTIONS: Section[] = [
  { id: "iss-start", title: "Getting Started", icon: Rocket },
  { id: "iss-studio", title: "Tokenization Studio", icon: Coins, badge: "8 Steps" },
  { id: "iss-compliance", title: "Compliance Center", icon: ShieldCheck },
  { id: "iss-investors", title: "Investor Management", icon: Users },
  { id: "iss-captable", title: "Cap Table", icon: BarChart2 },
  { id: "iss-treasury", title: "Treasury Console", icon: Landmark },
  { id: "iss-liquidity", title: "Liquidity Hub", icon: Waves },
  { id: "iss-settings", title: "Settings & Custody", icon: Lock },
];

const INVESTOR_SECTIONS: Section[] = [
  { id: "inv-start", title: "Getting Started", icon: Rocket },
  { id: "inv-kyc", title: "KYC Verification", icon: BadgeCheck, badge: "Required" },
  { id: "inv-marketplace", title: "Marketplace", icon: LayoutGrid },
  { id: "inv-investing", title: "Investing & Settlement", icon: DollarSign },
  { id: "inv-portfolio", title: "Portfolio Management", icon: TrendingUp },
  { id: "inv-yield", title: "Yield & Returns", icon: Star },
  { id: "inv-security", title: "Security & Compliance", icon: ShieldCheck },
];

// ─── Helper components ─────────────────────────────────────────────────────

function Callout({ type, children }: { type: "info" | "tip" | "warning" | "success"; children: React.ReactNode }) {
  const styles = {
    info: { bg: "bg-blue-50 border-blue-200", icon: Lightbulb, iconCls: "text-blue-600", textCls: "text-blue-900" },
    tip: { bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, iconCls: "text-emerald-600", textCls: "text-emerald-900" },
    warning: { bg: "bg-amber-50 border-amber-200", icon: AlertTriangle, iconCls: "text-amber-600", textCls: "text-amber-900" },
    success: { bg: "bg-neutral-950 border-neutral-950", icon: Zap, iconCls: "text-white", textCls: "text-white" },
  }[type];
  const Icon = styles.icon;
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${styles.bg}`}>
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${styles.iconCls}`} />
      <p className={`text-[13px] leading-relaxed ${styles.textCls}`}>{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">{n}</div>
        <div className="mt-2 w-px flex-1 bg-neutral-200" />
      </div>
      <div className="pb-6 flex-1">
        <p className="text-[14px] font-semibold text-neutral-950 mb-1.5">{title}</p>
        <div className="text-[13px] text-neutral-600 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function StepLast({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">{n}</div>
      </div>
      <div className="pb-2 flex-1">
        <p className="text-[14px] font-semibold text-neutral-950 mb-1.5">{title}</p>
        <div className="text-[13px] text-neutral-600 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, id }: { icon: React.ElementType; title: string; subtitle: string; id: string }) {
  return (
    <div id={id} className="flex items-start gap-4 mb-6 scroll-mt-24">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-[22px] font-bold text-neutral-950 tracking-tight">{title}</h2>
        <p className="text-[13px] text-neutral-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function FeatureGrid({ items }: { items: { icon: React.ElementType; title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-200">
            <item.icon className="h-4 w-4 text-neutral-700" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-neutral-900">{item.title}</p>
            <p className="text-[12px] text-neutral-500 mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return <div className="my-10 border-t border-neutral-200" />;
}

// ─── Issuer Guide content ──────────────────────────────────────────────────

function IssuerGuide() {
  return (
    <div className="space-y-0">

      {/* Getting Started */}
      <div id="iss-start" className="scroll-mt-24">
        <SectionHeader icon={Rocket} id="iss-start-h" title="Getting Started" subtitle="Set up your issuer account and connect to the POLYCRUZ platform." />
        <div className="space-y-0">
          <Step n={1} title="Connect Your Wallet">
            <p>Visit <strong>POLYCRUZ.io</strong> and click <strong>"Launch Issuer Console"</strong> on the homepage. You'll be prompted to connect a Web3 wallet.</p>
            <p>Supported wallets: <strong>MetaMask, WalletConnect, Coinbase Wallet, Rainbow, Ledger Live</strong>.</p>
            <Callout type="tip">We recommend using a hardware wallet (Ledger) for production deployments. This ensures your issuer private key is stored offline.</Callout>
          </Step>
          <Step n={2} title="Choose Your Role">
            <p>On the <strong>Get Started</strong> page, select <strong>"I'm an Issuer"</strong>. This routes you to the full Issuer Console with Tokenization Studio, Compliance Center, Treasury, and more.</p>
          </Step>
          <Step n={3} title="Explore the Issuer Console">
            <p>The left sidebar contains all your tools. Navigate between:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                ["Portfolio", "Overview of all deployed tokens"],
                ["Tokenization Studio", "Create and deploy new tokens"],
                ["Investors", "Manage investor KYC & whitelist"],
                ["Cap Table", "Shareholder registry"],
                ["Compliance", "Rules, sanctions, audit trail"],
                ["Treasury", "Vault, yield products"],
                ["Liquidity", "Pools, P2P, settlement"],
                ["Settings", "Custody, multi-sig, API keys"],
              ].map(([name, desc]) => (
                <div key={name} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[12px]">
                  <p className="font-semibold text-neutral-900">{name}</p>
                  <p className="text-neutral-500">{desc}</p>
                </div>
              ))}
            </div>
          </Step>
          <StepLast n={4} title="Select Your Network">
            <p>For testing, select <strong>Sepolia</strong> (Ethereum testnet) or <strong>Amoy</strong> (Polygon testnet). For production, switch to <strong>Ethereum Mainnet</strong>, <strong>Polygon</strong>, or <strong>Base</strong>.</p>
            <Callout type="warning">Testnets use free test ETH. Production deployments require real ETH for gas fees. Always test on Sepolia before going live.</Callout>
          </StepLast>
        </div>
      </div>

      <Divider />

      {/* Tokenization Studio */}
      <div id="iss-studio" className="scroll-mt-24">
        <SectionHeader icon={Coins} id="iss-studio-h" title="Tokenization Studio" subtitle="Create and deploy regulated ERC-3643 security tokens in 8 guided steps." />

        <Callout type="info">Navigate to <strong>Issuer Console → Tokenization Studio → Create Token</strong>. The wizard walks you through all 8 steps. You can go back to previous steps at any time.</Callout>

        <div className="mt-6 space-y-0">
          <Step n={1} title="Asset Information — Define your asset">
            <p>Select your <strong>Asset Class</strong> from 12 supported categories:</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["Bond", "Credit", "Commodity", "Equity Fund", "Stock", "IP & Brand", "Startup / Raise", "Real Estate", "Infrastructure", "Art & Collectibles", "Carbon Credits", "Private Credit"].map(cls => (
                <span key={cls} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700">{cls}</span>
              ))}
            </div>
            <p className="mt-2">Enter a <strong>Token Name</strong> (e.g. "UK Gilt Bond 2026") and <strong>Ticker Symbol</strong> (e.g. "GILT26", max 10 chars).</p>
            <p>Select your <strong>Jurisdiction</strong> (GB, US, EU, SG, CH, AE, HK, JP, IN). This determines which compliance rules apply.</p>
            <p>Asset-class fields appear automatically: ISIN for stocks, royalty rate for IP, funding round for startups, property type for real estate, carbon standard for carbon credits.</p>
          </Step>
          <Step n={2} title="Wallet & Chain — Choose your network">
            <p>Connect your wallet if not already connected. The wallet status panel shows your address and connection state.</p>
            <p>Select the <strong>deployment network</strong> from the 6-network grid:</p>
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <table className="w-full text-[12px]">
                <thead><tr className="bg-neutral-50 border-b border-neutral-200"><th className="px-3 py-2 text-left text-neutral-600">Network</th><th className="px-3 py-2 text-left text-neutral-600">Type</th><th className="px-3 py-2 text-left text-neutral-600">Best For</th></tr></thead>
                <tbody className="divide-y divide-neutral-100">
                  {[["Ethereum", "Mainnet", "Maximum security, DeFi liquidity"], ["Polygon", "Mainnet", "Low fees, fast settlement"], ["Base", "Mainnet", "Coinbase ecosystem, low fees"], ["Sepolia", "Testnet", "Testing on Ethereum"], ["Amoy", "Testnet", "Testing on Polygon"], ["Hardhat", "Local", "Local development only"]].map(([n, t, d]) => (
                    <tr key={n}><td className="px-3 py-2 font-medium text-neutral-900">{n}</td><td className="px-3 py-2 text-neutral-500">{t}</td><td className="px-3 py-2 text-neutral-600">{d}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Step>
          <Step n={3} title="Listing Fee — Pay the one-time fee">
            <p>A one-time listing fee of <strong>$99 USD</strong> (+ gas) is required to create your token listing.</p>
            <p>Choose your payment method: <strong>USDC</strong>, <strong>USDT</strong>, or <strong>ETH</strong> (≈ 0.01 ETH).</p>
            <p>Click <strong>"Pay"</strong>. Once the on-chain payment confirms, you'll see a green confirmation and can proceed.</p>
            <Callout type="warning">The listing fee is non-refundable once the transaction confirms on-chain. Always verify the amount before signing.</Callout>
          </Step>
          <Step n={4} title="KYB Verification — Business identity check">
            <p>Fill in your <strong>Know Your Business (KYB)</strong> details. This is required by the ERC-3643 / T-REX compliance standard before any security token can be deployed.</p>
            <p>Required fields: <strong>Business Name</strong>, <strong>Registration Number</strong>, <strong>Business Address</strong>, <strong>Country of Incorporation</strong>, <strong>Director / Authorized Signatory Name</strong>.</p>
            <p>Upload your <strong>Business Certificate</strong> or <strong>Certificate of Incorporation</strong> (PDF, JPG, PNG, max 10MB).</p>
            <p>Click <strong>"Submit KYB Application"</strong>. Our compliance team reviews within <strong>1–2 business days</strong>.</p>
            <Callout type="tip">All KYB data is encrypted and stored under GDPR compliance. Your business information is never shared with third parties without your consent.</Callout>
          </Step>
          <Step n={5} title="Financials & Tokenomics — Structure your token">
            <p>Configure the financial parameters:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Total Asset Value (USD)</strong> — the total value of the underlying asset (e.g. $1,000,000)</li>
              <li><strong>Initial Token Supply</strong> — number of tokens to mint (e.g. 1,000,000). Token price = Value ÷ Supply</li>
              <li><strong>Annual Yield (%)</strong> — expected annualized return for investors</li>
              <li><strong>Maturity Date</strong> — when the asset matures or the round closes (leave blank for perpetual)</li>
              <li><strong>Minimum Investment (USD)</strong> — smallest amount an investor can purchase</li>
              <li><strong>Distribution Frequency</strong> — Monthly, Quarterly, Semi-Annual, Annual, On Exit, or None</li>
            </ul>
            <p className="mt-2">The <strong>Computed Tokenomics</strong> panel shows live calculations of token price, market cap, and estimated APY.</p>
          </Step>
          <Step n={6} title="Documents & Legal — Upload supporting files">
            <p>Assign the <strong>Legal Entity</strong> (e.g. "POLYCRUZ Capital Ltd") and <strong>Legal Counsel / Law Firm</strong> (e.g. "Allen & Overy LLP").</p>
            <p>Upload required documents:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Offering Memorandum / Prospectus</strong> (required) — the OM, prospectus, or private placement memorandum</li>
              <li><strong>Legal Opinion</strong> (required) — counsel's opinion on token classification</li>
              <li><strong>Audited Financials</strong> (optional) — last 2 years of annual reports or audited P&L</li>
            </ul>
            <p className="mt-2">All documents are automatically <strong>pinned to IPFS</strong> via Pinata and referenced immutably in the smart contract.</p>
            <p>Read and accept the <strong>Issuer Agreement</strong> and <strong>Terms of Service</strong> by clicking the checkbox.</p>
          </Step>
          <Step n={7} title="Review & Confirm — Final check before deploying">
            <p>Review the complete summary of all data entered across steps 1–6. The <strong>Pre-Launch Compliance Checklist</strong> verifies:</p>
            <div className="space-y-1.5 mt-2">
              {["Wallet connected", "Listing fee paid", "KYB details provided", "Financials configured", "Terms accepted", "Offering memo uploaded"].map(item => (
                <div key={item} className="flex items-center gap-2 text-[12px]"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{item}</div>
              ))}
            </div>
            <p className="mt-2">Confirm the <strong>deployment network</strong>. Read the on-chain warnings. Click <strong>"Deploy & Submit for Approval"</strong> and sign the transaction in your wallet.</p>
            <Callout type="warning">Deployment is irreversible. The smart contract is permanent on-chain. Double-check all parameters before signing.</Callout>
          </Step>
          <StepLast n={8} title="Launch — Your token is live">
            <p>After successful deployment, the <strong>Launch screen</strong> shows your token is live and under compliance review.</p>
            <p><strong>What happens next:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Compliance Review (1–2 business days)</li>
              <li>KYB Approval — business identity confirmed, issuer whitelisted</li>
              <li>Token Listed — appears on the investor marketplace</li>
              <li>Investor Distribution — whitelisted investors can purchase</li>
              <li>Yield Distributions — automated on-chain per your schedule</li>
            </ul>
            <p className="mt-2">View the transaction on <strong>Etherscan</strong> or navigate to <strong>My Issuances</strong> to manage your deployed token.</p>
          </StepLast>
        </div>
      </div>

      <Divider />

      {/* Compliance Center */}
      <div id="iss-compliance" className="scroll-mt-24">
        <SectionHeader icon={ShieldCheck} id="iss-compliance-h" title="Compliance Center" subtitle="Manage on-chain rules, sanctions screening, audit trails, and cross-jurisdiction logic." />

        <FeatureGrid items={[
          { icon: FileText, title: "Governance Rules", desc: "9 pre-configured rules covering KYC, AML, accreditation, transfer, reporting, and tax" },
          { icon: Globe2, title: "Sanctions Radar", desc: "Auto-synced against FATF, OFAC, EU, and UK HMT consolidated sanctions lists" },
          { icon: Clock, title: "Document Expiry", desc: "Track KYC/KYB certificate expiry with automated renewal reminders" },
          { icon: Eye, title: "Audit Ledger", desc: "Immutable on-chain log of every compliance action and admin event" },
          { icon: ArrowLeftRight, title: "Transfer Enforcement", desc: "Real-time whitelist checker and ERC-3643 transfer hook status" },
          { icon: MapPin, title: "Jurisdictions", desc: "MiFID II, FCA, MAS, ADGM, DIFC regulatory status and investor whitelist management" },
        ]} />

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-[13px] font-semibold text-neutral-950 mb-3">How Transfer Enforcement Works</p>
            <div className="space-y-3">
              {[
                { step: "1", text: "Investor attempts to transfer tokens to another address" },
                { step: "2", text: "ERC-3643 transfer hook intercepts the transaction" },
                { step: "3", text: "Compliance module checks: whitelist status, lockup period, holder limits, jurisdiction rules, sanctions" },
                { step: "4", text: "Transfer approved → executes atomically on-chain" },
                { step: "5", text: "Transfer blocked → transaction reverts automatically, no funds move" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3 text-[12px]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">{step}</span>
                  <span className="text-neutral-700">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <Callout type="tip">Use the <strong>Real-Time Whitelist Checker</strong> (Transfer Enforcement tab) to test any wallet address before an investor tries to transact. Enter any 0x address and click the search icon to instantly verify their status.</Callout>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-[13px] font-semibold text-neutral-950 mb-3">Jurisdiction Management</p>
            <p className="text-[12px] text-neutral-600 mb-3">Each regulatory regime has its own investor whitelist and transfer logic:</p>
            <div className="space-y-2 text-[12px]">
              {[
                { code: "MiFID II", flag: "🇪🇺", status: "Active", note: "EEA whitelist, €1,000 min, quarterly ESMA reporting" },
                { code: "FCA", flag: "🇬🇧", status: "Active", note: "UK whitelist, £500 min, CASS client asset segregation" },
                { code: "MAS", flag: "🇸🇬", status: "Active", note: "Accredited investors only, SGD 200K net worth" },
                { code: "ADGM", flag: "🇦🇪", status: "Pending", note: "FSRA application in progress" },
                { code: "DIFC", flag: "🇦🇪", status: "Pending", note: "DFSA Investment Token review Q3 2024" },
              ].map(j => (
                <div key={j.code} className="flex items-center justify-between rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{j.flag}</span>
                    <span className="font-semibold text-neutral-900">{j.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${j.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{j.status}</span>
                  </div>
                  <span className="text-neutral-500 text-[11px] max-w-[200px] text-right">{j.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Investor Management */}
      <div id="iss-investors" className="scroll-mt-24">
        <SectionHeader icon={Users} id="iss-investors-h" title="Investor Management" subtitle="Review KYC applications, manage whitelists, and control investor access." />

        <div className="space-y-0">
          <Step n={1} title="Navigate to Investors">
            <p>Go to <strong>Issuer Console → Investors</strong>. You'll see a table of all investors who have applied to access your tokens.</p>
          </Step>
          <Step n={2} title="Review KYC Applications">
            <p>Each investor row shows: wallet address, KYC tier, verification status, jurisdiction, and application date.</p>
            <p>KYC tiers: <strong>Tier 1</strong> (basic identity), <strong>Tier 2</strong> (enhanced ID + address), <strong>Tier 3</strong> (institutional / full AML).</p>
          </Step>
          <Step n={3} title="Approve or Reject">
            <p>Click <strong>"Approve"</strong> to whitelist the investor's wallet for your token. Click <strong>"Reject"</strong> to deny access. Approved investors are automatically added to the ERC-3643 whitelist on-chain.</p>
          </Step>
          <StepLast n={4} title="Manage the Whitelist">
            <p>You can revoke whitelist access at any time by clicking <strong>"Revoke"</strong> next to an approved investor. This immediately prevents them from making further transfers, enforced at the smart contract level.</p>
            <Callout type="warning">Revoking whitelist does not force-transfer existing tokens. The investor keeps their tokens but cannot trade or transfer until re-approved.</Callout>
          </StepLast>
        </div>
      </div>

      <Divider />

      {/* Cap Table */}
      <div id="iss-captable" className="scroll-mt-24">
        <SectionHeader icon={BarChart2} id="iss-captable-h" title="Cap Table" subtitle="View your full shareholder registry and token distribution in real time." />

        <p className="text-[13px] text-neutral-600 mb-4">The Cap Table is automatically generated from on-chain data. Every token transfer updates it in real time — no manual entry required.</p>

        <FeatureGrid items={[
          { icon: Users, title: "Holder Registry", desc: "Full list of all token holders with wallet address, balance, and % ownership" },
          { icon: TrendingUp, title: "Token Distribution", desc: "Visual breakdown of ownership concentration across all holders" },
          { icon: ArrowLeftRight, title: "Transfer History", desc: "Complete ledger of every token transfer since deployment" },
          { icon: DollarSign, title: "Distributions", desc: "Record of yield distributions and upcoming payment schedule" },
        ]} />

        <Callout type="tip" >To export your cap table as a CSV for legal or reporting purposes, use the <strong>"Export"</strong> button in the top-right of the Cap Table page.</Callout>
      </div>

      <Divider />

      {/* Treasury */}
      <div id="iss-treasury" className="scroll-mt-24">
        <SectionHeader icon={Landmark} id="iss-treasury-h" title="Treasury Console" subtitle="Manage reserves, yield products, and capital allocation from a single dashboard." />

        <div className="space-y-0">
          <Step n={1} title="View Your Treasury">
            <p>The Treasury overview shows: <strong>Ledger Balance</strong> (MPC vault balance), <strong>MTD Performance</strong>, <strong>Annualized Yield</strong>, and <strong>Vault Security Status</strong>.</p>
            <p>The <strong>Yield Performance Chart</strong> shows weekly APY history. Toggle between Weekly, Monthly, Quarterly, and Annual views.</p>
          </Step>
          <Step n={2} title="Reserve Composition">
            <p>The <strong>Donut Chart</strong> shows how your reserves are allocated across USDC-Institutional, Tokenized GBP, UK Treasury Bills, and Liquidity Buffers.</p>
          </Step>
          <Step n={3} title="Manage Yield Products">
            <p>View existing yield products (e.g. POLYCRUZ Gilt Fund at 4.82%, Prime Money Market at 5.12%) with APY, risk level, settlement time, provider, and deposited amount.</p>
            <p>Click <strong>"Manage Position"</strong> to adjust allocation to an existing product.</p>
          </Step>
          <StepLast n={4} title="Add a New Yield Product">
            <p>Click <strong>"Add Yield Product"</strong> in the top-right corner. Fill in the product name, APY (%), risk level, provider, and optional maturity date. Click <strong>"Add Product"</strong> — this triggers an on-chain transaction to register the product.</p>
          </StepLast>
        </div>
      </div>

      <Divider />

      {/* Liquidity Hub */}
      <div id="iss-liquidity" className="scroll-mt-24">
        <SectionHeader icon={Waves} id="iss-liquidity-h" title="Liquidity Hub" subtitle="Secondary market access, P2P transfers, collateral lending, and stablecoin settlement." />

        <div className="space-y-4">
          {[
            {
              tab: "Liquidity Pools",
              desc: "View active trading pairs (e.g. GILT26/USDC, CREDIT1/GBP). Each pool shows TVL, APR, and 24h volume. Click 'Add Liquidity' to contribute to a pool and earn trading fees.",
            },
            {
              tab: "P2P Orderbook",
              desc: "Browse open buy/sell orders from other institutional participants. Click 'Fill' on any order to execute a peer-to-peer trade directly between wallets.",
            },
            {
              tab: "Collateral & Lending",
              desc: "Lock tokens as collateral to access liquidity without selling. Monitor collateral ratio (healthy ≥ 150%) and borrow capacity. Assets below 110% collateral ratio show a warning — top up immediately.",
            },
            {
              tab: "Stablecoin Settlement",
              desc: "T+0 settlement panel. Select a token to swap, choose a stablecoin (USDC, USDT, PYUSD, EURC, GBPT), enter amount, and click 'Execute Swap'. Settlement is atomic and instant.",
            },
          ].map(({ tab, desc }) => (
            <div key={tab} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-[13px] font-semibold text-neutral-950 mb-1.5">{tab}</p>
              <p className="text-[13px] text-neutral-600">{desc}</p>
            </div>
          ))}
        </div>

        <Callout type="tip">The <strong>Stablecoin Settlement</strong> tab supports 5 settlement currencies: USDC, USDT, PYUSD (PayPal USD), EURC (Euro Coin), and GBPT (GBP Token). All swaps settle T+0 with instant finality — no counterparty risk.</Callout>
      </div>

      <Divider />

      {/* Settings */}
      <div id="iss-settings" className="scroll-mt-24">
        <SectionHeader icon={Lock} id="iss-settings-h" title="Settings & Custody" subtitle="Configure company info, MPC vault, multi-sig approvers, and Ledger hardware wallet." />

        <div className="space-y-0">
          <Step n={1} title="Company Information">
            <p>Go to <strong>Settings → Company Information</strong>. Update your <strong>Company Name</strong>, <strong>Registration Number</strong>, and <strong>Jurisdiction</strong>. Click <strong>"Save Settings"</strong>.</p>
          </Step>
          <Step n={2} title="Notifications & Webhooks">
            <p>Enter a <strong>Notification Email</strong> to receive alerts for KYC approvals, sanctions flags, and token events.</p>
            <p>Enter a <strong>Webhook URL</strong> to receive real-time event notifications (POST requests) to your own infrastructure.</p>
          </Step>
          <Step n={3} title="Security Toggles">
            <p>Three security controls can be toggled on/off:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Auto-whitelist approved KYC investors</strong> — automatically adds investors post-KYC approval</li>
              <li><strong>Require multisig for large transactions</strong> — transactions above threshold need multiple admin approvals</li>
              <li><strong>Enhanced audit logging</strong> — logs all admin actions to the on-chain audit trail</li>
            </ul>
          </Step>
          <Step n={4} title="MPC + Biometric Custody">
            <p>The <strong>MPC Vault</strong> uses Fireblocks-grade threshold signing (2-of-3 key shares required). Status is always shown as Active.</p>
            <p>Toggle <strong>Biometric Auth</strong> on/off — when enabled, FaceID/TouchID is required for all high-value approvals.</p>
          </Step>
          <Step n={5} title="Ledger Hardware Wallet">
            <p>Click <strong>"Pair Ledger"</strong> to pair your Ledger Nano X. Once paired, all transactions above £10,000 require hardware confirmation via your physical device.</p>
            <p>Click <strong>"Unpair"</strong> to remove hardware verification (not recommended for production).</p>
          </Step>
          <StepLast n={6} title="Multi-Sig Approvers">
            <p>View existing approvers (Primary and Secondary roles) with their wallet addresses. To add an approver: enter the wallet address and a label, then click <strong>"+ Add"</strong>.</p>
            <p>Click the trash icon next to any approver to remove them from the multi-sig configuration.</p>
            <Callout type="warning">Always maintain at least 2 approvers to prevent lockout. Removing all approvers disables multi-sig protection.</Callout>
          </StepLast>
        </div>
      </div>
    </div>
  );
}

// ─── Investor Guide content ────────────────────────────────────────────────

function InvestorGuide() {
  return (
    <div className="space-y-0">

      {/* Getting Started */}
      <div id="inv-start" className="scroll-mt-24">
        <SectionHeader icon={Rocket} id="inv-start-h" title="Getting Started" subtitle="Connect your wallet and enter the POLYCRUZ investor marketplace." />
        <div className="space-y-0">
          <Step n={1} title="Connect Your Wallet">
            <p>Visit <strong>POLYCRUZ.io</strong> and click <strong>"Enter Marketplace"</strong>. Connect a Web3 wallet: <strong>MetaMask, WalletConnect, Coinbase Wallet, Rainbow</strong>, or any WalletConnect-compatible wallet.</p>
            <Callout type="tip">You only need to complete KYC once. After approval, your verified status is stored and recognized across all future sessions.</Callout>
          </Step>
          <Step n={2} title="Select Investor Role">
            <p>On the Get Started page, select <strong>"I'm an Investor"</strong>. You'll be routed to the Investor Marketplace with access to the full asset catalog, your portfolio, and yield products.</p>
          </Step>
          <StepLast n={3} title="Navigate the Investor Dashboard">
            <p>The left sidebar provides access to all investor tools:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                ["Portfolio", "Your token holdings and performance"],
                ["Marketplace", "Browse all available RWA assets"],
                ["Yield", "Your yield earnings and distributions"],
                ["KYC", "Identity verification status"],
              ].map(([name, desc]) => (
                <div key={name} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[12px]">
                  <p className="font-semibold text-neutral-900">{name}</p>
                  <p className="text-neutral-500">{desc}</p>
                </div>
              ))}
            </div>
          </StepLast>
        </div>
      </div>

      <Divider />

      {/* KYC */}
      <div id="inv-kyc" className="scroll-mt-24">
        <SectionHeader icon={BadgeCheck} id="inv-kyc-h" title="KYC Verification" subtitle="Complete identity verification once to access all regulated assets on the platform." />

        <Callout type="warning">KYC is mandatory before you can invest in any asset. This is required by securities law and the ERC-3643 standard. Your personal data is encrypted and processed under GDPR.</Callout>

        <div className="mt-6 space-y-0">
          <Step n={1} title="Start KYC — Navigate to Investor → KYC">
            <p>Click <strong>"Begin Verification"</strong>. You'll start a 3-step KYC flow provided by our verification partners <strong>Onfido</strong> and <strong>Sumsub</strong>.</p>
          </Step>
          <Step n={2} title="Personal Identity Verification">
            <p>Provide: <strong>Full Name</strong>, <strong>Date of Birth</strong>, <strong>Nationality</strong>, <strong>Country of Residence</strong>.</p>
            <p>Upload a <strong>government-issued ID</strong>: passport, national ID card, or driver's licence. Both front and back may be required.</p>
            <p>Complete a <strong>liveness check</strong> (selfie or short video) to confirm the ID belongs to you.</p>
          </Step>
          <Step n={3} title="Address Verification">
            <p>Upload a <strong>proof of address</strong> document dated within 3 months: utility bill, bank statement, or official government letter.</p>
          </Step>
          <Step n={4} title="Accreditation (if applicable)">
            <p>For equity tokens and private credit, you may need to verify <strong>accredited investor status</strong>:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Upload a signed <strong>Accreditation Letter</strong> from a licensed broker, adviser, or attorney</li>
              <li>Or provide a <strong>Financial Statement</strong> showing net worth exceeding the jurisdiction threshold</li>
            </ul>
          </Step>
          <StepLast n={5} title="Review & Status">
            <p>KYC review typically completes within <strong>minutes to a few hours</strong> for standard cases, or up to <strong>1–2 business days</strong> for enhanced due diligence (EDD).</p>
            <p>Your KYC Tier is displayed on your dashboard: <strong>Tier 1</strong> (identity verified), <strong>Tier 2</strong> (identity + address verified), <strong>Tier 3</strong> (institutional / full AML).</p>
            <Callout type="tip">Higher KYC tiers unlock access to higher-risk asset classes and larger investment amounts. Complete Tier 3 to access Private Credit and Equity Fund tokens.</Callout>
          </StepLast>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-[13px] font-semibold text-neutral-950 mb-3">Document Requirements by KYC Tier</p>
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-neutral-100 border-b border-neutral-200"><th className="px-3 py-2 text-left text-neutral-600">Tier</th><th className="px-3 py-2 text-left text-neutral-600">Requirements</th><th className="px-3 py-2 text-left text-neutral-600">Asset Access</th></tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {[
                  ["Tier 1", "Name, DOB, Government ID, Liveness check", "Bonds, Commodities, Carbon Credits"],
                  ["Tier 2", "Tier 1 + Proof of Address", "All Tier 1 + Real Estate, Infrastructure"],
                  ["Tier 3", "Tier 2 + Accreditation Letter or Financial Statement", "All assets including Private Credit, Equity, Startup Raises"],
                ].map(([tier, req, access]) => (
                  <tr key={tier}><td className="px-3 py-2 font-semibold text-neutral-900">{tier}</td><td className="px-3 py-2 text-neutral-600">{req}</td><td className="px-3 py-2 text-neutral-600">{access}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Divider />

      {/* Marketplace */}
      <div id="inv-marketplace" className="scroll-mt-24">
        <SectionHeader icon={LayoutGrid} id="inv-marketplace-h" title="Marketplace" subtitle="Browse, filter, and research regulated RWA assets from institutional issuers." />

        <div className="space-y-0">
          <Step n={1} title="Browse the Asset Catalog">
            <p>Navigate to <strong>Investor → Marketplace</strong>. You'll see the full catalog of available tokens sorted by TVL by default.</p>
            <p>Each asset card shows: <strong>Symbol</strong>, <strong>Name</strong>, <strong>Issuer</strong>, <strong>Asset Class</strong>, <strong>Price</strong>, <strong>24h change</strong>, <strong>APY</strong>, <strong>TVL</strong>, <strong>Minimum Investment</strong>, <strong>Risk Rating</strong>, and <strong>Credit Rating</strong>.</p>
          </Step>
          <Step n={2} title="Filter and Sort">
            <p>Use the filter controls to narrow down assets by:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Asset Class</strong> — Sovereign Debt, Private Credit, Equities, Commodities, Real Estate</li>
              <li><strong>Risk Level</strong> — Minimal, Low, Medium, High</li>
              <li><strong>Jurisdiction</strong> — GB, US, EU, SG, CH</li>
              <li><strong>Minimum APY</strong> — filter by minimum yield</li>
            </ul>
          </Step>
          <Step n={3} title="View Asset Details">
            <p>Click any asset card to open the full detail view. You'll see:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Full description and asset backing structure</li>
              <li>Issuer information and custody provider</li>
              <li>Maturity date and distribution schedule</li>
              <li>Accepted settlement currencies (USDC, USDT, PYUSD, EURC, GBPT, ETH)</li>
              <li>Current holder count and on-chain TVL</li>
            </ul>
          </Step>
          <StepLast n={4} title="Check Eligibility">
            <p>Each asset has jurisdiction and KYC tier requirements. If your KYC tier doesn't meet the asset requirements, you'll see an <strong>"Upgrade KYC"</strong> prompt. Complete the additional verification steps to unlock access.</p>
          </StepLast>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-[13px] font-semibold text-neutral-950 mb-3">Available Asset Classes</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { icon: Landmark, label: "Sovereign Debt", apy: "3–6% APY" },
              { icon: Banknote, label: "Private Credit", apy: "7–14% APY" },
              { icon: TrendingUp, label: "Equities", apy: "8–20% APY" },
              { icon: Package, label: "Commodities", apy: "0–4% APY" },
              { icon: Home, label: "Real Estate", apy: "4–9% APY" },
              { icon: Leaf, label: "Carbon Credits", apy: "0–5% APY" },
            ].map(({ icon: Icon, label, apy }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <Icon className="h-4 w-4 text-neutral-600 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-neutral-900">{label}</p>
                  <p className="text-[11px] text-emerald-700">{apy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* Investing */}
      <div id="inv-investing" className="scroll-mt-24">
        <SectionHeader icon={DollarSign} id="inv-investing-h" title="Investing & Settlement" subtitle="Purchase tokens with stablecoins and settle instantly with T+0 finality." />

        <div className="space-y-0">
          <Step n={1} title="Select an Asset">
            <p>From the Marketplace, click on the asset you want to invest in. Review the full detail page including APY, risk rating, maturity, and issuer details.</p>
          </Step>
          <Step n={2} title="Enter Investment Amount">
            <p>Click <strong>"Invest Now"</strong>. Enter the amount you want to invest. The minimum investment amount is displayed on each asset card.</p>
            <p>The interface shows the number of tokens you'll receive and the total cost in your chosen settlement currency.</p>
          </Step>
          <Step n={3} title="Choose Settlement Currency">
            <p>Select your payment method from the supported stablecoins for that asset:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[["USDC", "🇺🇸"], ["USDT", "🇺🇸"], ["PYUSD", "🇺🇸"], ["EURC", "🇪🇺"], ["GBPT", "🇬🇧"], ["ETH", "⟠"]].map(([sym, flag]) => (
                <span key={sym} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12px] font-medium">{flag} {sym}</span>
              ))}
            </div>
            <p className="mt-2">Not all assets accept all currencies — check the asset's "Settlements" field to see which are available.</p>
          </Step>
          <Step n={4} title="Approve & Sign">
            <p>Click <strong>"Confirm Investment"</strong>. Your wallet will prompt you to:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Approve the stablecoin spend (if first time using that token)</li>
              <li>Sign the investment transaction</li>
            </ol>
          </Step>
          <StepLast n={5} title="T+0 Settlement">
            <p>Once your transaction is confirmed on-chain, tokens are <strong>instantly transferred to your wallet</strong>. There is no waiting period — settlement is T+0 with atomic finality.</p>
            <p>Your new tokens appear immediately in your <strong>Portfolio</strong> tab.</p>
            <Callout type="success">T+0 settlement means there's no counterparty risk. If the transaction fails for any reason, your funds are automatically returned — it's atomic.</Callout>
          </StepLast>
        </div>
      </div>

      <Divider />

      {/* Portfolio */}
      <div id="inv-portfolio" className="scroll-mt-24">
        <SectionHeader icon={TrendingUp} id="inv-portfolio-h" title="Portfolio Management" subtitle="Track your holdings, monitor performance, and manage your positions." />

        <FeatureGrid items={[
          { icon: Coins, title: "Token Holdings", desc: "View all your token balances with current market value and P&L" },
          { icon: TrendingUp, title: "Performance Chart", desc: "Track portfolio value over time with daily/weekly/monthly views" },
          { icon: DollarSign, title: "Yield Earned", desc: "Total yield received to date across all positions" },
          { icon: BarChart2, title: "Asset Allocation", desc: "Visual breakdown of your portfolio by asset class and jurisdiction" },
          { icon: Clock, title: "Maturity Schedule", desc: "Calendar view of upcoming maturity dates and redemption windows" },
          { icon: FileText, title: "Transaction History", desc: "Full record of all purchases, transfers, and distributions" },
        ]} />

        <div className="mt-4 space-y-3">
          <Callout type="tip">Click any asset in your portfolio to see its full detail view, including yield accrual, lockup status, and transfer eligibility.</Callout>
          <p className="text-[13px] text-neutral-600">To <strong>sell or transfer tokens</strong>, ensure the lockup period (if any) has expired and the destination wallet is on the issuer's whitelist. Transfers that fail compliance checks automatically revert.</p>
        </div>
      </div>

      <Divider />

      {/* Yield */}
      <div id="inv-yield" className="scroll-mt-24">
        <SectionHeader icon={Star} id="inv-yield-h" title="Yield & Returns" subtitle="Earn automated yield distributions on your token holdings." />

        <div className="space-y-0">
          <Step n={1} title="How Yield Works">
            <p>Yield is distributed <strong>automatically on-chain</strong> by the issuer's smart contract according to the distribution schedule (monthly, quarterly, semi-annual, or annual).</p>
            <p>Your proportional share is calculated based on your token balance at the <strong>distribution snapshot date</strong>.</p>
          </Step>
          <Step n={2} title="View Your Yield">
            <p>Go to <strong>Investor → Yield</strong> to see:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Total yield earned to date across all holdings</li>
              <li>Yield earned per asset with APY breakdown</li>
              <li>Upcoming distribution dates</li>
              <li>Historical distribution payments</li>
            </ul>
          </Step>
          <Step n={3} title="Claim Distributions">
            <p>For assets with <strong>claimable distributions</strong>, a <strong>"Claim"</strong> button appears when a payment is available. Click it to trigger the on-chain transfer of your yield to your wallet.</p>
            <p>Some assets use <strong>auto-distribution</strong> — yield is sent directly to your wallet without any action required.</p>
          </Step>
          <StepLast n={4} title="Yield Rates by Asset Class">
            <div className="overflow-hidden rounded-xl border border-neutral-200 mt-2">
              <table className="w-full text-[12px]">
                <thead><tr className="bg-neutral-50 border-b border-neutral-200"><th className="px-3 py-2 text-left text-neutral-600">Asset Class</th><th className="px-3 py-2 text-left text-neutral-600">Typical APY</th><th className="px-3 py-2 text-left text-neutral-600">Frequency</th></tr></thead>
                <tbody className="divide-y divide-neutral-100">
                  {[
                    ["Sovereign Debt", "3–6%", "Semi-annual / Annual"],
                    ["Private Credit", "7–14%", "Quarterly"],
                    ["Real Estate", "4–9%", "Quarterly"],
                    ["Infrastructure", "5–8%", "Semi-annual"],
                    ["Equity Fund", "8–20%", "On Exit / Annual"],
                    ["Commodities", "0–4%", "None (price appreciation)"],
                    ["Carbon Credits", "0–5%", "On Retirement"],
                  ].map(([cls, apy, freq]) => (
                    <tr key={cls}><td className="px-3 py-2 font-medium text-neutral-900">{cls}</td><td className="px-3 py-2 text-emerald-700 font-semibold">{apy}</td><td className="px-3 py-2 text-neutral-600">{freq}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StepLast>
        </div>
      </div>

      <Divider />

      {/* Security */}
      <div id="inv-security" className="scroll-mt-24">
        <SectionHeader icon={ShieldCheck} id="inv-security-h" title="Security & Compliance" subtitle="Understand your rights, transfer rules, and how to keep your assets safe." />

        <FeatureGrid items={[
          { icon: Lock, title: "ERC-3643 Protection", desc: "Every transfer is verified on-chain. Unauthorised movements are impossible." },
          { icon: Fingerprint, title: "Wallet Security", desc: "Use a hardware wallet for large positions. Never share your private key." },
          { icon: Clock, title: "Lockup Periods", desc: "Some assets have holding period requirements before tokens can be transferred." },
          { icon: RefreshCw, title: "KYC Renewal", desc: "KYC certificates expire annually. Renew promptly to avoid transfer restrictions." },
          { icon: Globe2, title: "Jurisdiction Restrictions", desc: "Tokens may not be transferable to wallets in restricted jurisdictions." },
          { icon: Eye, title: "On-Chain Transparency", desc: "All transactions are visible on-chain. Your holdings are verifiable independently." },
        ]} />

        <div className="mt-5 space-y-3">
          <Callout type="warning">If your KYC expires, your wallet is automatically removed from the whitelist and you cannot transfer tokens until you renew. Existing holdings are safe — you just cannot move them.</Callout>
          <Callout type="tip">Enable <strong>email notifications</strong> in your profile to receive alerts 30, 14, and 7 days before your KYC certificate expires.</Callout>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-[13px] font-semibold text-neutral-950 mb-3">If a Transfer Fails — Common Reasons</p>
            <div className="space-y-2 text-[12px]">
              {[
                { reason: "Wallet not whitelisted", fix: "Contact the issuer to request whitelist access" },
                { reason: "Lockup period active", fix: "Wait until the lockup period expires (check asset details)" },
                { reason: "KYC expired", fix: "Renew your KYC via Investor → KYC" },
                { reason: "Recipient wallet not whitelisted", fix: "Recipient must also complete KYC with the issuer" },
                { reason: "Jurisdiction blocked", fix: "The destination wallet's jurisdiction may be restricted for this asset" },
                { reason: "Max holder limit reached", fix: "The token has hit its maximum holder count. Contact the issuer." },
              ].map(({ reason, fix }) => (
                <div key={reason} className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-3 py-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /><span className="text-neutral-800 font-medium">{reason}</span></div>
                  <span className="text-neutral-500 text-right shrink-0">{fix}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [role, setRole] = useState<DocRole>("issuer");
  const [activeSection, setActiveSection] = useState<string>("");

  const sections = role === "issuer" ? ISSUER_SECTIONS : INVESTOR_SECTIONS;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <MarketingNav />

      {/* Hero banner */}
      <div className="border-b border-neutral-200 bg-neutral-950 py-14 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-[11px] font-medium text-white/50 mb-4">
            <Link href="/" className="hover:text-white/80 transition">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/80">Documentation</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-white tracking-tight">Platform Documentation</h1>
              <p className="text-[14px] text-white/60 mt-0.5">Step-by-step guides for Issuers and Investors</p>
            </div>
          </div>
          {/* Role switcher */}
          <div className="mt-6 inline-flex rounded-xl border border-white/20 bg-white/10 p-1">
            <button
              onClick={() => setRole("issuer")}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-medium transition-all ${role === "issuer" ? "bg-white text-neutral-950" : "text-white/70 hover:text-white"}`}
            >
              <Building2 className="h-4 w-4" /> Issuer Guide
            </button>
            <button
              onClick={() => setRole("investor")}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-medium transition-all ${role === "investor" ? "bg-white text-neutral-950" : "text-white/70 hover:text-white"}`}
            >
              <Wallet className="h-4 w-4" /> Investor Guide
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex gap-10">

          {/* Sticky Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {role === "issuer" ? "Issuer" : "Investor"} Guide
              </p>
              {sections.map(({ id, title, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-all ${
                    activeSection === id
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{title}</span>
                  {badge && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      activeSection === id ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-[11px] font-semibold text-neutral-700 mb-2">Quick Links</p>
                <div className="space-y-1.5">
                  <Link href={role === "issuer" ? "/issuer/studio" : "/investor/market"} className="flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-950">
                    <ArrowRight className="h-3 w-3" />
                    {role === "issuer" ? "Launch Studio" : "Open Marketplace"}
                  </Link>
                  <Link href="/get-started" className="flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-950">
                    <ArrowRight className="h-3 w-3" /> Get Started
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile section selector */}
          <div className="mb-6 lg:hidden w-full">
            <select
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
              onChange={(e) => scrollTo(e.target.value)}
            >
              {sections.map(({ id, title }) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </div>

          {/* Main doc content */}
          <main className="min-w-0 flex-1">
            {/* CTA row */}
            <div className="mb-8 flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4">
              <div>
                <p className="text-[13px] font-semibold text-neutral-950">
                  {role === "issuer" ? "Ready to tokenize an asset?" : "Ready to invest?"}
                </p>
                <p className="text-[12px] text-neutral-500 mt-0.5">
                  {role === "issuer" ? "Launch the Issuer Console and deploy your first token." : "Complete KYC and access the full marketplace."}
                </p>
              </div>
              <Link
                href={role === "issuer" ? "/issuer/studio" : "/get-started?role=investor"}
                className="flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-[13px] font-medium text-white hover:bg-neutral-800 transition shrink-0"
              >
                {role === "issuer" ? "Open Studio" : "Start KYC"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Guide content */}
            {role === "issuer" ? <IssuerGuide /> : <InvestorGuide />}

            {/* Bottom CTA */}
            <div className="mt-12 rounded-2xl bg-neutral-950 p-8 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-3">Need help?</p>
              <h3 className="text-[20px] font-bold text-white">Can't find what you're looking for?</h3>
              <p className="mt-2 text-[13px] text-white/60">Our team is available 24/7 for institutional clients. Book a briefing or email support.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a href="mailto:support@POLYCRUZ.io" className="rounded-full border border-white/25 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-white/10 transition">
                  Email Support
                </a>
                <Link href="/get-started" className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-neutral-950 hover:bg-neutral-100 transition">
                  Book a Briefing
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
