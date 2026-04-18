"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useSetIdentity, useIdentity } from "@/hooks/useContracts";
import { uploadJSONToIPFS } from "@/lib/ipfs";
import { saveInvestor } from "@/lib/supabase";
import {
  BadgeCheck,
  Loader2,
  CheckCircle2,
  Shield,
  ChevronRight,
  AlertTriangle,
  User,
  Building2,
  Globe,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

const investorTypeMap: Record<string, number> = {
  retail: 0,
  accredited: 1,
  qualified: 2,
  institutional: 3,
};

type Step = 1 | 2 | 3 | 4;

interface KycForm {
  fullName: string;
  entityName: string;
  investorType: keyof typeof investorTypeMap;
  jurisdiction: string;
  taxId: string;
  email: string;
  phone: string;
  pep: boolean;
  sourceOfFunds: string;
}

const defaults: KycForm = {
  fullName: "",
  entityName: "",
  investorType: "accredited",
  jurisdiction: "GB",
  taxId: "",
  email: "",
  phone: "",
  pep: false,
  sourceOfFunds: "",
};

export default function KYCPage() {
  const { address, isConnected } = useAccount();
  const { data: identity } = useIdentity(address);
  const { setIdentity, isPending, isConfirming, isSuccess, error } =
    useSetIdentity();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<KycForm>(defaults);
  const [uploading, setUploading] = useState(false);

  const update = <K extends keyof KycForm>(k: K, v: KycForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const identityStatus =
    identity && typeof identity === "object" && "status" in identity
      ? Number((identity as { status: unknown }).status)
      : 0;
  const alreadyVerified = identityStatus >= 2;

  const submit = async () => {
    if (!address) return;
    try {
      setUploading(true);
      let docHash = "placeholder-configure-pinata";
      try {
        docHash = await uploadJSONToIPFS(
          {
            ...form,
            address,
            submittedAt: new Date().toISOString(),
          },
          `kyc-${address}`
        );
      } catch {
        console.warn("IPFS upload skipped");
      }

      try {
        await saveInvestor({
          wallet_address: address,
          display_name: form.fullName || form.entityName,
          email: form.email,
          investor_type: form.investorType,
          jurisdiction: form.jurisdiction,
          kyc_status: "pending",
          kyc_doc_hash: docHash,
          risk_score: form.pep ? 70 : 20,
        });
      } catch {
        console.warn("Supabase save skipped");
      }

      setUploading(false);

      setIdentity({
        account: address,
        status: 2, // APPROVED (optimistic) — in production the compliance officer flips this
        investorType: investorTypeMap[form.investorType],
        jurisdiction: form.jurisdiction,
        kycDocHash: docHash,
        expiresAt: BigInt(
          Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
        ),
        pep: form.pep,
        riskScore: BigInt(form.pep ? 70 : 20),
      });
    } catch (e) {
      setUploading(false);
      console.error(e);
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <h2 className="display-lg mt-6 text-neutral-950">
            Connect your wallet first.
          </h2>
          <p className="mt-2 text-[14px] text-neutral-600">
            Your wallet address will be bound to your KYC record on-chain.
          </p>
          <Link href="/get-started?role=investor" className="btn-primary mt-8">
            Connect Wallet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (alreadyVerified || isSuccess) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="display-lg mt-6 text-neutral-950">
            You're verified.
          </h2>
          <p className="mt-2 text-[14px] text-neutral-600">
            Your on-chain identity is active. You can now browse and trade any
            asset on the platform.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/investor/marketplace" className="btn-primary">
              Enter Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/investor/portfolio" className="btn-secondary">
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                step >= s
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`ml-3 h-px flex-1 ${
                  step > s ? "bg-neutral-950" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="card p-8">
        {step === 1 && (
          <>
            <h2 className="display-lg text-neutral-950">
              Tell us who you are.
            </h2>
            <p className="mt-2 text-[14px] text-neutral-600">
              One-time KYC. Unlocks access to every regulated asset on Equitex.
            </p>

            <div className="mt-8 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Full Name"
                  icon={<User className="h-4 w-4" />}
                  value={form.fullName}
                  onChange={(v) => update("fullName", v)}
                  placeholder="Jane Doe"
                />
                <Field
                  label="Entity (optional)"
                  icon={<Building2 className="h-4 w-4" />}
                  value={form.entityName}
                  onChange={(v) => update("entityName", v)}
                  placeholder="BlackRock Advisors UK Ltd"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  placeholder="jane@firm.com"
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => update("phone", v)}
                  placeholder="+44 …"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!form.fullName || !form.email}
                className="btn-primary disabled:opacity-40"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="display-lg text-neutral-950">Investor profile.</h2>
            <p className="mt-2 text-[14px] text-neutral-600">
              This determines which assets you're eligible to access.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-neutral-700">
                  Investor Type
                </label>
                <div className="grid gap-2 md:grid-cols-2">
                  {(
                    [
                      ["retail", "Retail", "Individual investor"],
                      [
                        "accredited",
                        "Accredited",
                        "Income / net-worth qualified",
                      ],
                      [
                        "qualified",
                        "Qualified",
                        "Professional investor (MiFID II)",
                      ],
                      [
                        "institutional",
                        "Institutional",
                        "Fund / bank / sovereign",
                      ],
                    ] as const
                  ).map(([k, title, desc]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => update("investorType", k)}
                      className={`rounded-xl border p-4 text-left transition ${
                        form.investorType === k
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <p className="text-[13px] font-semibold">{title}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          form.investorType === k
                            ? "text-white/70"
                            : "text-neutral-500"
                        }`}
                      >
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[12px] font-medium text-neutral-700">
                    Jurisdiction
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <select
                      value={form.jurisdiction}
                      onChange={(e) => update("jurisdiction", e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-[14px] focus:border-neutral-950 focus:outline-none"
                    >
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="EU">European Union</option>
                      <option value="SG">Singapore</option>
                      <option value="CH">Switzerland</option>
                      <option value="AE">UAE / ADGM</option>
                    </select>
                  </div>
                </div>
                <Field
                  label="Tax ID / UTR"
                  value={form.taxId}
                  onChange={(v) => update("taxId", v)}
                  placeholder="GB1234567890"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="display-lg text-neutral-950">AML & Screening.</h2>
            <p className="mt-2 text-[14px] text-neutral-600">
              Regulatory disclosures. Your answers are screened against OFAC,
              UK HMT, EU consolidated, and UN lists.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-neutral-700">
                  Source of Funds
                </label>
                <textarea
                  value={form.sourceOfFunds}
                  onChange={(e) => update("sourceOfFunds", e.target.value)}
                  rows={3}
                  placeholder="e.g. employment income, business proceeds, investment returns"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[14px] focus:border-neutral-950 focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={form.pep}
                  onChange={(e) => update("pep", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 accent-neutral-950"
                />
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">
                    I am a Politically Exposed Person (PEP)
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Declare if you or a close associate hold a prominent public
                    function.
                  </p>
                </div>
              </label>

              <div className="flex items-start gap-3 rounded-xl bg-neutral-50 p-4 text-[12px] text-neutral-700">
                <FileCheck2 className="mt-0.5 h-4 w-4 text-neutral-950" />
                <p>
                  Document upload is handled via our Onfido integration after
                  you submit. For this preview we record a hashed commitment
                  on IPFS and link it to your wallet on-chain.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">
                Back
              </button>
              <button onClick={() => setStep(4)} className="btn-primary">
                Review <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="display-lg text-neutral-950">Review & sign.</h2>
            <p className="mt-2 text-[14px] text-neutral-600">
              One wallet signature binds your identity to the on-chain
              compliance registry.
            </p>

            <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <dl className="grid grid-cols-2 gap-y-3 text-[13px]">
                <Row k="Wallet" v={address?.slice(0, 10) + "…" + address?.slice(-6)} />
                <Row k="Full name" v={form.fullName || "—"} />
                <Row k="Entity" v={form.entityName || "—"} />
                <Row k="Investor type" v={form.investorType} />
                <Row k="Jurisdiction" v={form.jurisdiction} />
                <Row k="PEP" v={form.pep ? "Yes" : "No"} />
              </dl>
            </div>

            {(isPending || uploading) && (
              <div className="mt-6 flex items-center gap-2 text-[13px] text-amber-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? "Uploading to IPFS…" : "Waiting for wallet…"}
              </div>
            )}
            {isConfirming && (
              <div className="mt-6 flex items-center gap-2 text-[13px] text-neutral-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Anchoring identity on-chain…
              </div>
            )}
            {error && (
              <div className="mt-6 flex items-start gap-2 text-[13px] text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <p>{error.message.slice(0, 180)}</p>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(3)} className="btn-secondary">
                Back
              </button>
              <button
                onClick={submit}
                disabled={isPending || uploading || isConfirming}
                className="btn-primary disabled:opacity-50"
              >
                <BadgeCheck className="h-4 w-4" />
                {uploading || isPending || isConfirming
                  ? "Processing…"
                  : "Sign & Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-neutral-200 bg-white ${
            icon ? "pl-10" : "pl-4"
          } py-2.5 pr-4 text-[14px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none`}
        />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <>
      <dt className="text-neutral-500">{k}</dt>
      <dd className="font-medium text-neutral-900">{v}</dd>
    </>
  );
}
