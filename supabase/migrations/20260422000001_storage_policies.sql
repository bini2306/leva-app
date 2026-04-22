-- ============================================================
-- Storage policies per bucket `Video`
-- (bucket pubblico in lettura, ma upload/delete solo al proprietario)
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
