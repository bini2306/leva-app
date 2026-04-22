-- ============================================================
-- Storage policies per bucket `Video` (privato)
-- Lettura: solo server-side via signed URL (TTL 1h) generati col client Supabase
-- Scrittura/modifica/cancellazione: solo il proprietario nella propria cartella
-- ============================================================

-- Solo utenti autenticati caricano nella propria cartella `<user_id>/...`
CREATE POLICY "Video: authenticated users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'Video'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Solo il proprietario può cancellare/modificare i propri video
CREATE POLICY "Video: users can delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'Video'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Video: users can update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'Video'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
