import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { mockEngine } from '../mockEngine';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Creates and returns a Supabase client instance for client-side usage.
 * Includes a fallback to local storage mock engine if Supabase credentials are missing.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export const supabaseClient = createClient();
