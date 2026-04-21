-- ============================================================
-- Storage policies per bucket `videos`
-- (bucket pubblico in lettura, ma upload/delete solo al proprietario)
-- ============================================================

-- Solo utenti autenticati caricano nella propria cartella `<user_id>/...`
CREATE POLICY "videos: authenticated users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Solo il proprietario può cancellare/modificare i propri video
CREATE POLICY "videos: users can delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "videos: users can update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
