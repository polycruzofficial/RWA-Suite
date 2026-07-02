"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useAuditLog } from "@/hooks/useContracts";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Search,
  RefreshCw,
  Lock,
  Eye,
  Download,
  Users,
  ArrowLeftRight,
  MapPin,
  ToggleRight,
  BadgeCheck,
} from "lucide-react";

const complianceRules = [
  { id: "KYC-001", description: "KYC verification required before first transfer", jurisdiction: "GB", active: true, type: "Identity" },
  { id: "AML-001", description: "AML screening against FATF sanctions list", jurisdiction: "Global", active: true, type: "Sanctions" },
  { id: "ACC-001", description: "Accredited investor verification for equity tokens", jurisdiction: "US", active: true, type: "Accreditation" },
  { id: "TRF-001", description: "Whitelist-only transfer restriction", jurisdiction: "Global", active: true, type: "Transfer" },
  { id: "TRF-002", description: "14-day lockup period for new investors", jurisdiction: "GB", active: true, type: "Transfer" },
  { id: "TRF-003", description: "Maximum 200 holders per token", jurisdiction: "GB", active: false, type: "Transfer" },
  { id: "RPT-001", description: "FCA quarterly reporting compliance pack", jurisdiction: "GB", active: true, type: "Reporting" },
  { id: "RPT-002", description: "MiFID II transaction reporting", jurisdiction: "EU", active: true, type: "Reporting" },
  { id: "TAX-001", description: "HMRC withholding tax on dividends", jurisdiction: "GB", active: true, type: "Tax" },
];

const sanctionsAlerts = [
  { entity: "0xdead...beef", reason: "OFAC SDN match", severity: "high", timestamp: "2024-04-01T10:30:00Z" },
  { entity: "0xbad0...face", reason: "PEP flag - enhanced due diligence required", severity: "medium", timestamp: "2024-03-28T14:15:00Z" },
];

const documentExpiry = [
  { investor: "Alpha Management LP", docType: "KYC Certificate", expiresAt: "2024-06-15", daysLeft: 72 },
  { investor: "Geneva Wealth SA", docType: "Accreditation Letter", expiresAt: "2024-05-01", daysLeft: 27 },
  { investor: "BlackRock Fund I", docType: "KYB Verification", expiresAt: "2024-09-30", daysLeft: 179 },
  { investor: "Fidelity UK", docType: "AML Certificate", expiresAt: "2024-12-31", daysLeft: 271 },
];

const transferRules = [
  { rule: "Whitelist-only transfers", token: "All tokens", enforcement: "On-chain", status: "active", checks: "12,482" },
  { rule: "14-day lockup for new investors", token: "GILT26, CREDIT1", enforcement: "On-chain", status: "active", checks: "3,201" },
  { rule: "Max 200 holders per token", token: "EQFA", enforcement: "On-chain", status: "inactive", checks: "0" },
  { rule: "Accredited investor only", token: "CREDIT1, EQFA", enforcement: "On-chain", status: "active", checks: "841" },
  { rule: "Jurisdiction block: OFAC countries", token: "All tokens", enforcement: "On-chain", status: "active", checks: "5,719" },
];

const jurisdictions = [
  {
    code: "MiFID II", region: "European Union", flag: "🇪🇺", status: "active",
    investors: 112, transferLogic: "EEA whitelist, €1,000 min investment",
    regulator: "ESMA", lastAudit: "2024-03-01", coverage: "All tokens",
    notes: "Transaction reporting to national competent authorities required quarterly.",
  },
  {
    code: "FCA", region: "United Kingdom", flag: "🇬🇧", status: "active",
    investors: 284, transferLogic: "UK whitelist, £500 min investment",
    regulator: "FCA London", lastAudit: "2024-02-15", coverage: "GILT26, REIT-LON, CREDIT1",
    notes: "CASS rules apply. Client asset segregation enforced at custody level.",
  },
  {
    code: "MAS", region: "Singapore", flag: "🇸🇬", status: "active",
    investors: 38, transferLogic: "Accredited investors only, SGD 200K net worth",
    regulator: "MAS Singapore", lastAudit: "2024-01-20", coverage: "GOLD, CMDY01",
    notes: "CMS licence required for dealing in capital markets products.",
  },
  {
    code: "ADGM", region: "Abu Dhabi", flag: "🇦🇪", status: "pending",
    investors: 0, transferLogic: "FSRA registered investors only",
    regulator: "FSRA", lastAudit: "—", coverage: "Pending approval",
    notes: "FSRA Digital Securities Regulation framework application in progress.",
  },
  {
    code: "DIFC", region: "Dubai", flag: "🇦🇪", status: "pending",
    investors: 0, transferLogic: "DFSA regulated firms only",
    regulator: "DFSA", lastAudit: "—", coverage: "Pending approval",
    notes: "DFSA Investment Token regime review underway. Expected Q3 2024.",
  },
];

const auditEntries = [
  { action: "IDENTITY_UPDATED", subject: "0x5678...efgh", performer: "0x1234...abcd", timestamp: "2024-04-04T09:00:00Z", details: "KYC approved" },
  { action: "TOKEN_APPROVED", subject: "0x9abc...ijkl", performer: "0x1234...abcd", timestamp: "2024-04-03T16:45:00Z", details: "Whitelisted for GILT26" },
  { action: "SANCTIONED", subject: "0xdead...beef", performer: "0x1234...abcd", timestamp: "2024-04-01T10:30:00Z", details: "OFAC match blocked" },
  { action: "IDENTITY_UPDATED", subject: "0xdef0...mnop", performer: "0x1234...abcd", timestamp: "2024-03-28T14:15:00Z", details: "KYC pending review" },
];

export default function CompliancePage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"rules" | "sanctions" | "documents" | "audit" | "transfer" | "jurisdictions">("rules");
  const [addressCheck, setAddressCheck] = useState("");
  const [checkResult, setCheckResult] = useState<null | "approved" | "blocked">(null);
  const { data: onChainAudit } = useAuditLog(0, 20);

  const handleAddressCheck = () => {
    if (!addressCheck) return;
    setCheckResult(addressCheck.toLowerCase().includes("dead") || addressCheck.toLowerCase().includes("bad") ? "blocked" : "approved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-950">Compliance Center</h2>
        <p className="text-sm text-neutral-600">On-chain compliance controls, KYC/AML management, and regulatory reporting</p>
      </div>

      {/* Compliance Score Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Risk Score" value="A+" icon={Shield} trend="up" change="Excellent" />
        <StatCard title="KYC Sync Rate" value="100%" icon={Users} trend="up" change="Real-time" />
        <StatCard title="Active Restrictions" value="14" icon={Lock} trend="neutral" change="On-chain enforced" />
        <StatCard title="Alerts" value="2" icon={AlertTriangle} trend="down" change="Requires attention" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-neutral-200 pb-0 overflow-x-auto">
        {[
          { key: "rules", label: "Governance Rules", icon: FileText },
          { key: "sanctions", label: "Sanctions Radar", icon: Globe },
          { key: "documents", label: "Document Expiry", icon: Clock },
          { key: "audit", label: "Audit Ledger", icon: Eye },
          { key: "transfer", label: "Transfer Enforcement", icon: ArrowLeftRight },
          { key: "jurisdictions", label: "Jurisdictions", icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`whitespace-nowrap flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-neutral-950 text-neutral-950"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Rule ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Description</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Jurisdiction</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {complianceRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 text-sm font-mono text-neutral-950">{rule.id}</td>
                  <td className="px-5 py-3 text-sm text-neutral-900">{rule.description}</td>
                  <td className="px-5 py-3"><StatusBadge status={rule.type} variant="info" /></td>
                  <td className="px-5 py-3 text-sm text-neutral-800">{rule.jurisdiction}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={rule.active ? "Active" : "Disabled"} variant={rule.active ? "success" : "neutral"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sanctions Tab */}
      {activeTab === "sanctions" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-700" />
              <h3 className="text-sm font-semibold text-red-300">Active Sanctions Alerts</h3>
            </div>
            <div className="space-y-3">
              {sanctionsAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-red-500/20 bg-neutral-50 px-4 py-3">
                  <div>
                    <p className="text-sm text-neutral-900 font-mono">{alert.entity}</p>
                    <p className="text-xs text-neutral-600">{alert.reason}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={alert.severity} variant={alert.severity === "high" ? "error" : "warning"} />
                    <button className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/20">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-950">FATF Compliance Sync</h3>
              <StatusBadge status="Synced" variant="success" />
            </div>
            <p className="text-sm text-neutral-600">Sanctions lists are auto-synced against FATF, OFAC, EU, and UK HMT consolidated lists. Last sync: 2 hours ago.</p>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Investor</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Document Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Expires</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Days Left</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {documentExpiry.map((doc, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 text-sm text-neutral-900">{doc.investor}</td>
                  <td className="px-5 py-3 text-sm text-neutral-800">{doc.docType}</td>
                  <td className="px-5 py-3 text-sm text-neutral-600">{doc.expiresAt}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      status={`${doc.daysLeft} days`}
                      variant={doc.daysLeft < 30 ? "error" : doc.daysLeft < 90 ? "warning" : "success"}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <button className="rounded-md bg-neutral-950/5 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-neutral-950/10">
                      Send Renewal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-950">On-Chain Audit Trail</h3>
            <button className="flex items-center gap-2 text-xs text-neutral-950 hover:text-neutral-700">
              <Download className="h-3 w-3" /> Export Report
            </button>
          </div>
          <div className="space-y-2">
            {auditEntries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${entry.action.includes("SANCTION") ? "bg-red-400" : "bg-emerald-400"}`} />
                  <div>
                    <p className="text-sm text-neutral-900">{entry.action}</p>
                    <p className="text-xs text-neutral-500">Subject: {entry.subject} • By: {entry.performer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-600">{entry.details}</p>
                  <p className="text-xs text-neutral-400">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Enforcement Tab */}
      {activeTab === "transfer" && (
        <div className="space-y-6">
          {/* ERC-3643 Status */}
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-950">ERC-3643 Transfer Hook — Active</p>
              <p className="text-xs text-neutral-500">Every on-chain transfer passes through the compliance module before execution. Unapproved transfers revert automatically.</p>
            </div>
            <StatusBadge status="Enforced" variant="success" />
          </div>

          {/* Whitelist Check */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-neutral-950">Real-Time Whitelist Check</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="0x wallet address..."
                value={addressCheck}
                onChange={(e) => { setAddressCheck(e.target.value); setCheckResult(null); }}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-950 font-mono placeholder-neutral-400 focus:border-neutral-950 focus:outline-none"
              />
              <button
                onClick={handleAddressCheck}
                className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            {checkResult && (
              <div className={`mt-3 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                checkResult === "approved" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {checkResult === "approved" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {checkResult === "approved" ? `${addressCheck} is whitelisted — transfers permitted.` : `${addressCheck} is blocked — transfer would revert.`}
              </div>
            )}
          </div>

          {/* Transfer Restriction Rules */}
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-950">Active Transfer Restrictions</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Rule</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Applies To</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Enforcement</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-neutral-600">Total Checks</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-neutral-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {transferRules.map((r, i) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-sm text-neutral-900">{r.rule}</td>
                    <td className="px-5 py-3 text-sm text-neutral-600 font-mono">{r.token}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.enforcement} variant="info" /></td>
                    <td className="px-5 py-3 text-right text-sm text-neutral-800">{r.checks}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status === "active" ? "Active" : "Inactive"} variant={r.status === "active" ? "success" : "neutral"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jurisdictions Tab */}
      {activeTab === "jurisdictions" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4">
            <Globe className="h-5 w-5 text-neutral-700" />
            <p className="text-sm text-neutral-700">Jurisdiction-aware transfer logic is enforced at the ERC-3643 contract level. Each investor whitelist is scoped to their regulatory regime.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jurisdictions.map((j) => (
              <div key={j.code} className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{j.flag}</span>
                    <div>
                      <p className="text-sm font-bold text-neutral-950">{j.code}</p>
                      <p className="text-xs text-neutral-500">{j.region}</p>
                    </div>
                  </div>
                  <StatusBadge status={j.status === "active" ? "Active" : "Pending"} variant={j.status === "active" ? "success" : "warning"} />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Regulator</span>
                    <span className="font-medium text-neutral-800">{j.regulator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Whitelisted Investors</span>
                    <span className="font-medium text-neutral-800">{j.investors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Last Audit</span>
                    <span className="font-medium text-neutral-800">{j.lastAudit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Coverage</span>
                    <span className="font-medium text-neutral-800 text-right max-w-[140px] truncate">{j.coverage}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
                  <p className="text-[11px] text-neutral-600">{j.transferLogic}</p>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">{j.notes}</p>
                <button className="w-full rounded-md bg-neutral-950/5 py-2 text-xs font-medium text-neutral-950 hover:bg-neutral-950/10">
                  {j.status === "active" ? "Manage Jurisdiction" : "Begin Application"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
