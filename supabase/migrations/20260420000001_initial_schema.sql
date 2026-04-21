-- ============================================================
-- LEVA APP - Schema iniziale
-- ============================================================

-- Estensione UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELLA: profiles (estende auth.users)
-- ============================================================
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('player', 'coach', 'scout')),
  full_name  text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger: crea profilo automaticamente alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABELLA: coach_profiles
-- ============================================================
CREATE TABLE coach_profiles (
  id                  uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  figc_license_number text NOT NULL UNIQUE,
  figc_license_type   text CHECK (figc_license_type IN ('UEFA A', 'UEFA B', 'UEFA C', 'Patentino')),
  team_name           text,
  city                text
);

ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_profiles: select own" ON coach_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "coach_profiles: insert own" ON coach_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "coach_profiles: update own" ON coach_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Giocatori e scout possono leggere i profili coach (per ricerca)
CREATE POLICY "coach_profiles: select all authenticated" ON coach_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- TABELLA: player_profiles
-- ============================================================
CREATE TABLE player_profiles (
  id          uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  birth_date  date NOT NULL,
  position    text CHECK (position IN ('portiere', 'difensore', 'centrocampista', 'ala', 'attaccante')),
  bio         text,
  city        text,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES coach_profiles(id) ON DELETE SET NULL
);

ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_profiles: select own" ON player_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "player_profiles: insert own" ON player_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "player_profiles: update own" ON player_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Scout: legge tutti i profili giocatori
CREATE POLICY "player_profiles: scout select all" ON player_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'scout'
    )
  );

-- ============================================================
-- TABELLA: scout_profiles
-- ============================================================
CREATE TABLE scout_profiles (
  id                      uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization            text,
  subscription_status     text DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'trial', 'active', 'expired')),
  subscription_expires_at timestamptz
);

ALTER TABLE scout_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scout_profiles: select own" ON scout_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "scout_profiles: insert own" ON scout_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "scout_profiles: update own" ON scout_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- TABELLA: videos
-- ============================================================
CREATE TABLE videos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id        uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text,
  video_url        text NOT NULL,
  thumbnail_url    text,
  duration_seconds integer,
  views_count      integer DEFAULT 0,
  is_published     boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos: select own" ON videos
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "videos: insert own" ON videos
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "videos: update own" ON videos
  FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "videos: delete own" ON videos
  FOR DELETE USING (auth.uid() = player_id);

-- Scout: legge tutti i video pubblicati
CREATE POLICY "videos: scout select published" ON videos
  FOR SELECT USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'scout'
    )
  );

-- ============================================================
-- TABELLA: certification_requests
-- ============================================================
CREATE TABLE certification_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id        uuid NOT NULL UNIQUE REFERENCES player_profiles(id) ON DELETE CASCADE,
  coach_id         uuid NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  status           text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  player_message   text,
  rejection_reason text,
  requested_at     timestamptz DEFAULT now(),
  reviewed_at      timestamptz
);

ALTER TABLE certification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cert_requests: player select own" ON certification_requests
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "cert_requests: player insert" ON certification_requests
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "cert_requests: player delete own" ON certification_requests
  FOR DELETE USING (auth.uid() = player_id);

CREATE POLICY "cert_requests: coach select own" ON certification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coach_profiles
      WHERE coach_profiles.id = auth.uid()
      AND coach_profiles.id = certification_requests.coach_id
    )
  );

CREATE POLICY "cert_requests: coach update own" ON certification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM coach_profiles
      WHERE coach_profiles.id = auth.uid()
      AND coach_profiles.id = certification_requests.coach_id
    )
  );

-- ============================================================
-- TRIGGER: approvazione → aggiorna player_profiles
-- ============================================================
CREATE OR REPLACE FUNCTION handle_certification_approved()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE player_profiles
    SET
      is_verified = true,
      verified_at = now(),
      verified_by = NEW.coach_id
    WHERE id = NEW.player_id;

    UPDATE certification_requests
    SET reviewed_at = now()
    WHERE id = NEW.id;
  END IF;

  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    UPDATE certification_requests
    SET reviewed_at = now()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_certification_updated
  AFTER UPDATE ON certification_requests
  FOR EACH ROW EXECUTE FUNCTION handle_certification_approved();

-- ============================================================
-- POLICY DIFFERITE: richiedono certification_requests già esistente
-- ============================================================

-- Coach: legge i profili dei giocatori che gli hanno inviato richiesta
CREATE POLICY "player_profiles: coach select requesting" ON player_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM certification_requests cr
      JOIN coach_profiles cp ON cp.id = cr.coach_id
      WHERE cr.player_id = player_profiles.id
      AND cp.id = auth.uid()
    )
  );

-- Coach: legge i video dei giocatori richiedenti
CREATE POLICY "videos: coach select requesting players" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM certification_requests cr
      JOIN coach_profiles cp ON cp.id = cr.coach_id
      WHERE cr.player_id = videos.player_id
      AND cp.id = auth.uid()
    )
  );

-- ============================================================
-- TABELLA: fcm_tokens (Firebase push notifications)
-- ============================================================
CREATE TABLE fcm_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  device_type text CHECK (device_type IN ('ios', 'android', 'web')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fcm_tokens: CRUD own" ON fcm_tokens
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE: bucket setup (da eseguire via Supabase dashboard o CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
