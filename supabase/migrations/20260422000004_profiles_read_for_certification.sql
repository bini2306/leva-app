-- ============================================================
-- RLS profiles: permettere ai giocatori di cercare coach per nome
-- e ai coach di vedere il nome del giocatore richiedente
-- ============================================================

-- Tutti gli autenticati possono leggere i profili dei coach (per ricerca)
CREATE POLICY "profiles: authenticated select coach"
  ON profiles FOR SELECT
  TO authenticated
  USING (role = 'coach');

-- Il coach può leggere il profilo base dei giocatori che gli hanno
-- inviato una richiesta di certificazione
CREATE POLICY "profiles: coach select requesting players"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'player'
    AND EXISTS (
      SELECT 1 FROM certification_requests cr
      WHERE cr.player_id = profiles.id
      AND cr.coach_id = auth.uid()
    )
  );
