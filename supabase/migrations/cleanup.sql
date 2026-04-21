-- ============================================================
-- CLEANUP: elimina tutto in ordine inverso alle dipendenze
-- Eseguire PRIMA di ripetere la migration iniziale
-- ============================================================

DROP TRIGGER IF EXISTS on_certification_updated ON certification_requests;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS handle_certification_approved();
DROP FUNCTION IF EXISTS handle_new_user();

DROP TABLE IF EXISTS fcm_tokens;
DROP TABLE IF EXISTS certification_requests;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS scout_profiles;
DROP TABLE IF EXISTS player_profiles;
DROP TABLE IF EXISTS coach_profiles;
DROP TABLE IF EXISTS profiles;
