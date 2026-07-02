import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for Supabase tables
export interface DBAsset {
  id: string;
  token_address: string;
  issuer_address: string;
  name: string;
  symbol: string;
  asset_type: string;
  jurisdiction: string;
  description: string;
  legal_entity: string;
  ipfs_doc_hash: string;
  total_value_usd: number;
  maturity_date: string | null;
  yield_bps: number;
  risk_rating: string;
  // Chain the token was deployed to. Nullable because rows saved before
  // multi-chain support (and any Supabase project that hasn't added this
  // column yet — see saveAsset's fallback below) won't have it; treat a
  // missing value as the default chain (Sepolia today).
  chain_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface DBInvestor {
  id: string;
  wallet_address: string;
  display_name: string;
  email: string;
  investor_type: string;
  jurisdiction: string;
  kyc_status: string;
  kyc_doc_hash: string;
  risk_score: number;
  onboarded_at: string;
  updated_at: string;
}

export interface DBTransaction {
  id: string;
  tx_hash: string;
  event_type: string;
  token_address: string;
  from_address: string;
  to_address: string;
  amount: string;
  block_number: number;
  timestamp: string;
  metadata: Record<string, unknown>;
}

// ── Supabase Helper Functions ──

export async function saveAsset(asset: Partial<DBAsset>) {
  const { data, error } = await supabase.from("assets").upsert(asset).select();
  if (error) {
    // chain_id may not exist yet on Supabase projects that haven't run the
    // migration to add it — retry without it rather than losing the save.
    if ("chain_id" in asset && /chain_id/i.test(error.message || "")) {
      const { chain_id: _chain_id, ...withoutChainId } = asset;
      const { data: retryData, error: retryError } = await supabase.from("assets").upsert(withoutChainId).select();
      if (retryError) throw retryError;
      return retryData[0];
    }
    throw error;
  }
  return data[0];
}

export async function getAssetsByIssuer(issuerAddress: string) {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("issuer_address", issuerAddress)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DBAsset[];
}

// All assets deployed by any issuer — powers the investor marketplace's
// live on-chain listings.
export async function getAllAssets() {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DBAsset[];
}

export async function getAssetBySymbol(symbol: string) {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .ilike("symbol", symbol)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as DBAsset | null;
}

export async function saveInvestor(investor: Partial<DBInvestor>) {
  const { data, error } = await supabase.from("investors").upsert(investor).select();
  if (error) throw error;
  return data[0];
}

export async function getInvestors(issuerAddress?: string) {
  let query = supabase.from("investors").select("*").order("onboarded_at", { ascending: false });
  if (issuerAddress) {
    query = query.eq("issuer_address", issuerAddress);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as DBInvestor[];
}

export async function saveTransaction(tx: Partial<DBTransaction>) {
  const { data, error } = await supabase.from("transactions").insert(tx).select();
  if (error) throw error;
  return data[0];
}

export async function getTransactions(tokenAddress?: string, limit = 50) {
  let query = supabase
    .from("transactions")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (tokenAddress) {
    query = query.eq("token_address", tokenAddress);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as DBTransaction[];
}
