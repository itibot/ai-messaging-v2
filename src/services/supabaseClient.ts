
import { createClient } from '@supabase/supabase-js';

// Prioritize browser-safe environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Data persistence will be disabled.');
}

/**
 * Centrailzed Supabase client for the AI Scouting Network.
 * Used for multi-tenant data fetching with Row-Level Security (RLS).
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
