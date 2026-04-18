-- EQUITEX RWA Platform - Supabase Schema
-- Run this in your Supabase SQL editor

-- Assets table (off-chain metadata for tokenized assets)
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT UNIQUE NOT NULL,
  issuer_address TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('bond', 'credit', 'commodity', 'equity')),
  jurisdiction TEXT NOT NULL DEFAULT 'GB',
  description TEXT DEFAULT '',
  legal_entity TEXT DEFAULT '',
  ipfs_doc_hash TEXT DEFAULT '',
  total_value_usd NUMERIC DEFAULT 0,
  maturity_date TIMESTAMPTZ,
  yield_bps INTEGER DEFAULT 0,
  risk_rating TEXT DEFAULT 'low' CHECK (risk_rating IN ('minimal', 'low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investors table (off-chain investor profiles)
CREATE TABLE IF NOT EXISTS investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  investor_type TEXT DEFAULT 'retail' CHECK (investor_type IN ('retail', 'professional', 'institutional')),
  jurisdiction TEXT DEFAULT 'GB',
  kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected', 'expired')),
  kyc_doc_hash TEXT DEFAULT '',
  risk_score INTEGER DEFAULT 0,
  issuer_address TEXT,
  onboarded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (event log mirror)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT NOT NULL,
  event_type TEXT NOT NULL,
  token_address TEXT,
  from_address TEXT,
  to_address TEXT,
  amount TEXT DEFAULT '0',
  block_number BIGINT DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Compliance documents table
CREATE TABLE IF NOT EXISTS compliance_docs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  doc_type TEXT NOT NULL, -- 'kyc', 'kyb', 'accreditation', 'tax'
  ipfs_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issuer settings
CREATE TABLE IF NOT EXISTS issuer_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  company_name TEXT DEFAULT '',
  company_registration TEXT DEFAULT '',
  jurisdiction TEXT DEFAULT 'GB',
  notification_email TEXT DEFAULT '',
  webhook_url TEXT DEFAULT '',
  auto_whitelist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_issuer ON assets(issuer_address);
CREATE INDEX IF NOT EXISTS idx_investors_issuer ON investors(issuer_address);
CREATE INDEX IF NOT EXISTS idx_transactions_token ON transactions(token_address);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_docs_wallet ON compliance_docs(wallet_address);

-- RLS Policies (enable Row Level Security)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE issuer_settings ENABLE ROW LEVEL SECURITY;

-- Allow all reads/writes for now (tighten with auth later)
CREATE POLICY "Allow all" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON investors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON compliance_docs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON issuer_settings FOR ALL USING (true) WITH CHECK (true);
