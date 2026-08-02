/**
 * db.ts — All Supabase database query functions for the portfolio.
 * Gracefully falls back (no crash) if Supabase is unavailable.
 */

import { supabase } from './supabase';
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

export interface PageViewRow {
  section: string;
  view_count?: number;
  last_viewed_at?: string;
}

export interface ChatLogRow {
  user_message: string;
  ai_response: string;
  created_at?: string;
}

// ─── 1. CONTACT MESSAGES ─────────────────────────────────────

/** Insert a new contact form submission */
export async function insertContactMessage(data: Omit<ContactMessageRow, 'id' | 'created_at'>) {
  try {
    const { error } = await supabase.from('contact_messages').insert([data]);
    if (error) console.warn('Supabase insertContactMessage error:', error.message);
    return !error;
  } catch (e) {
    console.warn('insertContactMessage failed (offline?):', e);
    return false;
  }
}

/** Fetch all contact messages (owner only) */
export async function fetchContactMessages(): Promise<ContactMessageRow[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.warn('fetchContactMessages error:', error.message); return []; }
    return data || [];
  } catch (e) {
    console.warn('fetchContactMessages failed (offline?):', e);
    return [];
  }
}

/** Delete a contact message by id */
export async function deleteContactMessage(id: string) {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) console.warn('deleteContactMessage error:', error.message);
    return !error;
  } catch (e) {
    console.warn('deleteContactMessage failed:', e);
    return false;
  }
}

// ─── 2. PAGE VIEWS ───────────────────────────────────────────

/** Upsert (increment) a page view count for a section */
export async function trackPageView(section: string) {
  try {
    // First try to get existing row
    const { data: existing } = await supabase
      .from('page_views')
      .select('view_count')
      .eq('section', section)
      .maybeSingle();

    if (existing) {
      // Increment
      await supabase
        .from('page_views')
        .update({ view_count: (existing.view_count || 0) + 1, last_viewed_at: new Date().toISOString() })
        .eq('section', section);
    } else {
      // Insert new
      await supabase
        .from('page_views')
        .insert([{ section, view_count: 1, last_viewed_at: new Date().toISOString() }]);
    }
  } catch (e) {
    // Silent fail — analytics should never break the page
  }
}

/** Fetch all page view stats (owner analytics) */
export async function fetchPageViews(): Promise<PageViewRow[]> {
  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .order('view_count', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

// ─── 3. AI CHAT LOGS ─────────────────────────────────────────

/** Log a chat exchange to Supabase */
export async function logChatMessage(userMessage: string, aiResponse: string) {
  try {
    await supabase.from('chat_logs').insert([{ user_message: userMessage, ai_response: aiResponse }]);
  } catch (e) {
    // Silent fail
  }
}

/** Fetch recent chat logs (owner) */
export async function fetchChatLogs(limit = 50): Promise<ChatLogRow[]> {
  try {
    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

// ─── 4. PROJECTS ─────────────────────────────────────────────

/** Fetch all projects from Supabase */
export async function fetchProjects(): Promise<Project[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return null;

    // Map snake_case DB columns → camelCase Project interface
    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      longDescription: row.long_description,
      image: row.image,
      tags: row.tags || [],
      link: row.link,
      github: row.github,
      metrics: row.metrics || [],
    }));
  } catch (e) {
    return null;
  }
}

/** Upsert (insert or update) a project in Supabase */
export async function upsertProject(project: Project) {
  try {
    const { error } = await supabase.from('projects').upsert([{
      id: project.id,
      title: project.title,
      category: project.category,
      description: project.description,
      long_description: project.longDescription,
      image: project.image,
      tags: project.tags,
      link: project.link,
      github: project.github,
      metrics: project.metrics,
    }]);
    if (error) console.warn('upsertProject error:', error.message);
    return !error;
  } catch (e) {
    console.warn('upsertProject failed:', e);
    return false;
  }
}

/** Delete a project from Supabase */
export async function deleteProject(id: string) {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// ─── 5. CERTIFICATES ─────────────────────────────────────────

/** Fetch all certificates from Supabase */
export async function fetchCertificates(): Promise<Certificate[] | null> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      issuer: row.issuer,
      date: row.date,
      certId: row.cert_id,
      image: row.image,
      verifyUrl: row.verify_url,
    }));
  } catch (e) {
    return null;
  }
}

/** Upsert (insert or update) a certificate in Supabase */
export async function upsertCertificate(cert: Certificate) {
  try {
    const { error } = await supabase.from('certificates').upsert([{
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      date: cert.date,
      cert_id: cert.certId,
      image: cert.image,
      verify_url: cert.verifyUrl,
    }]);
    if (error) console.warn('upsertCertificate error:', error.message);
    return !error;
  } catch (e) {
    return false;
  }
}

/** Delete a certificate from Supabase */
export async function deleteCertificate(id: string) {
  try {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// ─── 6. IMAGE STORAGE UPLOAD ──────────────────────────────────

/**
 * Upload a File object directly to Supabase Storage bucket and return its public URL.
 * Falls back gracefully if bucket or connection fails.
 */
export async function uploadImageToSupabase(file: File, bucket = 'portfolio-photos'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn(`Supabase Storage upload to bucket '${bucket}' warning:`, uploadError.message);
      // Try fallback bucket 'portfolio' if custom bucket fails
      if (bucket !== 'portfolio') {
        const { error: fallbackError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });
        if (!fallbackError) {
          const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
          return data.publicUrl;
        }
      }
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  } catch (e) {
    console.warn('uploadImageToSupabase exception:', e);
    return null;
  }
}

// ─── 7. PORTFOLIO SETTINGS & SITE DATA ────────────────────────

/**
 * Fetch generic key-value setting from 'portfolio_settings' table
 */
export async function fetchPortfolioSetting<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error || !data) return null;
    return data.value as T;
  } catch (e) {
    return null;
  }
}

/**
 * Upsert generic key-value setting in 'portfolio_settings' table
 */
export async function upsertPortfolioSetting(key: string, value: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('portfolio_settings')
      .upsert([{ key, value, updated_at: new Date().toISOString() }], { onConflict: 'key' });
    if (error) console.warn(`upsertPortfolioSetting error [${key}]:`, error.message);
    return !error;
  } catch (e) {
    return false;
  }
}

