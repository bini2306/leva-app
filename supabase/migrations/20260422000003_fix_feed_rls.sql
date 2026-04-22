-- ============================================================
-- Fix: policy SELECT mancanti che impedivano la visualizzazione del feed
-- ============================================================

-- 1. DB: tutti gli utenti autenticati vedono i video pubblicati nel feed
CREATE POLICY "videos: authenticated select published"
  ON videos FOR SELECT
  TO authenticated
  USING (is_published = true);

-- 2. Storage: tutti gli utenti autenticati possono leggere gli oggetti del
--    bucket Video — necessario perché createSignedUrls funzioni lato server
--    con la sessione utente (non service role).
CREATE POLICY "Video: authenticated users can read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'Video');
