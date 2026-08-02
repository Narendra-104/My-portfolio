-- ============================================================
-- PORTFOLIO SUPABASE SETUP SCRIPT
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  category    TEXT,
  description TEXT,
  long_description TEXT,
  image       TEXT,
  tags        JSONB  DEFAULT '[]',
  link        TEXT,
  github      TEXT,
  metrics     JSONB  DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title      TEXT NOT NULL,
  issuer     TEXT,
  date       TEXT,
  cert_id    TEXT,
  image      TEXT,
  verify_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PORTFOLIO SETTINGS TABLE (stores text edits — About, Skills, Experience, Hero, etc.)
CREATE TABLE IF NOT EXISTS portfolio_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT 'null',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  inquiry_type TEXT,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — Allow public READ + WRITE for all tables
-- (Since this is a personal portfolio admin)
-- ============================================================

-- PROJECTS: public read + write
DROP POLICY IF EXISTS "Public read projects"   ON projects;
DROP POLICY IF EXISTS "Public write projects"  ON projects;
CREATE POLICY "Public read projects"  ON projects FOR SELECT USING (true);
CREATE POLICY "Public write projects" ON projects FOR ALL    USING (true) WITH CHECK (true);

-- CERTIFICATES: public read + write
DROP POLICY IF EXISTS "Public read certs"   ON certificates;
DROP POLICY IF EXISTS "Public write certs"  ON certificates;
CREATE POLICY "Public read certs"  ON certificates FOR SELECT USING (true);
CREATE POLICY "Public write certs" ON certificates FOR ALL    USING (true) WITH CHECK (true);

-- PORTFOLIO SETTINGS: public read + write
DROP POLICY IF EXISTS "Public read settings"   ON portfolio_settings;
DROP POLICY IF EXISTS "Public write settings"  ON portfolio_settings;
CREATE POLICY "Public read settings"  ON portfolio_settings FOR SELECT USING (true);
CREATE POLICY "Public write settings" ON portfolio_settings FOR ALL    USING (true) WITH CHECK (true);

-- CONTACT MESSAGES: public insert + owner read
DROP POLICY IF EXISTS "Public insert messages"  ON contact_messages;
DROP POLICY IF EXISTS "Public read messages"    ON contact_messages;
CREATE POLICY "Public insert messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read messages"   ON contact_messages FOR SELECT USING (true);

-- ============================================================
-- STORAGE BUCKET — portfolio-images
-- Run this too (Storage → Create bucket via Dashboard OR via SQL below)
-- ============================================================

-- If the bucket doesn't exist yet, create it:
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to upload and read from portfolio-images bucket
DROP POLICY IF EXISTS "Public read portfolio-images"   ON storage.objects;
DROP POLICY IF EXISTS "Public upload portfolio-images" ON storage.objects;

CREATE POLICY "Public read portfolio-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "Public upload portfolio-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Public update portfolio-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-images');

-- ============================================================
-- DONE! All 4 tables and storage bucket are ready.
-- ============================================================
