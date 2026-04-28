-- Aggiunge foto tessera FIGC e flag di verifica al profilo coach
ALTER TABLE coach_profiles
  ADD COLUMN IF NOT EXISTS figc_card_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- Policy: il coach può caricare file nella propria cartella del bucket Avatar
CREATE POLICY "Avatar: authenticated users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'Avatar'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: il coach può sovrascrivere (upsert) i propri file
CREATE POLICY "Avatar: users can update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'Avatar'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
