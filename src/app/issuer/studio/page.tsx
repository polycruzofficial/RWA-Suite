"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { useDeployToken, useIssuerTokens, usePlatformFeeConfig, usePayDeploymentFee } from "@/hooks/useContracts";
import { isChainDeployed } from "@/config/contracts";
import { DEPLOYMENT_NETWORKS, getChainName, getExplorerTxUrl } from "@/config/chains";
import { uploadJSONToIPFS } from "@/lib/ipfs";
import { saveAsset } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";
import type { LucideIcon } from "lucide-react";
import {
  Coins, FileText, Globe, DollarSign, Calendar, Percent, Hash,
  Loader2, CheckCircle2, AlertTriangle, ChevronRight, Building2,
  Landmark, Package, TrendingUp, BarChart2, Lightbulb, Rocket, Home,
  Zap, Palette, Leaf, Banknote, CreditCard, ExternalLink, Wallet,
  LayoutGrid, List, Plus, ArrowRight, ShieldCheck, Upload, BadgeCheck,
  Clock, Send, Link2, Users, FileCheck2, Fingerprint, Star,
  ChevronLeft, Check, RefreshCw,
} from "lucide-react";

// ─── Asset class registry ──────────────────────────────────────────────────

type AssetClass =
  | "bond" | "credit" | "commodity" | "equity"
  | "stock" | "ip" | "startup" | "real_estate"
  | "infrastructure" | "art" | "carbon" | "private_credit";

type StudioTab = "create" | "catalog" | "issuances";

interface ClassMeta {
  label: string;
  short: string;
  icon: LucideIcon;
  marketSize: string;
  yieldRange: string;
  examples: string[];
  badge?: "New" | "Hot";
}

const CLASS_META: Record<AssetClass, ClassMeta> = {
  bond: {
    label: "Bond",
    short: "Fixed-income, gilts, treasury bills",
    icon: Landmark,
    marketSize: "$133T",
    yieldRange: "3–6%",
    examples: ["UK Gilt 2026", "US T-Bill", "EM Sovereign Bond"],
  },
  credit: {
    label: "Credit",
    short: "Loan pools, receivables, CLOs",
    icon: CreditCard,
    marketSize: "$9.8T",
    yieldRange: "5–12%",
    examples: ["Trade Finance", "Invoice Receivable", "Revolver"],
  },
  commodity: {
    label: "Commodity",
    short: "Metals, energy, agricultural products",
    icon: Package,
    marketSize: "$26T",
    yieldRange: "0–4%",
    examples: ["Gold Vault", "Brent Crude", "Wheat Basket"],
  },
  equity: {
    label: "Equity Fund",
    short: "LP tokens, fund interests, PE shares",
    icon: TrendingUp,
    marketSize: "$14T",
    yieldRange: "8–20%",
    examples: ["PE Fund LP", "VC Carry Token", "SPAC Unit"],
  },
  stock: {
    label: "Stock",
    short: "Listed & unlisted company shares",
    icon: BarChart2,
    marketSize: "$109T",
    yieldRange: "2–8%",
    examples: ["Apple Mirror", "Private Co. Share", "ADR Token"],
    badge: "New",
  },
  ip: {
    label: "IP & Brand",
    short: "Patents, trademarks, royalty streams",
    icon: Lightbulb,
    marketSize: "$73T",
    yieldRange: "4–15%",
    examples: ["Drug Patent", "Music Royalty", "Brand License"],
    badge: "New",
  },
  startup: {
    label: "Startup / Raise",
    short: "SAFEs, convertibles, equity rounds",
    icon: Rocket,
    marketSize: "$650B",
    yieldRange: "10–100×",
    examples: ["Seed SAFE", "Series A Token", "DAO Membership"],
    badge: "New",
  },
  real_estate: {
    label: "Real Estate",
    short: "Commercial & residential property, REITs",
    icon: Home,
    marketSize: "$326T",
    yieldRange: "4–9%",
    examples: ["Mayfair Office", "NYC Residential", "Logistics REIT"],
  },
  infrastructure: {
    label: "Infrastructure",
    short: "Toll roads, renewables, utilities",
    icon: Zap,
    marketSize: "$15T",
    yieldRange: "5–8%",
    examples: ["Solar Farm", "Airport Bond", "Broadband Grid"],
  },
  art: {
    label: "Art & Collectibles",
    short: "Fine art, luxury assets, rare collectibles",
    icon: Palette,
    marketSize: "$1.7T",
    yieldRange: "6–20%",
    examples: ["Picasso Frac.", "Classic Car", "Rare Watch"],
    badge: "New",
  },
  carbon: {
    label: "Carbon Credits",
    short: "VCUs, Gold Standard, nature-based offsets",
    icon: Leaf,
    marketSize: "$2B",
    yieldRange: "0–5%",
    examples: ["REDD+ Forest", "Solar VCU", "Soil Carbon"],
  },
  private_credit: {
    label: "Private Credit",
    short: "Direct lending, mezz debt, structured credit",
    icon: Banknote,
    marketSize: "$1.7T",
    yieldRange: "8–14%",
    examples: ["Senior Secured", "Mezzanine Tranche", "NAV Facility"],
    badge: "Hot",
  },
};

// ─── Form types ────────────────────────────────────────────────────────────

interface TokenForm {
  // Step 1: Asset Information
  name: string;
  symbol: string;
  assetClass: AssetClass;
  jurisdiction: string;
  description: string;
  isin: string;
  royaltyRate: string;
  fundingRound: string;
  equityStake: string;
  propertyType: string;
  carbonStandard: string;
  // Step 4: KYB Verification
  businessName: string;
  registrationNumber: string;
  businessAddress: string;
  incorporationCountry: string;
  directorName: string;
  // Step 5: Financials & Tokenomics
  totalValueUSD: string;
  maturityDate: string;
  yieldBps: string;
  initialSupply: string;
  minInvestmentUSD: string;
  distributionFrequency: string;
  riskRating: string;
  // Step 6: Documents & Legal
  legalEntity: string;
  legalCounsel: string;
  offeringMemoName: string;
  legalOpinionName: string;
  financialsName: string;
}

const defaultForm: TokenForm = {
  name: "",
  symbol: "",
  assetClass: "bond",
  jurisdiction: "GB",
  description: "",
  isin: "",
  royaltyRate: "",
  fundingRound: "seed",
  equityStake: "",
  propertyType: "commercial",
  carbonStandard: "VCS",
  businessName: "",
  registrationNumber: "",
  businessAddress: "",
  incorporationCountry: "GB",
  directorName: "",
  totalValueUSD: "",
  maturityDate: "",
  yieldBps: "",
  initialSupply: "",
  minInvestmentUSD: "",
  distributionFrequency: "quarterly",
  riskRating: "low",
  legalEntity: "",
  legalCounsel: "",
  offeringMemoName: "",
  legalOpinionName: "",
  financialsName: "",
};

// Testnets / local — kept separate from the live mainnet grid in Step 2 since
// they never carry a real listing fee and are for testing only.
const TEST_CHAINS = [
  { id: 11155111, short: "Sepolia" },
  { id: 80002, short: "Amoy" },
  { id: 31337, short: "Hardhat" },
];

const WIZARD_STEPS = [
  { n: 1, label: "Asset Info", icon: FileText },
  { n: 2, label: "Wallet & Chain", icon: Wallet },
  { n: 3, label: "Listing Fee", icon: DollarSign },
  { n: 4, label: "KYB", icon: BadgeCheck },
  { n: 5, label: "Financials", icon: TrendingUp },
  { n: 6, label: "Documents", icon: Upload },
  { n: 7, label: "Review", icon: ShieldCheck },
  { n: 8, label: "Launch", icon: Rocket },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-neutral-800">{label}</label>
      {hint && <p className="mb-1.5 text-[11px] text-neutral-500">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 px-4 text-[13px] text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20";

const inputWithIconCls =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-4 text-[13px] text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20";

function IconInput({
  icon: Icon,
  ...props
}: { icon: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
      <input className={inputWithIconCls} {...props} />
    </div>
  );
}

function IconSelect({
  icon: Icon,
  children,
  ...props
}: { icon: LucideIcon } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      <select className={`${inputWithIconCls} appearance-none`} {...props}>
        {children}
      </select>
    </div>
  );
}

function StepHeader({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-[13px] font-bold text-white">
        {n}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-950">{title}</h3>
        <p className="text-[12px] text-neutral-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  nextIcon,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextIcon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-5 py-2.5 text-[13px] font-medium text-neutral-800 hover:bg-neutral-50">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      )}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="btn-primary">
          {nextLabel}
          {nextIcon ?? <ChevronRight className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

// ─── Page component ────────────────────────────────────────────────────────

export default function StudioPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { deploy, hash, isPending, isConfirming, isSuccess, error } = useDeployToken();
  const { data: issuerTokens } = useIssuerTokens(address);

  const feeConfig = usePlatformFeeConfig();
  const {
    payDeploymentFee,
    hash: feeHash,
    isPending: isFeePending,
    isConfirming: isFeeConfirming,
    isSuccess: isFeeSuccess,
    error: feeError,
  } = usePayDeploymentFee();

  const [tab, setTab] = useState<StudioTab>("create");
  const [form, setForm] = useState<TokenForm>(defaultForm);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [feePaid, setFeePaid] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [kybSubmitted, setKybSubmitted] = useState(false);

  const update = (field: keyof TokenForm, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  // Real listing fee (if PlatformFeeManager is deployed on the connected
  // chain) — inert everywhere until you deploy that contract and set its
  // address, at which point issuers actually pay it on-chain before deploying.
  const deploymentFeeWei = feeConfig.isDeployed ? ((feeConfig.deploymentFeeWei.data as bigint | undefined) ?? 0n) : 0n;
  const feeRequired = feeConfig.isDeployed && deploymentFeeWei > 0n;
  const chainLive = isChainDeployed(chainId);
  const currentNetwork = DEPLOYMENT_NETWORKS.find((n) => n.id === chainId);

  useEffect(() => {
    if (isFeeSuccess && !feePaid) setFeePaid(true);
  }, [isFeeSuccess, feePaid]);

  // Reset the fee-paid flag if the issuer switches chains mid-flow — the fee
  // (or lack of one) is chain-specific.
  useEffect(() => {
    setFeePaid(false);
  }, [chainId]);

  const handleDeploy = async () => {
    if (!address) return;
    try {
      setIsUploading(true);
      let ipfsHash = "";
      try {
        ipfsHash = await uploadJSONToIPFS(
          { ...form, createdAt: new Date().toISOString() },
          `${form.symbol}-metadata`
        );
      } catch {
        ipfsHash = "placeholder-configure-pinata";
      }
      setIsUploading(false);

      const maturityTs = form.maturityDate
        ? BigInt(Math.floor(new Date(form.maturityDate).getTime() / 1000))
        : 0n;

      deploy({
        name: form.name,
        symbol: form.symbol,
        assetType: form.assetClass,
        jurisdiction: form.jurisdiction,
        ipfsDocHash: ipfsHash,
        totalValueUSD: parseEther(form.totalValueUSD || "0"),
        maturityDate: maturityTs,
        yieldBps: BigInt(Math.round(parseFloat(form.yieldBps || "0") * 100)),
        initialSupply: parseUnits(form.initialSupply || "0", 18),
      });

      try {
        await saveAsset({
          token_address: "pending-" + Date.now(),
          issuer_address: address,
          name: form.name,
          symbol: form.symbol,
          asset_type: form.assetClass,
          jurisdiction: form.jurisdiction,
          description: form.description,
          legal_entity: form.legalEntity,
          ipfs_doc_hash: ipfsHash,
          total_value_usd: parseFloat(form.totalValueUSD || "0"),
          maturity_date: form.maturityDate || null,
          yield_bps: Math.round(parseFloat(form.yieldBps || "0") * 100),
          risk_rating: form.riskRating,
          chain_id: chainId,
        });
      } catch {
        console.warn("Supabase save skipped — configure credentials");
      }
    } catch {
      setIsUploading(false);
    }
  };

  const handleDeploySubmit = async () => {
    if (feeRequired && !feePaid) {
      payDeploymentFee(form.symbol, deploymentFeeWei);
      return;
    }
    await handleDeploy();
    if (!error) setStep(8);
  };

  // Step gate conditions
  const canStep1 = !!(form.name && form.symbol);
  const canStep2 = isConnected;
  const canStep4 = !!(form.businessName && form.registrationNumber && form.directorName);
  const canStep5 = !!(form.totalValueUSD && form.initialSupply);
  const canDeploy = canStep1 && isConnected && canStep4 && canStep5 && termsAccepted && chainLive;

  const tokens = (issuerTokens as Array<{
    name: string; symbol: string; assetType: string;
    tokenAddress: string; active: boolean; deployedAt: bigint;
  }>) || [];

  const meta = CLASS_META[form.assetClass];
  const MetaIcon = meta.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="display-lg text-neutral-950">Tokenization Studio</h2>
          <p className="mt-1 text-[14px] text-neutral-600">
            Create and deploy regulated security tokens backed by real-world assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-700">
                <span className={`h-1.5 w-1.5 rounded-full ${chainLive ? "bg-emerald-500" : "bg-amber-500"}`} />
                {getChainName(chainId)}
              </span>
              <StatusBadge status={`${tokens.length} deployed`} variant="info" />
            </>
          ) : (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-800">
              Wallet not connected
            </span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-neutral-200">
        {(
          [
            { id: "create" as StudioTab, label: "Create Token", icon: Plus },
            { id: "catalog" as StudioTab, label: "Asset Catalog", icon: LayoutGrid },
            { id: "issuances" as StudioTab, label: "My Issuances", icon: List },
          ]
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-[13px] font-medium transition-colors ${
              tab === id
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ══ TAB: CREATE TOKEN ═══════════════════════════════════════════════ */}
      {tab === "create" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form column */}
          <div className="col-span-2 space-y-5">

            {/* ── 8-Step Progress Indicator ── */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center">
                {WIZARD_STEPS.map(({ n, label, icon: SIcon }, i) => (
                  <div key={n} className="flex flex-1 items-center">
                    <button
                      onClick={() => n < step && setStep(n)}
                      className="flex flex-col items-center gap-1"
                      style={{ minWidth: 0 }}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                        step > n
                          ? "bg-emerald-500 text-white"
                          : step === n
                          ? "bg-neutral-950 text-white ring-4 ring-neutral-950/10"
                          : "bg-neutral-100 text-neutral-400"
                      }`}>
                        {step > n ? <CheckCircle2 className="h-4 w-4" /> : <SIcon className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`hidden text-[9px] font-medium sm:block truncate max-w-[52px] text-center leading-tight ${
                        step === n ? "text-neutral-950" : step > n ? "text-emerald-600" : "text-neutral-400"
                      }`}>
                        {label}
                      </span>
                    </button>
                    {i < WIZARD_STEPS.length - 1 && (
                      <div className={`mx-1 h-px flex-1 transition-colors ${step > n ? "bg-emerald-300" : "bg-neutral-200"}`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-neutral-500">
                Step {step} of 8 — <span className="font-medium text-neutral-700">{WIZARD_STEPS[step - 1]?.label}</span>
              </p>
            </div>

            {/* ── Step 1: Asset Information ── */}
            {step === 1 && (
              <div className="card p-6 space-y-5">
                <StepHeader n={1} title="Asset Information" subtitle="Start by defining your asset's core details." />

                {/* Asset class grid */}
                <div>
                  <label className="mb-3 block text-[12px] font-medium text-neutral-800">Asset Class</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {(Object.keys(CLASS_META) as AssetClass[]).map((cls) => {
                      const { label, short, icon: ClsIcon, badge } = CLASS_META[cls];
                      const active = form.assetClass === cls;
                      return (
                        <button
                          key={cls}
                          onClick={() => update("assetClass", cls)}
                          className={`relative flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
                            active
                              ? "border-neutral-950 bg-neutral-950 text-white"
                              : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-white"
                          }`}
                        >
                          {badge && (
                            <span className={`absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                              badge === "Hot" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                            }`}>
                              {badge}
                            </span>
                          )}
                          <ClsIcon className={`h-5 w-5 ${active ? "text-white" : "text-neutral-500"}`} />
                          <p className={`text-[12px] font-semibold leading-none ${active ? "text-white" : "text-neutral-900"}`}>{label}</p>
                          <p className={`text-[10px] leading-tight ${active ? "text-white/70" : "text-neutral-500"}`}>{short}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Token Name">
                    <IconInput icon={FileText} type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={meta.examples[0]} />
                  </Field>
                  <Field label="Ticker Symbol">
                    <IconInput icon={Hash} type="text" value={form.symbol} onChange={(e) => update("symbol", e.target.value.toUpperCase())} placeholder="GILT26" maxLength={10} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Jurisdiction">
                    <IconSelect icon={Globe} value={form.jurisdiction} onChange={(e) => update("jurisdiction", e.target.value)}>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="EU">European Union</option>
                      <option value="SG">Singapore</option>
                      <option value="CH">Switzerland</option>
                      <option value="AE">UAE / DIFC</option>
                      <option value="HK">Hong Kong</option>
                      <option value="JP">Japan</option>
                      <option value="IN">India (GIFT City)</option>
                    </IconSelect>
                  </Field>
                  <Field label="Risk Rating">
                    <select className={inputCls} value={form.riskRating} onChange={(e) => update("riskRating", e.target.value)}>
                      <option value="minimal">Minimal</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </Field>
                </div>

                {/* Asset-class-specific fields */}
                {form.assetClass === "stock" && (
                  <Field label="ISIN (optional)">
                    <input className={`${inputCls} font-mono`} value={form.isin} onChange={(e) => update("isin", e.target.value.toUpperCase())} placeholder="US0378331005" maxLength={12} />
                  </Field>
                )}
                {form.assetClass === "ip" && (
                  <Field label="Royalty Rate (% / year)">
                    <input className={inputCls} type="number" step="0.1" value={form.royaltyRate} onChange={(e) => update("royaltyRate", e.target.value)} placeholder="8.5" />
                  </Field>
                )}
                {form.assetClass === "startup" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Funding Round">
                      <select className={inputCls} value={form.fundingRound} onChange={(e) => update("fundingRound", e.target.value)}>
                        <option value="pre_seed">Pre-Seed</option>
                        <option value="seed">Seed</option>
                        <option value="series_a">Series A</option>
                        <option value="series_b">Series B</option>
                        <option value="series_c">Series C+</option>
                        <option value="growth">Growth / Late Stage</option>
                        <option value="safe">SAFE Note</option>
                        <option value="convertible">Convertible Note</option>
                      </select>
                    </Field>
                    <Field label="Equity Stake (%)">
                      <input className={inputCls} type="number" step="0.01" value={form.equityStake} onChange={(e) => update("equityStake", e.target.value)} placeholder="15.0" />
                    </Field>
                  </div>
                )}
                {form.assetClass === "real_estate" && (
                  <Field label="Property Type">
                    <select className={inputCls} value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
                      <option value="commercial">Commercial Office</option>
                      <option value="retail">Retail / High Street</option>
                      <option value="residential">Residential</option>
                      <option value="industrial">Industrial / Logistics</option>
                      <option value="hospitality">Hospitality / Hotel</option>
                      <option value="land">Land / Development</option>
                    </select>
                  </Field>
                )}
                {form.assetClass === "carbon" && (
                  <Field label="Carbon Standard">
                    <select className={inputCls} value={form.carbonStandard} onChange={(e) => update("carbonStandard", e.target.value)}>
                      <option value="VCS">Verra VCS</option>
                      <option value="GS">Gold Standard</option>
                      <option value="CAR">Climate Action Reserve</option>
                      <option value="ACR">American Carbon Registry</option>
                    </select>
                  </Field>
                )}

                <Field label="Short Description" hint="Describe this asset — structure, backing, key terms.">
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder={`Describe this ${meta.label} token…`} rows={3}
                    className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[13px] text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950/20" />
                </Field>

                <NavButtons onNext={() => setStep(2)} nextDisabled={!canStep1} nextLabel="Continue to Wallet & Chain" />
              </div>
            )}

            {/* ── Step 2: Wallet & Chain ── */}
            {step === 2 && (
              <div className="card p-6 space-y-5">
                <StepHeader n={2} title="Wallet & Chain" subtitle="Connect your wallet and choose the network for tokenization." />

                {/* Wallet status */}
                <div className={`rounded-xl border p-5 ${isConnected ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isConnected ? "bg-emerald-500" : "bg-amber-400"}`}>
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-[14px] font-semibold ${isConnected ? "text-emerald-900" : "text-amber-900"}`}>
                        {isConnected ? "Wallet Connected" : "Wallet Not Connected"}
                      </p>
                      {isConnected ? (
                        <p className="text-[12px] text-emerald-700 font-mono">{address}</p>
                      ) : (
                        <p className="text-[12px] text-amber-700">Click "Connect Wallet" in the top-right corner to proceed.</p>
                      )}
                    </div>
                    {isConnected && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />}
                  </div>
                </div>

                {/* Chain selector — live mainnets */}
                <div>
                  <label className="mb-3 block text-[12px] font-medium text-neutral-800">Select Deployment Network</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {DEPLOYMENT_NETWORKS.map((network) => {
                      const deployed = isChainDeployed(network.id);
                      const selected = chainId === network.id;
                      return (
                        <button
                          key={network.id}
                          onClick={() => switchChain?.({ chainId: network.id })}
                          className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                            selected
                              ? "border-neutral-950 bg-neutral-950 text-white"
                              : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-white"
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <p className={`text-[13px] font-semibold ${selected ? "text-white" : "text-neutral-900"}`}>{network.shortName}</p>
                            {selected && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            deployed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          } ${selected ? "bg-white/20 text-white/80" : ""}`}>
                            {deployed ? "Live" : "Not deployed"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mb-2 mt-4 text-[11px] font-medium text-neutral-500">Testnets & local (for testing)</p>
                  <div className="flex flex-wrap gap-2">
                    {TEST_CHAINS.map((chain) => (
                      <button
                        key={chain.id}
                        onClick={() => switchChain?.({ chainId: chain.id })}
                        className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors ${
                          chainId === chain.id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        {chain.short}
                        {isChainDeployed(chain.id) && <span className="ml-1.5 text-emerald-400">●</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected chain info */}
                {isConnected && (
                  chainLive ? (
                    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[12px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="text-neutral-700">Tokens will be deployed on <span className="font-semibold text-neutral-950">{getChainName(chainId)}</span>. Smart contracts will be ERC-3643 compliant.</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Contracts aren't deployed on <span className="font-semibold">{getChainName(chainId)}</span> yet — deployment stays disabled until they go live here.
                      </span>
                    </div>
                  )
                )}

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2 text-[12px] text-neutral-600">
                  {[
                    "All transfers enforce on-chain compliance automatically",
                    "Metadata pinned to IPFS via Pinata",
                    "Off-chain registry stored in Supabase",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {t}
                    </div>
                  ))}
                </div>

                <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!canStep2} nextLabel="Continue to Listing Fee" />
              </div>
            )}

            {/* ── Step 3: Listing Fee ── */}
            {step === 3 && (
              <div className="card p-6 space-y-5">
                <StepHeader n={3} title="Listing Fee" subtitle="Pay the one-time listing fee to proceed with tokenization." />

                {!feeRequired ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold text-neutral-950">No Listing Fee Required</p>
                      <p className="mt-1 text-[13px] text-neutral-500">
                        {feeConfig.isDeployed
                          ? "The platform fee manager on this network currently charges no deployment fee."
                          : `No platform fee manager is configured on ${getChainName(chainId)} yet — you can continue for free.`}
                      </p>
                    </div>
                  </div>
                ) : feePaid ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold text-neutral-950">Payment Confirmed</p>
                      <p className="mt-1 text-[13px] text-neutral-500">Your listing fee has been received on-chain. Proceed to KYB verification.</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-[12px] text-emerald-800">
                      Tx confirmed • {(Number(deploymentFeeWei) / 1e18).toFixed(6)} {currentNetwork?.nativeCurrency ?? "ETH"} paid
                      {feeHash && getExplorerTxUrl(chainId, feeHash) && (
                        <>
                          {" "}
                          <a href={getExplorerTxUrl(chainId, feeHash)} target="_blank" rel="noopener noreferrer" className="underline">
                            View transaction
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Fee breakdown */}
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-3">
                      <p className="text-[12px] font-semibold text-neutral-800 uppercase tracking-wide">Fee Breakdown</p>
                      {[
                        { label: "Token Listing Fee", amount: `${(Number(deploymentFeeWei) / 1e18).toFixed(6)} ${currentNetwork?.nativeCurrency ?? "ETH"}` },
                        { label: "IPFS Document Storage", amount: "$0.00" },
                        { label: "Compliance Registry", amount: "$0.00" },
                        { label: "Smart Contract Deployment", amount: "Gas only" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-[13px]">
                          <span className="text-neutral-600">{item.label}</span>
                          <span className="font-medium text-neutral-950">{item.amount}</span>
                        </div>
                      ))}
                      <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
                        <span className="text-[14px] font-bold text-neutral-950">Total</span>
                        <span className="text-[14px] font-bold text-neutral-950">{(Number(deploymentFeeWei) / 1e18).toFixed(6)} {currentNetwork?.nativeCurrency ?? "ETH"} + gas</span>
                      </div>
                    </div>

                    <p className="text-center text-[11px] text-neutral-500">
                      Paid in {currentNetwork?.nativeCurrency ?? "the chain's native currency"} directly to the platform's fee manager contract — one on-chain transaction, no card or off-chain processor.
                    </p>

                    {isFeePending && <TxStatus icon={Loader2} spin text="Waiting for wallet confirmation…" cls="text-amber-700" />}
                    {isFeeConfirming && <TxStatus icon={Loader2} spin text="Confirming fee payment on-chain…" cls="text-neutral-950" />}
                    {feeError && (
                      <div className="flex items-start gap-2 text-[12px] text-red-700">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {feeError.message.slice(0, 180)}
                      </div>
                    )}

                    <button
                      onClick={() => payDeploymentFee(form.symbol, deploymentFeeWei)}
                      disabled={!isConnected || !chainLive || isFeePending || isFeeConfirming}
                      className="btn-primary w-full justify-center disabled:opacity-50"
                    >
                      <DollarSign className="h-4 w-4" />
                      Pay {(Number(deploymentFeeWei) / 1e18).toFixed(6)} {currentNetwork?.nativeCurrency ?? "ETH"} — On-Chain
                    </button>

                    <p className="text-center text-[11px] text-neutral-500">
                      Payment is processed on-chain. One-time fee — not recurring.
                    </p>
                  </>
                )}

                <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={feeRequired && !feePaid} nextLabel="Continue to KYB" />
              </div>
            )}

            {/* ── Step 4: KYB Verification ── */}
            {step === 4 && (
              <div className="card p-6 space-y-5">
                <StepHeader n={4} title="KYB Verification" subtitle="Provide your official business details for Know Your Business verification." />

                {kybSubmitted ? (
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                      <Clock className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-neutral-950">KYB Submitted</p>
                      <p className="mt-1 text-[13px] text-neutral-500">Our compliance team is reviewing your business details. This typically takes 1–2 business days.</p>
                    </div>
                    <StatusBadge status="Under Review" variant="info" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] text-blue-800">
                      <p className="font-medium mb-1">Why KYB?</p>
                      <p>ERC-3643 / T-REX standard requires issuer verification before security token deployment. Your data is encrypted and processed under GDPR.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Business Name" hint="As registered with your jurisdiction">
                        <IconInput icon={Building2} type="text" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="POLYCRUZ Capital Ltd" />
                      </Field>
                      <Field label="Registration Number">
                        <IconInput icon={Hash} type="text" value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} placeholder="12345678" />
                      </Field>
                    </div>

                    <Field label="Business Address">
                      <IconInput icon={Globe} type="text" value={form.businessAddress} onChange={(e) => update("businessAddress", e.target.value)} placeholder="1 Canada Square, Canary Wharf, London E14 5AB" />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Country of Incorporation">
                        <select className={inputCls} value={form.incorporationCountry} onChange={(e) => update("incorporationCountry", e.target.value)}>
                          <option value="GB">United Kingdom</option>
                          <option value="US">United States</option>
                          <option value="EU">European Union</option>
                          <option value="SG">Singapore</option>
                          <option value="CH">Switzerland</option>
                          <option value="AE">UAE</option>
                          <option value="KY">Cayman Islands</option>
                          <option value="IE">Ireland</option>
                          <option value="LU">Luxembourg</option>
                        </select>
                      </Field>
                      <Field label="Director / Authorized Signatory">
                        <IconInput icon={Users} type="text" value={form.directorName} onChange={(e) => update("directorName", e.target.value)} placeholder="John Smith" />
                      </Field>
                    </div>

                    <Field label="Upload Business Certificate" hint="Company registration certificate or equivalent (PDF, JPG, PNG)">
                      <div className="flex items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 hover:border-neutral-500 transition-colors cursor-pointer">
                        <Upload className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="text-[13px] text-neutral-700 font-medium">Drop file or click to upload</p>
                          <p className="text-[11px] text-neutral-500">Max 10MB • PDF, JPG, PNG accepted</p>
                        </div>
                      </div>
                    </Field>

                    <button
                      onClick={() => setKybSubmitted(true)}
                      disabled={!canStep4}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-950 bg-neutral-950 py-2.5 text-[13px] font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" /> Submit KYB Application
                    </button>
                  </>
                )}

                <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} nextDisabled={!canStep4} nextLabel="Continue to Financials" />
              </div>
            )}

            {/* ── Step 5: Financials & Tokenomics ── */}
            {step === 5 && (
              <div className="card p-6 space-y-5">
                <StepHeader n={5} title="Financials & Tokenomics" subtitle="Detail the financial structure and tokenomics of your asset." />

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Total Asset Value (USD)">
                    <IconInput icon={DollarSign} type="number" value={form.totalValueUSD} onChange={(e) => update("totalValueUSD", e.target.value)} placeholder="1,000,000" />
                  </Field>
                  <Field label="Initial Token Supply">
                    <IconInput icon={Coins} type="number" value={form.initialSupply} onChange={(e) => update("initialSupply", e.target.value)} placeholder="1,000,000" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label={form.assetClass === "startup" ? "Target Return / Valuation Cap" : "Annual Yield (%)"}>
                    <IconInput icon={Percent} type="number" step="0.01" value={form.yieldBps} onChange={(e) => update("yieldBps", e.target.value)} placeholder={meta.yieldRange.split("–")[0]} />
                  </Field>
                  <Field label={form.assetClass === "startup" ? "Round Close Date" : "Maturity Date"}>
                    <IconInput icon={Calendar} type="date" value={form.maturityDate} onChange={(e) => update("maturityDate", e.target.value)} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Minimum Investment (USD)">
                    <IconInput icon={DollarSign} type="number" value={form.minInvestmentUSD} onChange={(e) => update("minInvestmentUSD", e.target.value)} placeholder="1,000" />
                  </Field>
                  <Field label="Distribution Frequency">
                    <select className={inputCls} value={form.distributionFrequency} onChange={(e) => update("distributionFrequency", e.target.value)}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi_annual">Semi-Annual</option>
                      <option value="annual">Annual</option>
                      <option value="on_exit">On Exit / Redemption</option>
                      <option value="none">None</option>
                    </select>
                  </Field>
                </div>

                {/* Implied token price */}
                {form.totalValueUSD && form.initialSupply && (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Computed Tokenomics</p>
                    <div className="grid grid-cols-3 gap-4 text-[12px]">
                      <div>
                        <p className="text-neutral-500">Token Price</p>
                        <p className="font-semibold text-neutral-950 text-[15px]">
                          ${(parseFloat(form.totalValueUSD) / parseFloat(form.initialSupply)).toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Market Cap</p>
                        <p className="font-semibold text-neutral-950 text-[15px]">
                          ${Number(form.totalValueUSD).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Est. Annual Yield</p>
                        <p className="font-semibold text-emerald-700 text-[15px]">
                          {form.yieldBps || "0"}% APY
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <NavButtons onBack={() => setStep(4)} onNext={() => setStep(6)} nextDisabled={!canStep5} nextLabel="Continue to Documents" />
              </div>
            )}

            {/* ── Step 6: Documents & Legal ── */}
            {step === 6 && (
              <div className="card p-6 space-y-5">
                <StepHeader n={6} title="Documents & Legal" subtitle="Upload necessary documents and assign legal entities." />

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Legal Entity Name">
                    <IconInput icon={Building2} type="text" value={form.legalEntity} onChange={(e) => update("legalEntity", e.target.value)} placeholder="POLYCRUZ Capital Ltd" />
                  </Field>
                  <Field label="Legal Counsel / Law Firm">
                    <IconInput icon={FileCheck2} type="text" value={form.legalCounsel} onChange={(e) => update("legalCounsel", e.target.value)} placeholder="Allen & Overy LLP" />
                  </Field>
                </div>

                {/* Document uploads */}
                {[
                  { label: "Offering Memorandum / Prospectus", key: "offeringMemoName" as keyof TokenForm, required: true, hint: "OM, prospectus, or private placement memorandum" },
                  { label: "Legal Opinion", key: "legalOpinionName" as keyof TokenForm, required: true, hint: "Counsel's opinion on token classification" },
                  { label: "Audited Financials (last 2 years)", key: "financialsName" as keyof TokenForm, required: false, hint: "Annual report or audited P&L statements" },
                ].map((doc) => (
                  <Field key={doc.key} label={doc.label} hint={doc.hint}>
                    <div
                      className="flex items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 hover:border-neutral-500 transition-colors cursor-pointer"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf,.doc,.docx,.jpg,.png";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) update(doc.key, file.name);
                        };
                        input.click();
                      }}
                    >
                      {form[doc.key] ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium text-emerald-800">{form[doc.key] as string}</p>
                            <p className="text-[11px] text-neutral-500">Click to replace</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-neutral-400 shrink-0" />
                          <div>
                            <p className="text-[13px] text-neutral-700 font-medium">
                              {doc.required ? "Upload required document" : "Upload (optional)"}
                            </p>
                            <p className="text-[11px] text-neutral-500">PDF, DOC, JPG up to 25MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </Field>
                ))}

                {/* IPFS note */}
                <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[12px] text-neutral-600">
                  <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-neutral-400" />
                  All documents are pinned to IPFS via Pinata and referenced immutably in the smart contract. Document hashes are included in the token metadata.
                </div>

                {/* Terms */}
                <div
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${termsAccepted ? "border-emerald-200 bg-emerald-50" : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"}`}
                  onClick={() => setTermsAccepted(!termsAccepted)}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${termsAccepted ? "border-emerald-500 bg-emerald-500" : "border-neutral-300"}`}>
                    {termsAccepted && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <p className="text-[12px] text-neutral-700 leading-relaxed">
                    I confirm that all submitted documents are accurate, legally valid, and that this token issuance complies with applicable regulations in the selected jurisdiction. I accept POLYCRUZ's <span className="underline">Terms of Service</span> and <span className="underline">Issuer Agreement</span>.
                  </p>
                </div>

                <NavButtons onBack={() => setStep(5)} onNext={() => setStep(7)} nextDisabled={!termsAccepted} nextLabel="Review & Confirm" />
              </div>
            )}

            {/* ── Step 7: Review & Confirm ── */}
            {step === 7 && (
              <div className="card p-6 space-y-5">
                <StepHeader n={7} title="Review & Confirm" subtitle="Review all your asset details and submit for final approval." />

                {/* Full summary */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 divide-y divide-neutral-200 overflow-hidden">
                  {/* Asset */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Asset Information</p>
                    <div className="space-y-1.5 text-[13px]">
                      {[
                        ["Token Name", form.name],
                        ["Symbol", form.symbol],
                        ["Asset Class", meta.label],
                        ["Jurisdiction", form.jurisdiction],
                        ["Risk Rating", form.riskRating],
                        form.description ? ["Description", form.description.slice(0, 80) + (form.description.length > 80 ? "…" : "")] : null,
                      ].filter((x): x is [string, string] => Boolean(x)).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-neutral-500">{k}</span>
                          <span className="font-medium text-neutral-950 capitalize max-w-[200px] text-right truncate">{v || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* KYB */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">KYB Details</p>
                    <div className="space-y-1.5 text-[13px]">
                      {[
                        ["Business", form.businessName],
                        ["Reg. Number", form.registrationNumber],
                        ["Director", form.directorName],
                        ["Country", form.incorporationCountry],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-neutral-500">{k}</span>
                          <span className="font-medium text-neutral-950">{v || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Financials */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Financials & Tokenomics</p>
                    <div className="space-y-1.5 text-[13px]">
                      {[
                        ["Total Value", `$${Number(form.totalValueUSD || 0).toLocaleString()}`],
                        ["Supply", `${Number(form.initialSupply || 0).toLocaleString()} tokens`],
                        ["Annual Yield", `${form.yieldBps || "0"}%`],
                        ["Maturity", form.maturityDate || "Perpetual"],
                        ["Min. Investment", form.minInvestmentUSD ? `$${Number(form.minInvestmentUSD).toLocaleString()}` : "—"],
                        ["Distributions", form.distributionFrequency.replace(/_/g, " ")],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-neutral-500">{k}</span>
                          <span className="font-medium text-neutral-950 capitalize">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Documents */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Legal & Documents</p>
                    <div className="space-y-1.5 text-[13px]">
                      {[
                        ["Legal Entity", form.legalEntity],
                        ["Legal Counsel", form.legalCounsel],
                        ["Offering Memo", form.offeringMemoName || "—"],
                        ["Legal Opinion", form.legalOpinionName || "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-neutral-500">{k}</span>
                          <span className="font-medium text-neutral-950 max-w-[160px] truncate text-right">{v || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2 text-[12px] text-neutral-600">
                  {[
                    "All transfers enforce on-chain compliance automatically",
                    "Metadata pinned to IPFS via Pinata",
                    "Off-chain registry stored in Supabase",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {t}
                    </div>
                  ))}
                </div>

                {/* Compliance checklist */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4">
                  <p className="text-[12px] font-semibold text-neutral-800 mb-3">Pre-Launch Compliance Checklist</p>
                  <div className="space-y-2">
                    {[
                      { label: "Wallet connected", done: isConnected },
                      { label: "Network live for deployment", done: chainLive },
                      { label: feeRequired ? "Listing fee paid" : "No listing fee required", done: !feeRequired || feePaid },
                      { label: "KYB details provided", done: canStep4 },
                      { label: "Financials configured", done: canStep5 },
                      { label: "Terms accepted", done: termsAccepted },
                      { label: "Offering memo uploaded", done: !!form.offeringMemoName },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-[12px]">
                        {item.done
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
                        <span className={item.done ? "text-neutral-800" : "text-amber-700"}>{item.label}</span>
                        {!item.done && <span className="ml-auto text-amber-600 text-[11px]">Required</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chain selector */}
                <div>
                  <label className="mb-2 block text-[12px] font-medium text-neutral-800">Deploy on Chain</label>
                  <div className="flex flex-wrap gap-2">
                    {DEPLOYMENT_NETWORKS.map((network) => (
                      <button key={network.id} onClick={() => switchChain?.({ chainId: network.id })}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors ${
                          chainId === network.id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isChainDeployed(network.id) ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {network.shortName}
                      </button>
                    ))}
                    {TEST_CHAINS.map((chain) => (
                      <button key={chain.id} onClick={() => switchChain?.({ chainId: chain.id })}
                        className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors ${
                          chainId === chain.id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400"
                        }`}>
                        {chain.short}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2 text-[12px] text-amber-900/80">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                    <div className="space-y-1">
                      <p>Deploying creates an ERC-20 security token with compliance controls on-chain. This action is irreversible.</p>
                      <p>Whitelist-only transfers by default. You will be the initial issuer and admin.</p>
                      <p>Metadata is pinned to IPFS. Off-chain registry updated in Supabase.</p>
                    </div>
                  </div>
                </div>

                {!isConnected && (
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <Wallet className="h-5 w-5 text-neutral-400" />
                    <p className="text-[13px] text-neutral-700">Connect your wallet to deploy tokens on-chain.</p>
                  </div>
                )}

                {isConnected && !chainLive && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-[13px] text-amber-900">Contracts aren't deployed on {getChainName(chainId)} yet — switch to a live network to deploy.</p>
                    <button
                      onClick={() => switchChain?.({ chainId: DEPLOYMENT_NETWORKS[0].id })}
                      className="flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-950 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-800"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSwitching ? "animate-spin" : ""}`} />
                      Switch
                    </button>
                  </div>
                )}

                {isFeePending && <TxStatus icon={Loader2} spin text="Waiting for listing fee confirmation…" cls="text-amber-700" />}
                {isFeeConfirming && <TxStatus icon={Loader2} spin text="Confirming listing fee on-chain…" cls="text-neutral-950" />}
                {isPending && <TxStatus icon={Loader2} spin text="Waiting for wallet confirmation…" cls="text-amber-700" />}
                {isConfirming && <TxStatus icon={Loader2} spin text="Confirming on-chain…" cls="text-neutral-950" />}
                {isSuccess && (
                  <div className="flex items-center gap-2 text-[13px] text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Token deployed! {hash && getExplorerTxUrl(chainId, hash) && <a href={getExplorerTxUrl(chainId, hash)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">View transaction <ExternalLink className="h-3 w-3" /></a>}
                  </div>
                )}
                {error && (
                  <div className="flex items-start gap-2 text-[12px] text-red-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {error.message.slice(0, 180)}
                  </div>
                )}

                <div className="flex gap-3">
                  <NavButtons onBack={() => setStep(6)} />
                  <button
                    onClick={handleDeploySubmit}
                    disabled={!canDeploy || isPending || isConfirming || isUploading || isFeePending || isFeeConfirming}
                    className="btn-primary"
                  >
                    {isFeePending || isFeeConfirming ? <><Loader2 className="h-4 w-4 animate-spin" /> Paying listing fee…</> :
                      isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading to IPFS…</> :
                      isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Deploying…</> :
                      feeRequired && !feePaid ? <><DollarSign className="h-4 w-4" /> Pay Listing Fee</> :
                      <><Coins className="h-4 w-4" /> Deploy & Submit for Approval</>}
                  </button>
                </div>

                {/* Implied token price */}
                {form.totalValueUSD && form.initialSupply && (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Computed Tokenomics</p>
                    <div className="grid grid-cols-3 gap-4 text-[12px]">
                      <div>
                        <p className="text-neutral-500">Token Price</p>
                        <p className="font-semibold text-neutral-950 text-[15px]">
                          ${(parseFloat(form.totalValueUSD) / parseFloat(form.initialSupply)).toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Market Cap</p>
                        <p className="font-semibold text-neutral-950 text-[15px]">
                          ${Number(form.totalValueUSD).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Est. Annual Yield</p>
                        <p className="font-semibold text-emerald-700 text-[15px]">
                          {form.yieldBps || "0"}% APY
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <NavButtons onBack={() => setStep(4)} onNext={() => setStep(6)} nextDisabled={!canStep5} nextLabel="Continue to Documents" />
              </div>
            )}

            {/* ── Step 8: Launch ── */}
            {step === 8 && (
              <div className="card p-6 space-y-6">
                <StepHeader n={8} title="Launch" subtitle="Your asset has been submitted and is now under review." />

                {/* Success hero */}
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                      <Rocket className="h-9 w-9 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-neutral-950">{form.name || "Your Token"} is Live!</p>
                    <p className="mt-1 text-[13px] text-neutral-500 font-mono">{form.symbol || "TOKEN"}</p>
                    <p className="mt-3 text-[13px] text-neutral-600 max-w-sm">Your asset is now under review by our compliance team. You'll receive a notification once it's approved and listed on the marketplace.</p>
                  </div>
                  {hash && getExplorerTxUrl(chainId, hash) && (
                    <a href={getExplorerTxUrl(chainId, hash)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-[12px] font-medium text-neutral-700 hover:border-neutral-950 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> View Transaction on {currentNetwork?.shortName ?? "Explorer"}
                    </a>
                  )}
                </div>

                {/* What happens next */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-[12px] font-semibold text-neutral-800 mb-4 uppercase tracking-wide">What happens next</p>
                  <div className="space-y-4">
                    {[
                      { icon: ShieldCheck, label: "Compliance Review", desc: "Our team verifies KYB, documents, and token parameters.", time: "1–2 business days", done: true },
                      { icon: BadgeCheck, label: "KYB Approval", desc: "Business identity confirmed and issuer whitelisted.", time: "Same day (if KYB passed)", done: false },
                      { icon: Coins, label: "Token Listed", desc: "Token appears on the POLYCRUZ investor marketplace.", time: "Upon approval", done: false },
                      { icon: Users, label: "Investor Distribution", desc: "Whitelisted investors can begin purchasing your token.", time: "After listing", done: false },
                      { icon: Star, label: "Yield Distributions", desc: "Yield payouts distributed automatically on-chain per schedule.", time: form.distributionFrequency || "Quarterly", done: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.done ? "bg-emerald-500" : "bg-neutral-200"}`}>
                          <item.icon className={`h-4 w-4 ${item.done ? "text-white" : "text-neutral-500"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[13px] font-medium text-neutral-900">{item.label}</p>
                            <span className="text-[11px] text-neutral-500">{item.time}</span>
                          </div>
                          <p className="text-[12px] text-neutral-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setTab("issuances"); setStep(1); setForm(defaultForm); setFeePaid(false); setTermsAccepted(false); setKybSubmitted(false); }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-neutral-950 bg-neutral-950 py-2.5 text-[13px] font-medium text-white hover:bg-neutral-800">
                    <List className="h-4 w-4" /> View My Issuances
                  </button>
                  <button onClick={() => { setStep(1); setForm(defaultForm); setFeePaid(false); setTermsAccepted(false); setKybSubmitted(false); }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2.5 text-[13px] font-medium text-neutral-800 hover:bg-neutral-50">
                    <Plus className="h-4 w-4" /> Tokenize Another Asset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Selected class info card */}
            <div className="card p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950">
                  <MetaIcon className="h-[18px] w-[18px] text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-neutral-950">{meta.label}</p>
                  <p className="text-[11px] text-neutral-500">{meta.marketSize} global market</p>
                </div>
              </div>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Yield range</span>
                  <span className="font-medium text-emerald-700">{meta.yieldRange}</span>
                </div>
                <div className="border-t border-neutral-100 pt-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Common assets</p>
                  {meta.examples.map((ex) => (
                    <div key={ex} className="flex items-center gap-2 py-1 text-[12px] text-neutral-700">
                      <span className="h-1 w-1 rounded-full bg-neutral-300" />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step-specific sidebar tips */}
            <div className="card p-5">
              <p className="mb-3 text-[12px] font-semibold text-neutral-950">
                {step === 1 ? "Asset Tips" : step === 2 ? "Network Info" : step === 3 ? "Fee Info" :
                  step === 4 ? "KYB Info" : step === 5 ? "Tokenomics Tips" :
                  step === 6 ? "Document Tips" : "Token Features"}
              </p>
              <div className="space-y-2 text-[11px] text-neutral-600">
                {step <= 1 && [
                  "Choose the asset class that best matches your underlying asset",
                  "Symbol must be unique on-chain (max 10 chars)",
                  "Jurisdiction determines which compliance rules apply",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                    {f}
                  </div>
                ))}
                {step === 2 && [
                  "Sepolia / Amoy are testnets — free to deploy and test",
                  "Ethereum Mainnet has higher gas fees but maximum security",
                  "Base, Polygon, and BNB Chain offer lower fees",
                  "Only chains marked \"Live\" have contracts deployed today",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                    {f}
                  </div>
                ))}
                {step === 3 && [
                  feeRequired ? "One-time fee covers compliance registry setup" : "No listing fee is configured on this network",
                  "Paid directly on-chain — no card or off-chain processor",
                  "Fee includes IPFS document pinning (indefinite)",
                  "Gas fees for deployment are separate",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                    {f}
                  </div>
                ))}
                {step === 4 && [
                  "KYB is required by ERC-3643 / T-REX standard",
                  "Data is encrypted and stored under GDPR compliance",
                  "Director must be an authorized signatory",
                  "Certificate of incorporation required for all jurisdictions",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                    {f}
                  </div>
                ))}
                {step === 5 && [
                  "Token price = Total Value ÷ Supply",
                  "Set minimum investment to control investor size",
                  "Yield is distributed on-chain automatically",
                  "Maturity date triggers redemption logic",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                    {f}
                  </div>
                ))}
                {step >= 6 && [
                  "ERC-20 with compliance controls",
                  "Whitelist-only transfers",
                  "Lockup period enforcement",
                  "Max holder limits",
                  "Dividend / yield distribution",
                  "Forced transfer (regulatory)",
                  "IPFS document storage",
                  "Off-chain Supabase registry",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress summary card */}
            {step > 1 && (
              <div className="card p-5 space-y-2">
                <p className="text-[12px] font-semibold text-neutral-950 mb-3">Your Progress</p>
                {[
                  { label: form.name || "Token name", done: !!form.name },
                  { label: form.symbol || "Symbol", done: !!form.symbol },
                  { label: isConnected ? "Wallet connected" : "Wallet needed", done: isConnected },
                  { label: feeRequired ? (feePaid ? "Listing fee paid" : "Listing fee") : "No fee required", done: !feeRequired || feePaid },
                  { label: canStep4 ? "KYB complete" : "KYB needed", done: canStep4 },
                  { label: canStep5 ? "Financials set" : "Financials needed", done: canStep5 },
                  { label: termsAccepted ? "Terms accepted" : "Terms needed", done: termsAccepted },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-[11px]">
                    {item.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <div className="h-3.5 w-3.5 rounded-full border-2 border-neutral-300 shrink-0" />}
                    <span className={item.done ? "text-neutral-800" : "text-neutral-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: ASSET CATALOG ══════════════════════════════════════════════ */}
      {tab === "catalog" && (
        <div className="space-y-5">
          <p className="text-[13px] text-neutral-600">
            Browse all supported RWA asset classes. Click <strong>Create Token</strong> to launch the tokenization wizard for that class.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(Object.keys(CLASS_META) as AssetClass[]).map((cls) => {
              const { label, short, icon: CIcon, marketSize, yieldRange, examples, badge } = CLASS_META[cls];
              return (
                <div key={cls} className="card flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950">
                        <CIcon className="h-[18px] w-[18px] text-white" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-neutral-950">{label}</p>
                        <p className="text-[11px] text-neutral-500">{short}</p>
                      </div>
                    </div>
                    {badge && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge === "Hot" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-50 p-3 text-[11px]">
                    <div>
                      <p className="text-neutral-400">Market Size</p>
                      <p className="mt-0.5 text-[16px] font-bold text-neutral-950">{marketSize}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Yield Range</p>
                      <p className="mt-0.5 text-[16px] font-bold text-emerald-700">{yieldRange}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Examples</p>
                    <div className="flex flex-wrap gap-1.5">
                      {examples.map((ex) => (
                        <span key={ex} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-neutral-700">{ex}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { update("assetClass", cls); setStep(1); setTab("create"); }}
                    className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-[12px] font-medium text-neutral-950 transition hover:border-neutral-950"
                  >
                    Create Token <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ TAB: MY ISSUANCES ═══════════════════════════════════════════════ */}
      {tab === "issuances" && (
        <div className="space-y-4">
          {!isConnected ? (
            <div className="card flex flex-col items-center gap-4 py-16 text-center">
              <Wallet className="h-10 w-10 text-neutral-300" />
              <div>
                <p className="text-[15px] font-semibold text-neutral-950">Connect your wallet</p>
                <p className="mt-1 text-[13px] text-neutral-500">Your deployed tokens will appear here once connected.</p>
              </div>
            </div>
          ) : tokens.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 py-16 text-center">
              <Coins className="h-10 w-10 text-neutral-300" />
              <div>
                <p className="text-[15px] font-semibold text-neutral-950">No tokens deployed yet</p>
                <p className="mt-1 text-[13px] text-neutral-500">Deploy your first RWA token from the Create Token tab.</p>
              </div>
              <button onClick={() => setTab("create")} className="btn-primary">Create Token <ArrowRight className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <h3 className="text-[13px] font-semibold text-neutral-950">Deployed Tokens ({tokens.length})</h3>
                <button onClick={() => setTab("create")} className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-950 hover:opacity-70">
                  <Plus className="h-3.5 w-3.5" /> New Token
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {["Token", "Class", "Address", "Status", "Deployed"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {tokens.map((t, i) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-[9px] font-bold text-white">
                            {t.symbol.slice(0, 4)}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-neutral-950">{t.name}</p>
                            <p className="font-mono text-[11px] text-neutral-500">{t.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[12px] capitalize text-neutral-700">{t.assetType.replace(/_/g, " ")}</td>
                      <td className="max-w-[160px] truncate px-6 py-4 font-mono text-[11px] text-neutral-500">{t.tokenAddress}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={t.active ? "Active" : "Inactive"} variant={t.active ? "success" : "neutral"} />
                      </td>
                      <td className="px-6 py-4 text-[12px] text-neutral-500">
                        {new Date(Number(t.deployedAt) * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isConnected && (
            <div className="card-dark flex items-center gap-4 p-6">
              <ShieldCheck className="h-6 w-6 shrink-0 text-white/80" />
              <div>
                <p className="text-[13px] font-semibold text-white">Every token enforced on-chain</p>
                <p className="mt-1 text-[12px] text-white/70">
                  Transfers pass ERC-3643 compliance checks. Balances cannot be frozen without a regulatory audit-log entry.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TxStatus({ icon: Icon, spin, text, cls }: { icon: LucideIcon; spin?: boolean; text: string; cls: string }) {
  return (
    <div className={`flex items-center gap-2 text-[13px] ${cls}`}>
      <Icon className={`h-4 w-4 ${spin ? "animate-spin" : ""}`} />
      {text}
    </div>
  );
}
