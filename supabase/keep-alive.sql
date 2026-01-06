-- =====================================================
-- KEEP ALIVE - Table untuk tracking ping Supabase
-- =====================================================
-- Jalankan SQL ini di Supabase SQL Editor
-- Ini akan mencegah database di-pause karena tidak aktif
-- =====================================================

-- Table untuk menyimpan log keep-alive
CREATE TABLE IF NOT EXISTS keep_alive_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinged_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'vercel-cron',
  status TEXT DEFAULT 'success',
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index untuk query berdasarkan waktu
CREATE INDEX IF NOT EXISTS idx_keep_alive_pinged_at ON keep_alive_logs(pinged_at DESC);

-- Function untuk membersihkan log lama (lebih dari 30 hari)
CREATE OR REPLACE FUNCTION cleanup_old_keep_alive_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM keep_alive_logs 
  WHERE pinged_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Scheduled cleanup menggunakan pg_cron (jika tersedia di plan Anda)
-- SELECT cron.schedule('cleanup-keep-alive-logs', '0 0 * * 0', 'SELECT cleanup_old_keep_alive_logs()');

-- =====================================================
-- Contoh query untuk testing
-- =====================================================
-- Insert test ping:
-- INSERT INTO keep_alive_logs (source, status, response_time_ms) VALUES ('manual-test', 'success', 50);

-- Lihat log terbaru:
-- SELECT * FROM keep_alive_logs ORDER BY pinged_at DESC LIMIT 10;

-- Hitung total ping bulan ini:
-- SELECT COUNT(*) FROM keep_alive_logs WHERE pinged_at >= DATE_TRUNC('month', NOW());
