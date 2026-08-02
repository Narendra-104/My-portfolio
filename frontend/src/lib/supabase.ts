/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Sanitize & clean environment variables
function getCleanUrl(): string {
  let url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  // Remove surrounding single/double quotes
  url = url.replace(/^["']|["']$/g, '');
  if (!url) return '';
  // Automatically add https:// if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Remove trailing slash
  return url.replace(/\/+$/, '');
}

function getCleanKey(): string {
  let key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  return key.replace(/^["']|["']$/g, '');
}

const supabaseUrl = getCleanUrl();
const supabaseAnonKey = getCleanKey();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase configuration notice:\n' +
    `  - URL: ${supabaseUrl || 'MISSING'}\n` +
    `  - Key: ${supabaseAnonKey ? 'PRESENT' : 'MISSING'}\n` +
    'Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.'
  );
}

// Fallback to a valid placeholder domain if unconfigured, preventing relative path fetch attempts to Vercel
const validClientUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-invalid-url.supabase.co';
const validClientKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(validClientUrl, validClientKey);
export type SupabaseClient = typeof supabase;