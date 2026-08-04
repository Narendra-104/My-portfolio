/**
 * db.ts — All Supabase database query functions for the portfolio.
 * Shows clear errors if tables are missing or connection fails.
 * Fully compatible with custom table column schemas (5-column or 10-column tables).
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

/** Fetch all projects from Supabase DB (merging projects table & portfolio_settings) */
export async function fetchProjects(): Promise<Project[] | null> {
  try {
    // 1. Fetch from 'projects' table
    const { data: projRows, error: projErr } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });

    // 2. Also fetch from 'portfolio_settings' table (backup key)
    const settingsBackup = await fetchPortfolioSetting<Project[]>('portfolio_custom_projects');

    if (projErr && (!settingsBackup || settingsBackup.length === 0)) {
      dbError('fetchProjects', projErr);
      return null;
    }

    // Map table rows (supporting image, image_url, and url column names)
    const dbProjects: Project[] = (projRows || []).map((row: any) => ({
      id: String(row.id),
      title: row.title || 'Untitled Project',
      category: row.category || '',
      description: row.description || '',
      longDescription: row.long_description || row.longDescription || '',
      image: row.image || row.image_url || row.url || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      link: row.link || undefined,
      github: row.github || undefined,
      metrics: Array.isArray(row.metrics) ? row.metrics : [],
    }));

    // If table has data, merge any extra fields from settings backup
    if (dbProjects.length > 0) {
      if (settingsBackup && settingsBackup.length > 0) {
        const settingsMap = new Map(settingsBackup.map(p => [p.id, p]));
        return dbProjects.map(p => {
          const extra = settingsMap.get(p.id);
          return {
            ...p,
            category: p.category || extra?.category || 'Development',
            longDescription: p.longDescription || extra?.longDescription || '',
            image: p.image || extra?.image || '',
            tags: p.tags.length > 0 ? p.tags : (extra?.tags || []),
            link: p.link || extra?.link,
            github: p.github || extra?.github,
            metrics: p.metrics && p.metrics.length > 0 ? p.metrics : extra?.metrics,
          };
        });
      }
      return dbProjects;
    }

    // Fallback to settings backup if table empty
    if (settingsBackup && settingsBackup.length > 0) {
      return settingsBackup;
    }

    return null;
  } catch (e) {
    dbError('fetchProjects', e);
    return null;
  }
}

/** Upsert project supporting both 10-column and 5-column 'projects' tables + portfolio_settings */
export async function upsertProject(project: Project): Promise<boolean> {
  let success = false;
  try {
    const imageUrl = project.image || '';

    // Attempt 1: Full column upsert (for 10-column projects table)
    const fullPayload: any = {
      id: project.id,
      title: project.title,
      category: project.category,
      description: project.description,
      long_description: project.longDescription,
      image: imageUrl,
      image_url: imageUrl,
      tags: project.tags,
      link: project.link || null,
      github: project.github || null,
      metrics: project.metrics || [],
    };

    const { error: fullErr } = await supabase.from('projects').upsert([fullPayload], { onConflict: 'id' });

    if (!fullErr) {
      success = true;
    } else {
      // Attempt 2: Minimal 5-column upsert (for 5-column projects table)
      const minimalPayload: any = {
        id: project.id,
        title: project.title,
        description: project.description,
        image_url: imageUrl,
      };

      const { error: minErr } = await supabase.from('projects').upsert([minimalPayload], { onConflict: 'id' });
      if (!minErr) {
        success = true;
      } else {
        dbError('upsertProject (minimal)', minErr);
      }
    }
  } catch (e) {
    dbError('upsertProject', e);
  }

  // Backup: Always save full list to portfolio_settings table
  try {
    const currentList = (await fetchProjects()) || [];
    const idx = currentList.findIndex(p => p.id === project.id);
    let updatedList: Project[];
    if (idx >= 0) {
      updatedList = [...currentList];
      updatedList[idx] = project;
    } else {
      updatedList = [...currentList, project];
    }
    await upsertPortfolioSetting('portfolio_custom_projects', updatedList);
    success = true;
  } catch (e) {
    dbError('upsertProject (portfolio_settings backup)', e);
  }

  return success;
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await supabase.from('projects').delete().eq('id', id);
    const currentList = (await fetchProjects()) || [];
    const updatedList = currentList.filter(p => p.id !== id);
    await upsertPortfolioSetting('portfolio_custom_projects', updatedList);
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
      id: String(row.id),
      title: row.title,
      issuer: row.issuer || '',
      date: row.date || '',
      certId: row.cert_id || row.certId || '',
      image: row.image || row.image_url || row.url || '',
      verifyUrl: row.verify_url || row.verifyUrl || '',
    }));
  } catch (e) {
    dbError('fetchCertificates', e);
    return null;
  }
}

export async function upsertCertificate(cert: Certificate): Promise<boolean> {
  let success = false;
  try {
    const imageUrl = cert.image || '';
    const payload = {
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      date: cert.date,
      cert_id: cert.certId,
      image: imageUrl,
      image_url: imageUrl,
      verify_url: cert.verifyUrl,
    };
    const { error } = await supabase.from('certificates').upsert([payload], { onConflict: 'id' });
    if (!error) success = true;
    else dbError('upsertCertificate', error);
  } catch (e) {
    dbError('upsertCertificate', e);
  }

  // Backup to portfolio_settings
  try {
    const current = (await fetchCertificates()) || [];
    const idx = current.findIndex(c => c.id === cert.id);
    const updated = idx >= 0 ? current.map((c, i) => i === idx ? cert : c) : [...current, cert];
    await upsertPortfolioSetting('portfolio_custom_certificates', updated);
    success = true;
  } catch (e) {}

  return success;
}

export async function deleteCertificate(id: string): Promise<boolean> {
  try {
    await supabase.from('certificates').delete().eq('id', id);
    const current = (await fetchCertificates()) || [];
    const updated = current.filter(c => c.id !== id);
    await upsertPortfolioSetting('portfolio_custom_certificates', updated);
    return true;
  } catch (e) {
    dbError('deleteCertificate', e);
    return false;
  }
}

// ─── 4. IMAGE STORAGE UPLOAD (Multi-Bucket Fallback) ─────────

/**
 * Upload image file to Supabase Storage.
 * Tries 'portfolio-photos' first, then 'portfolio-images'.
 */
export async function uploadImageToSupabase(file: File, primaryBucket = 'portfolio-photos'): Promise<string | null> {
  const bucketsToTry = [primaryBucket, 'portfolio-photos', 'portfolio-images'];
  const uniqueBuckets = Array.from(new Set(bucketsToTry));

  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  for (const bucket of uniqueBuckets) {
    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      } else {
        console.warn(`[Supabase Storage] Upload to bucket '${bucket}' failed: ${uploadError.message}`);
      }
    } catch (e) {
      console.warn(`[Supabase Storage] Exception uploading to bucket '${bucket}':`, e);
    }
  }

  return null;
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
    const { error: projErr } = await supabase.from('projects').select('id').limit(1);
    result.tables.projects = !projErr;

    const { error: certErr } = await supabase.from('certificates').select('id').limit(1);
    result.tables.certificates = !certErr;

    const { error: settErr } = await supabase.from('portfolio_settings').select('key').limit(1);
    result.tables.portfolio_settings = !settErr;

    const { error: storErr } = await supabase.storage.from('portfolio-photos').list('', { limit: 1 });
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
