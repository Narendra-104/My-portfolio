/**
 * db.ts — All Supabase database query functions for the portfolio.
 * Shows clear errors if tables are missing or connection fails.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { Project, Certificate } from '../types';

// ─── Types ───────────────────────────────────────────────────

export interface ContactMessageRow {
  id?: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  created_at?: string;
}

// ─── Helper: Log DB errors clearly ──────────────────────────

function dbError(fn: string, err: any) {
  const msg = err?.message || String(err);
  console.error(`[Supabase][${fn}] ${msg}`);
  // Show in browser console with table hint
  if (msg.includes('relation') && msg.includes('does not exist')) {
    console.error(
      `%c⚠️ Supabase table missing! Run the SQL setup script in your Supabase Dashboard → SQL Editor.`,
      'color: red; font-weight: bold; font-size: 14px;'
    );
  }
}

// ─── 1. CONTACT MESSAGES ─────────────────────────────────────

export async function insertContactMessage(data: Omit<ContactMessageRow, 'id' | 'created_at'>) {
  try {
    const { error } = await supabase.from('contact_messages').insert([data]);
    if (error) dbError('insertContactMessage', error);
    return !error;
  } catch (e) {
    dbError('insertContactMessage', e);
    return false;
  }
}

export async function fetchContactMessages(): Promise<ContactMessageRow[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { dbError('fetchContactMessages', error); return []; }
    return data || [];
  } catch (e) {
    dbError('fetchContactMessages', e);
    return [];
  }
}

export async function deleteContactMessage(id: string) {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) dbError('deleteContactMessage', error);
    return !error;
  } catch (e) {
    dbError('deleteContactMessage', e);
    return false;
  }
}

// ─── 2. PROJECTS ─────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) { dbError('fetchProjects', error); return null; }
    if (!data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category || '',
      description: row.description || '',
      longDescription: row.long_description || '',
      image: row.image || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      link: row.link || undefined,
      github: row.github || undefined,
      metrics: Array.isArray(row.metrics) ? row.metrics : [],
    }));
  } catch (e) {
    dbError('fetchProjects', e);
    return null;
  }
}

export async function upsertProject(project: Project): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').upsert([{
      id: project.id,
      title: project.title,
      category: project.category,
      description: project.description,
      long_description: project.longDescription,
      image: project.image,
      tags: project.tags,
      link: project.link || null,
      github: project.github || null,
      metrics: project.metrics || [],
    }], { onConflict: 'id' });
    if (error) { dbError('upsertProject', error); return false; }
    return true;
  } catch (e) {
    dbError('upsertProject', e);
    return false;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { dbError('deleteProject', error); return false; }
    return true;
  } catch (e) {
    dbError('deleteProject', e);
    return false;
  }
}

// ─── 3. CERTIFICATES ─────────────────────────────────────────

export async function fetchCertificates(): Promise<Certificate[] | null> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) { dbError('fetchCertificates', error); return null; }
    if (!data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      issuer: row.issuer || '',
      date: row.date || '',
      certId: row.cert_id || '',
      image: row.image || '',
      verifyUrl: row.verify_url || '',
    }));
  } catch (e) {
    dbError('fetchCertificates', e);
    return null;
  }
}

export async function upsertCertificate(cert: Certificate): Promise<boolean> {
  try {
    const { error } = await supabase.from('certificates').upsert([{
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      date: cert.date,
      cert_id: cert.certId,
      image: cert.image,
      verify_url: cert.verifyUrl,
    }], { onConflict: 'id' });
    if (error) { dbError('upsertCertificate', error); return false; }
    return true;
  } catch (e) {
    dbError('upsertCertificate', e);
    return false;
  }
}

export async function deleteCertificate(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) { dbError('deleteCertificate', error); return false; }
    return true;
  } catch (e) {
    dbError('deleteCertificate', e);
    return false;
  }
}

// ─── 4. IMAGE STORAGE UPLOAD ──────────────────────────────────

export async function uploadImageToSupabase(file: File, bucket = 'portfolio-images'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      dbError(`uploadImageToSupabase[${bucket}]`, uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  } catch (e) {
    dbError('uploadImageToSupabase', e);
    return null;
  }
}

// ─── 5. PORTFOLIO SETTINGS (text edits, about, skills, etc.) ─

export async function fetchPortfolioSetting<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) { dbError(`fetchPortfolioSetting[${key}]`, error); return null; }
    return data?.value as T ?? null;
  } catch (e) {
    dbError(`fetchPortfolioSetting[${key}]`, e);
    return null;
  }
}

export async function upsertPortfolioSetting(key: string, value: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('portfolio_settings')
      .upsert(
        [{ key, value, updated_at: new Date().toISOString() }],
        { onConflict: 'key' }
      );
    if (error) { dbError(`upsertPortfolioSetting[${key}]`, error); return false; }
    return true;
  } catch (e) {
    dbError(`upsertPortfolioSetting[${key}]`, e);
    return false;
  }
}

// ─── 6. HEALTH CHECK ─────────────────────────────────────────

/**
 * Test whether Supabase is reachable and tables exist.
 * Returns an object with status for each table.
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  tables: { projects: boolean; certificates: boolean; portfolio_settings: boolean };
  storage: boolean;
  error?: string;
}> {
  const result = {
    connected: false,
    tables: { projects: false, certificates: false, portfolio_settings: false },
    storage: false,
    error: undefined as string | undefined,
  };

  if (!isSupabaseConfigured) {
    result.error = 'Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) are missing or invalid in Vercel settings.';
    return result;
  }

  try {
    // Test projects table
    const { error: projErr } = await supabase.from('projects').select('id').limit(1);
    result.tables.projects = !projErr;

    // Test certificates table
    const { error: certErr } = await supabase.from('certificates').select('id').limit(1);
    result.tables.certificates = !certErr;

    // Test portfolio_settings table
    const { error: settErr } = await supabase.from('portfolio_settings').select('key').limit(1);
    result.tables.portfolio_settings = !settErr;

    // Test storage
    const { error: storErr } = await supabase.storage.from('portfolio-images').list('', { limit: 1 });
    result.storage = !storErr;

    result.connected = true;

    if (projErr || certErr || settErr) {
      const rawMsgs = [projErr, certErr, settErr]
        .filter(Boolean)
        .map((e: any) => e.message);

      if (rawMsgs.some(m => m.includes('Invalid path') || m.includes('Failed to fetch'))) {
        result.error = 'Invalid VITE_SUPABASE_URL format in Vercel. Ensure URL starts with https:// (e.g. https://xxxx.supabase.co)';
      } else {
        result.error = Array.from(new Set(rawMsgs)).join('; ');
      }
    }
  } catch (e: any) {
    result.error = e?.message || 'Cannot connect to Supabase';
  }

  return result;
}
