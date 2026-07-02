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
  Lock,
  Fingerprint,
  Users,
  Cpu,
  HardDrive,
  Plus,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chains = useChains();

  const [saved, setSaved] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [ledgerPaired, setLedgerPaired] = useState(false);
  const [approvers, setApprovers] = useState([
    { address: "0x1234...abcd", name: "Admin Wallet", role: "Primary" },
    { address: "0x5678...efgh", name: "Operations", role: "Secondary" },
  ]);
  const [newApprover, setNewApprover] = useState({ address: "", name: "", role: "Secondary" });
  const [settings, setSettings] = useState({
    companyName: "POLYCRUZ Capital Ltd",
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
                placeholder="admin@POLYCRUZ.io"
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

          {/* MPC + Custody */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-neutral-950" />
              <h3 className="text-sm font-semibold text-neutral-950">MPC + Biometric Custody</h3>
            </div>

            {/* Vault Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4 text-neutral-700" />
                  <p className="text-xs font-semibold text-neutral-700">MPC Vault</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-sm font-semibold text-neutral-900">Active</p>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Fireblocks-grade threshold signing. 2-of-3 key shares required.</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-neutral-700" />
                    <p className="text-xs font-semibold text-neutral-700">Biometric Auth</p>
                  </div>
                  <button
                    onClick={() => setBiometricEnabled(!biometricEnabled)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${biometricEnabled ? "bg-neutral-950" : "bg-neutral-300"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${biometricEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <p className="text-sm font-semibold text-neutral-900 mt-2">{biometricEnabled ? "Enabled" : "Disabled"}</p>
                <p className="text-[11px] text-neutral-500 mt-1">FaceID / TouchID required for all high-value approvals.</p>
              </div>
            </div>

            {/* Ledger Pairing */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-neutral-700" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Hardware Wallet (Ledger)</p>
                    <p className="text-xs text-neutral-500">{ledgerPaired ? "Ledger Nano X — paired and ready" : "No hardware wallet paired"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLedgerPaired(!ledgerPaired)}
                  className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                    ledgerPaired ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-neutral-950 text-white hover:bg-neutral-800"
                  }`}
                >
                  {ledgerPaired ? "Unpair" : "Pair Ledger"}
                </button>
              </div>
              {ledgerPaired && (
                <div className="mt-3 flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ledger Nano X paired. All transactions above £10,000 require hardware confirmation.
                </div>
              )}
            </div>

            {/* Multi-sig Approvers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-neutral-700" />
                  <p className="text-sm font-semibold text-neutral-900">Multi-Sig Approvers</p>
                </div>
                <span className="text-xs text-neutral-500">{approvers.length} approvers configured</span>
              </div>
              <div className="space-y-2">
                {approvers.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{a.name}</p>
                      <p className="text-xs text-neutral-500 font-mono">{a.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${a.role === "Primary" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"}`}>
                        {a.role}
                      </span>
                      <button onClick={() => setApprovers(approvers.filter((_, idx) => idx !== i))} className="text-neutral-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="0x address"
                  value={newApprover.address}
                  onChange={(e) => setNewApprover({ ...newApprover, address: e.target.value })}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-mono placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. CFO)"
                  value={newApprover.name}
                  onChange={(e) => setNewApprover({ ...newApprover, name: e.target.value })}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newApprover.address && newApprover.name) {
                      setApprovers([...approvers, newApprover]);
                      setNewApprover({ address: "", name: "", role: "Secondary" });
                    }
                  }}
                  className="flex items-center justify-center gap-1 rounded-lg bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
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
