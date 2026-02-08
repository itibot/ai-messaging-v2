-- Initial Schema for AI Scouting Network

-- 1. Tenants Table (The foundation of multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    brand_color TEXT DEFAULT '#38003c',
    ai_model_preference TEXT DEFAULT 'gemini-2.5-flash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Scouting Reports (Persistent AI Analysis)
CREATE TABLE IF NOT EXISTS scouting_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    prompt TEXT NOT NULL,
    report_text TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Player Cache (Optimized local FPL data)
CREATE TABLE IF NOT EXISTS player_cache (
    fpl_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    position TEXT NOT NULL,
    data JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_tenant ON scouting_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_player_name ON player_cache(name);
