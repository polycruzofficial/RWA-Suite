"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ArrowRight,
  Building2,
  Wallet,
  Check,
  ShieldCheck,
} from "lucide-react";

type Role = "issuer" | "investor" | null;

export default function GetStartedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <GetStartedInner />
    </Suspense>
  );
}

function GetStartedInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { isConnected } = useAccount();
  const initialRole = (params.get("role") as Role) ?? null;

  const [role, setRole] = useState<Role>(initialRole);

  useEffect(() => {
    if (isConnected && role === "issuer") {
      router.push("/issuer/portfolio");
    }
    if (isConnected && role === "investor") {
      router.push("/investor/kyc");
    }
  }, [isConnected, role, router]);

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {/* Top bar */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-xs font-bold text-white">
              PC
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-neutral-950">
              POLYCRUZ
            </span>
          </Link>
          <Link href="/" className="text-[13px] text-neutral-600 hover:text-neutral-950">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
        {/* Step header */}
        <div className="text-center">
          <p className="eyebrow">Step {role ? "2" : "1"} of 2</p>
          <h1 className="display-xl mt-4 text-neutral-950">
            {role ? "Connect your wallet." : "Who are you today?"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-neutral-600">
            {role
              ? "Use any major wallet — MetaMask, Ledger, Rabby, Coinbase, or any WalletConnect-compatible signer."
              : "Choose the experience tailored to your role. You can switch at any time."}
          </p>
        </div>

        {/* Role selector */}
        {!role && (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <button
              onClick={() => setRole("issuer")}
              className="card group p-10 text-left transition hover:-translate-y-0.5 hover:border-neutral-900/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="display-lg mt-8 text-neutral-950">
                I'm an Issuer
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                Asset manager, bank, treasury, or corporate. Tokenize and
                distribute regulated financial products.
              </p>
              <ul className="mt-8 space-y-2 text-[13px] text-neutral-700">
                {[
                  "Tokenization Studio",
                  "Cap table management",
                  "Treasury console",
                  "Compliance & audit",
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-neutral-950" /> {i}
                  </li>
                ))}
              </ul>
              <div className="mt-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-950 transition group-hover:gap-2.5">
                Continue as Issuer
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            <button
              onClick={() => setRole("investor")}
              className="card-dark group p-10 text-left transition hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="display-lg mt-8 text-white">I'm an Investor</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/70">
                Complete a single KYC, browse 200+ institutional-grade assets,
                trade with stablecoins, and earn yield.
              </p>
              <ul className="mt-8 space-y-2 text-[13px] text-white/85">
                {[
                  "Marketplace access",
                  "Stablecoin + crypto trading",
                  "Portfolio analytics",
                  "Yield strategies",
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-white" /> {i}
                  </li>
                ))}
              </ul>
              <div className="mt-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-white transition group-hover:gap-2.5">
                Continue as Investor
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        )}

        {/* Wallet connect step */}
        {role && (
          <div className="mt-14">
            <div className="card mx-auto max-w-lg p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                {role === "issuer" ? (
                  <Building2 className="h-6 w-6" />
                ) : (
                  <Wallet className="h-6 w-6" />
                )}
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-neutral-950">
                {role === "issuer" ? "Issuer Console" : "Investor Marketplace"}
              </h3>
              <p className="mt-2 text-[14px] text-neutral-600">
                Sign in with your wallet to continue.
              </p>

              <div className="mt-8 flex justify-center">
                <ConnectButton
                  label="Connect Wallet"
                  chainStatus="full"
                  accountStatus="full"
                  showBalance={false}
                />
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-neutral-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected by Reown WalletConnect — no custody, no seed exposure
              </div>

              <button
                onClick={() => setRole(null)}
                className="mt-6 text-[12px] text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
              >
                Change role
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
