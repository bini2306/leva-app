-- Aggiunge team_name a player_profiles per l'onboarding del giocatore
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS team_name TEXT;
