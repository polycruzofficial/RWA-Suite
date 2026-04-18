"use client";

import { useState } from "react";
import { useAccount, useChainId, useChains } from "wagmi";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Settings,
  Building2,
  Globe,
  Bell,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Wallet,
  Link as LinkIcon,
} from "lucide-react";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chains = useChains();

  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "Equitex Capital Ltd",
    registrationNumber: "12345678",
    jurisdiction: "GB",
    notificationEmail: "",
    webhookUrl: "",
    autoWhitelist: false,
    requireMultisig: true,
    auditLogging: true,
  });

  const handleSave = () => {
    // Would save to Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const currentChain = chains.find((c) => c.id === chainId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-950">Settings</h2>
        <p className="text-sm text-neutral-600">Platform configuration, wallet settings, and notification preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="col-span-2 space-y-6">
          {/* Company Info */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-neutral-950" />
              <h3 className="text-sm font-semibold text-neutral-950">Company Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-neutral-600">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => updateSetting("companyName", e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-neutral-600">Registration Number</label>
                <input
                  type="text"
                  value={settings.registrationNumber}
                  onChange={(e) => updateSetting("registrationNumber", e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-neutral-600">Jurisdiction</label>
              <select
                value={settings.jurisdiction}
                onChange={(e) => updateSetting("jurisdiction", e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
              >
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="EU">European Union</option>
                <option value="SG">Singapore</option>
                <option value="CH">Switzerland</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-neutral-950" />
              <h3 className="text-sm font-semibold text-neutral-950">Notifications</h3>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-neutral-600">Notification Email</label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => updateSetting("notificationEmail", e.target.value)}
                placeholder="admin@equitex.io"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-neutral-600">Webhook URL</label>
              <input
                type="url"
                value={settings.webhookUrl}
                onChange={(e) => updateSetting("webhookUrl", e.target.value)}
                placeholder="https://hooks.example.com/events"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
              />
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-neutral-950" />
              <h3 className="text-sm font-semibold text-neutral-950">Security & Compliance</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: "autoWhitelist", label: "Auto-whitelist approved KYC investors", desc: "Automatically add investors to token whitelists when KYC is approved" },
                { key: "requireMultisig", label: "Require multisig for large transactions", desc: "Transactions above threshold require multiple admin approvals" },
                { key: "auditLogging", label: "Enhanced audit logging", desc: "Log all admin actions to the on-chain audit trail" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <div>
                    <p className="text-sm text-neutral-900">{item.label}</p>
                    <p className="text-xs text-neutral-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key, !(settings as Record<string, unknown>)[item.key])}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      (settings as Record<string, unknown>)[item.key] ? "bg-neutral-950" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        (settings as Record<string, unknown>)[item.key] ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-neutral-950 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Settings</>}
          </button>
        </div>

        {/* Sidebar: Wallet & Network */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-neutral-950" />
              <h3 className="text-sm font-semibold text-neutral-950">Connected Wallet</h3>
            </div>
            {isConnected ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-600">Address</p>
                  <p className="mt-1 text-sm text-neutral-900 font-mono break-all">{address}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Network</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <p className="text-sm text-neutral-900">{currentChain?.name || "Unknown"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Chain ID</p>
                  <p className="mt-1 text-sm text-neutral-900 font-mono">{chainId}</p>
                </div>
                <StatusBadge status="Connected" variant="success" />
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No wallet connected</p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-neutral-950" />
              <h3 className="text-sm font-semibold text-neutral-950">Contract Addresses</h3>
            </div>
            {[
              { label: "Token Factory", addr: process.env.NEXT_PUBLIC_FACTORY_ADDRESS },
              { label: "Compliance", addr: process.env.NEXT_PUBLIC_COMPLIANCE_ADDRESS },
              { label: "Treasury", addr: process.env.NEXT_PUBLIC_TREASURY_ADDRESS },
              { label: "Yield", addr: process.env.NEXT_PUBLIC_YIELD_ADDRESS },
            ].map((c) => (
              <div key={c.label}>
                <p className="text-xs text-neutral-600">{c.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500 font-mono truncate">{c.addr || "Not deployed"}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-neutral-950" />
              <h3 className="text-sm font-semibold text-neutral-950">API Keys</h3>
            </div>
            <div className="text-xs text-neutral-500 space-y-1">
              <p>Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configured" : "✗ Not set"}</p>
              <p>Pinata IPFS: {process.env.PINATA_JWT ? "✓ Configured" : "✗ Not set"}</p>
              <p>WalletConnect: {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? "✓ Configured" : "✗ Not set"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
