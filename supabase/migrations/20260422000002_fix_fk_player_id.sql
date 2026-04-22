-- ============================================================
-- Fix FK: player_id su videos e certification_requests
-- Cambiato da player_profiles(id) → profiles(id)
-- Motivo: player_profiles viene creato durante l'onboarding, che non è
-- ancora obbligatorio. profiles invece esiste sempre dal signup (trigger).
-- ============================================================

ALTER TABLE videos
  DROP CONSTRAINT videos_player_id_fkey,
  ADD CONSTRAINT videos_player_id_fkey
    FOREIGN KEY (player_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE certification_requests
  DROP CONSTRAINT certification_requests_player_id_fkey,
  ADD CONSTRAINT certification_requests_player_id_fkey
    FOREIGN KEY (player_id) REFERENCES profiles(id) ON DELETE CASCADE;
