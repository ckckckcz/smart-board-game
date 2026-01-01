-- =====================================================
-- SMART BOARD GAME - Supabase Database Schema
-- =====================================================
-- Jalankan SQL ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- 1. Table: admin_settings (Pengaturan Admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin PIN
INSERT INTO admin_settings (key, value) 
VALUES ('admin_pin', '1234')
ON CONFLICT (key) DO NOTHING;

-- 2. Table: rounds (Babak/Ronde Permainan)
-- =====================================================
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  question_counts JSONB NOT NULL DEFAULT '{"C1": 0, "C2": 0, "C3": 0, "C4": 0, "C5": 0, "C6": 0}'::jsonb,
  total_questions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample rounds
INSERT INTO rounds (id, name, question_counts, total_questions) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Babak 1 - Dasar Akuntansi', '{"C1": 2, "C2": 2, "C3": 2, "C4": 0, "C5": 0, "C6": 0}'::jsonb, 6),
  ('550e8400-e29b-41d4-a716-446655440002', 'Babak 2 - Siklus Akuntansi', '{"C1": 1, "C2": 1, "C3": 2, "C4": 2, "C5": 0, "C6": 0}'::jsonb, 6),
  ('550e8400-e29b-41d4-a716-446655440003', 'Babak 3 - Laporan Keuangan', '{"C1": 0, "C2": 0, "C3": 1, "C4": 1, "C5": 2, "C6": 2}'::jsonb, 6)
ON CONFLICT DO NOTHING;

-- 3. Table: questions (Bank Soal)
-- =====================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('C1', 'C2', 'C3', 'C4', 'C5', 'C6')),
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'essay', 'matching')),
  question TEXT NOT NULL,
  image_url TEXT,
  -- For multiple choice
  options JSONB, -- Array of strings: ["option A", "option B", ...]
  -- For true/false and multiple choice
  correct_answer TEXT,
  -- For essay
  essay_answer TEXT,
  -- For matching
  matching_pairs JSONB, -- Array of {left, right}
  matching_answer TEXT, -- Format: "1A-2B-3C"
  time_limit INTEGER NOT NULL DEFAULT 30, -- in seconds
  points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample questions
INSERT INTO questions (category, type, question, correct_answer, time_limit, points) VALUES
  ('C1', 'true_false', 'Aset adalah sumber daya yang dikuasai oleh entitas sebagai akibat dari peristiwa masa lalu.', 'true', 30, 100),
  ('C1', 'true_false', 'Liabilitas adalah hak residual atas aset entitas setelah dikurangi semua liabilitas.', 'false', 30, 100),
  ('C2', 'true_false', 'Pendapatan diakui ketika terjadi peningkatan manfaat ekonomi.', 'true', 30, 100),
  ('C2', 'true_false', 'Beban adalah penurunan manfaat ekonomi selama periode akuntansi.', 'true', 30, 100),
  ('C3', 'true_false', 'Jurnal umum digunakan untuk mencatat transaksi secara kronologis.', 'true', 30, 100),
  ('C3', 'true_false', 'Buku besar adalah kumpulan akun-akun yang saling berhubungan.', 'true', 30, 100),
  ('C4', 'true_false', 'Neraca saldo disusun setelah posting ke buku besar.', 'true', 30, 100),
  ('C4', 'true_false', 'Jurnal penyesuaian dibuat di awal periode akuntansi.', 'false', 30, 100),
  ('C5', 'true_false', 'Laporan laba rugi menunjukkan posisi keuangan perusahaan.', 'false', 30, 100),
  ('C5', 'true_false', 'Laporan arus kas terdiri dari tiga aktivitas: operasi, investasi, dan pendanaan.', 'true', 30, 100),
  ('C6', 'true_false', 'Jurnal penutup dibuat untuk menutup akun nominal.', 'true', 30, 100),
  ('C6', 'true_false', 'Akun riil tidak perlu ditutup pada akhir periode.', 'true', 30, 100)
ON CONFLICT DO NOTHING;

-- 4. Table: players (Data Pemain/Leaderboard)
-- =====================================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  round_id UUID REFERENCES rounds(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);
CREATE INDEX IF NOT EXISTS idx_players_round_id ON players(round_id);

-- 5. Table: game_sessions (Sesi Permainan - opsional untuk tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- =====================================================
-- Enable Row Level Security (RLS) - Optional
-- =====================================================
-- Uncomment if you want to enable RLS

-- ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (for game functionality)
-- CREATE POLICY "Allow all for anon" ON rounds FOR ALL USING (true);
-- CREATE POLICY "Allow all for anon" ON questions FOR ALL USING (true);
-- CREATE POLICY "Allow all for anon" ON players FOR ALL USING (true);
-- CREATE POLICY "Allow select for anon" ON admin_settings FOR SELECT USING (true);

-- =====================================================
-- Useful Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rounds_updated_at ON rounds;
CREATE TRIGGER update_rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- View: Leaderboard with round name
-- =====================================================
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  p.id,
  p.name,
  p.score,
  p.correct_answers,
  p.wrong_answers,
  p.round_id,
  r.name as round_name,
  p.completed_at
FROM players p
LEFT JOIN rounds r ON p.round_id = r.id
ORDER BY p.score DESC;
