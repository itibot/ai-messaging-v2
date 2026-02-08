-- Supabase Schema with Row-Level Security (RLS)

-- 1. Profiles Table (Link users to tenants)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Scouting Reports (Isolated by Tenant)
CREATE TABLE IF NOT EXISTS scouting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  report_text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Player Cache (Shared read-only cache)
CREATE TABLE IF NOT EXISTS player_cache (
  fpl_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT NOT NULL,
  data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_cache ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Scouting Reports: Users can see reports for their tenant
CREATE POLICY "Users can view reports for their tenant" 
ON scouting_reports FOR SELECT 
USING (
  tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  )
);

-- Player Cache: Everyone can read
CREATE POLICY "Everyone can read player cache" 
ON player_cache FOR SELECT 
TO authenticated, anon
USING (true);
