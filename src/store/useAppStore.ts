import { create } from "zustand";
import type { TokenizedAsset, PortfolioMetrics } from "@/types";

interface AppState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Role
  role: "issuer" | "investor";
  setRole: (role: "issuer" | "investor") => void;

  // Assets
  assets: TokenizedAsset[];
  setAssets: (assets: TokenizedAsset[]) => void;
  addAsset: (asset: TokenizedAsset) => void;

  // Portfolio Metrics
  metrics: PortfolioMetrics;
  setMetrics: (metrics: PortfolioMetrics) => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  role: "issuer",
  setRole: (role) => set({ role }),

  assets: [],
  setAssets: (assets) => set({ assets }),
  addAsset: (asset) => set((s) => ({ assets: [asset, ...s.assets] })),

  metrics: {
    totalAUM: "0",
    totalTokens: 0,
    totalHolders: 0,
    averageYield: 0,
    complianceScore: "A+",
    activeRestrictions: 0,
  },
  setMetrics: (metrics) => set({ metrics }),

  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
