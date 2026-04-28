# Claude.md - Progetto Leva

App italiana di scouting per il calcio giovanile. Feed video verticale stile TikTok. La credibilità del sistema si basa sulla certificazione dei profili da parte degli allenatori con licenza FIGC — non dall'auto-dichiarazione del giocatore.

## Utenti

| Ruolo | Età / Requisito | Costo | Azione principale |
|---|---|---|---|
| **Giocatore** | 14-18 anni | Gratis | Carica video delle proprie giocate |
| **Allenatore FIGC** | Licenza FIGC | Gratis | Certifica ("firma") i profili dei propri giocatori |
| **Scout** | — | A pagamento | Cerca e contatta talenti verificati |

## Meccanica chiave

- Il giocatore carica video → l'allenatore FIGC firma il profilo → lo scout vede il feed con badge di stato
- La firma dell'allenatore è il differenziatore di credibilità rispetto ad altri servizi
- Modello freemium: gratuito per chi produce contenuto (giocatori + allenatori), monetizzazione lato scout
- Scout vedono TUTTI i profili nel feed, con badge visivo che distingue verificati da non verificati

---

## Stack

| Layer | Tecnologia | Uso |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript | Routing, rendering, UI |
| Stile | Tailwind CSS v4 | Mobile-first styling |
| Backend / Auth | Supabase | Auth, database PostgreSQL, storage video |
| Notifiche push | Firebase Admin SDK (solo FCM) | Push a coach e giocatori — nessun Firestore |
| Repository | GitHub `bini2306/leva-app` | `main` branch |

---

## Struttura Progetto

```
leva-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx       ← multi-step: selezione ruolo → form
│   │   ├── (app)/
│   │   │   ├── onboarding/           ← completamento profilo dopo primo accesso
│   │   │   ├── feed/                 ← feed verticale TikTok-style
│   │   │   ├── upload/               ← caricamento video
│   │   │   ├── profile/              ← profilo giocatore
│   │   │   ├── certify/              ← player: richiesta certificazione
│   │   │   └── coach/                ← coach: approva/rifiuta richieste
│   │   ├── actions/
│   │   │   ├── auth.ts               ← login, signup, logout
│   │   │   ├── videos.ts             ← uploadVideo
│   │   │   ├── certification.ts      ← searchCoaches, requestCertification, approve, reject
│   │   │   └── onboarding.ts         ← completePlayerOnboarding, completeCoachOnboarding
│   │   ├── api/notify/route.ts       ← webhook Supabase → FCM push
│   │   ├── auth/callback/route.ts
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   ├── middleware.ts
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts
│       │   ├── server.ts
│       │   ├── middleware.ts
│       │   └── types.ts              ← tipi TypeScript manuali del DB
│       └── firebase/
│           └── admin.ts              ← Firebase Admin singleton + FCM helpers
├── supabase/
│   └── migrations/
│       ├── 20260420000001_initial_schema.sql
│       ├── 20260422000001_storage_policies.sql
│       ├── 20260422000002_fix_fk_player_id.sql
│       ├── 20260422000003_fix_feed_rls.sql
│       ├── 20260422000004_profiles_read_for_certification.sql
│       └── 20260423000001_player_profile_team_name.sql
├── .env.local                        ← NON in git — credenziali reali
├── .env.local.example
├── CLAUDE.md
└── package.json
```

---

## Credenziali configurate (.env.local)

> `.env.local` è in `.gitignore` — non viene mai committato.

| Variabile | Stato |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurata — `https://dfmmzbklpysyjkgnvzzy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Configurata |
| `FIREBASE_PROJECT_ID` | ✅ Configurata — `leva-853e4` |
| `FIREBASE_CLIENT_EMAIL` | ✅ Configurata — `firebase-adminsdk-fbsvc@leva-853e4.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | ✅ Configurata |
| `SUPABASE_WEBHOOK_SECRET` | ✅ Configurata |

---

## Schema DB Supabase

Tutte le tabelle hanno **Row Level Security (RLS)** abilitata.

| Tabella | Descrizione |
|---|---|
| `profiles` | Profilo base per tutti gli utenti (role: `player` / `coach` / `scout`) — si crea automaticamente al signup via trigger |
| `player_profiles` | Dati giocatore: posizione, bio, città, `is_verified`, `verified_by` |
| `coach_profiles` | Dati coach: `figc_license_number` (UNIQUE), tipo licenza, squadra |
| `scout_profiles` | Dati scout: organizzazione, `subscription_status` |
| `videos` | Video caricati dai giocatori — `video_url` punta a Supabase Storage (bucket privato `Video`) |
| `certification_requests` | Richieste verifica giocatore→coach — `player_id UNIQUE` (una sola richiesta attiva per giocatore) |
| `fcm_tokens` | Token FCM per notifiche push — uno per device per utente |

### Trigger SQL attivi

- **`on_auth_user_created`** → crea riga in `profiles` automaticamente al signup
- **`on_certification_updated`** → quando coach approva: setta `player_profiles.is_verified = true`, `verified_by`, `verified_at`

### Storage bucket da creare (via dashboard Supabase)

> **Nomi esatti — case-sensitive.** Il codice referenzia questi nomi letterali.

| Bucket | Accesso |
|---|---|
| `Video` | Privato (read via signed URL dal server, 1h TTL) |
| `Thumbnails` | Pubblico |
| `Avatar` | Pubblico |

---

## Flusso Certificazione

```
1. Giocatore cerca coach per nome / numero licenza FIGC
2. Giocatore invia richiesta → INSERT certification_requests (status: pending)
3. Supabase Webhook → POST /api/notify → Firebase FCM → notifica push al coach
4. Coach apre app → rivede i video del giocatore → approva o rifiuta
5. UPDATE certification_requests.status
   → trigger SQL → player_profiles.is_verified = true (se approvato)
6. /api/notify → FCM → notifica push al giocatore
```

---

## Decisioni Architetturali

- Firebase usato **solo per FCM** — nessun Firestore, nessun Auth Firebase
- Un giocatore ha **una sola richiesta attiva** (`player_id UNIQUE`) — per cambiare coach: DELETE + nuovo INSERT
- Scout vedono tutti i profili nel feed, badge visivo distingue verificati da non verificati
- Tipi TypeScript in `types.ts` sono **manuali** — sostituire con generazione automatica dopo aver collegato Supabase CLI: `npx supabase gen types typescript --project-id dfmmzbklpysyjkgnvzzy > src/lib/supabase/types.ts`

---

## File Tessera FIGC Coach (sessione 2026-04-29)

| File | Modifica |
|---|---|
| `supabase/migrations/20260429000001_coach_figc_verification.sql` | Aggiunge `figc_card_url TEXT` e `is_verified BOOLEAN DEFAULT false` a `coach_profiles`; policy INSERT/UPDATE per bucket `Avatar` |
| `src/lib/supabase/types.ts` | Aggiunge `figc_card_url` e `is_verified` ai tipi `coach_profiles` |
| `src/app/actions/onboarding.ts` | `completeCoachOnboarding` legge il file dalla FormData, lo carica su `Avatar` bucket server-side, salva l'URL |
| `src/app/(app)/onboarding/onboarding-client.tsx` | `CoachOnboarding`: campo upload immagine con anteprima client-side, validazione tipo/size |
| `src/app/(app)/profile/page.tsx` | Fetcha `coach_profiles.is_verified, figc_card_url`; mostra badge "Verificato FIGC" (teal) o "Verifica in corso" (amber) |

### Flusso verifica coach
1. Coach completa onboarding → carica foto tessera FIGC (opzionale) → `Avatar` bucket path: `{uid}/figc_card.{ext}`
2. Profilo coach creato con `is_verified = false`
3. Il profilo mostra badge **"Verifica in corso"** (amber) se `figc_card_url` presente ma non verificato
4. Admin imposta manualmente `is_verified = true` su Supabase Dashboard → badge diventa **"Verificato FIGC"** (teal)

### ⚠️ Action manuale richiesta
Eseguire la migration `20260429000001` su Supabase Dashboard → SQL Editor:
```sql
ALTER TABLE coach_profiles
  ADD COLUMN IF NOT EXISTS figc_card_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
```
E aggiungere le policy storage per `Avatar` (vedi file migration completo).

---

## ⚠️ Azioni Manuali Ancora da Fare

### 1. ✅ Migration SQL iniziale — eseguita
### 2. Bucket Storage — da creare (ancora pendente se non fatto)
Vai su Supabase Dashboard → Storage → New bucket (nomi **case-sensitive**):
- `Video` (privato)
- `Thumbnails` (pubblico)
- `Avatar` (pubblico)

### 3. ✅ Firebase — configurato (service account `leva-853e4`)
### 4. Configurare Supabase Webhook
- Vai su Supabase Dashboard → Database → Webhooks → Create webhook
- Tabella: `certification_requests`, eventi: `INSERT` + `UPDATE`
- URL: `https://tuo-dominio.com/api/notify`
- Header: `Authorization: Bearer 4e48f36720df63ce29c836bf943bc0046f24e344a4d3f89de1fffc446aa52e49`

### 5. Migration `20260423000001` — da eseguire su Supabase
Vai su Supabase Dashboard → SQL Editor e incolla:
```sql
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS team_name TEXT;
```

---

## Prossimi Passi (sviluppo)

1. **Completare setup** — eseguire le azioni manuali sopra (bucket, webhook, migration team_name)
2. ✅ **Autenticazione** — signup con selezione ruolo, login, middleware sessione, callback email
3. ✅ **Onboarding per ruolo** — form player (data nascita, posizione, squadra, provincia) e coach (licenza FIGC, tipo, squadra)
4. ✅ **Feed video verticale** — snap scroll, autoplay on-view, signed URL, preload vicini, gestione errore/buffering
5. ✅ **Upload video** — validazione tipo/size, preview, rimozione, progresso simulato, redirect feed
6. ✅ **Profilo giocatore** — avatar, nome, ruolo, badge FIGC, stat (video/views), griglia video, logout
7. ✅ **Flusso certificazione** — `/certify` (player: ricerca coach + richiesta) + `/coach` (coach: approva/rifiuta)
8. **Profilo scout + paywall** — pagina profilo scout, abbonamento, integrazione pagamento (Stripe)
9. ✅ **Homepage pubblica** — landing page per acquisizione utenti (sostituisce il template default)

## File Onboarding (creati — sessione 2026-04-23)

| File | Ruolo |
|---|---|
| `src/app/(app)/onboarding/page.tsx` | Server Component: gate — se profilo ruolo esiste → redirect dashboard |
| `src/app/(app)/onboarding/onboarding-client.tsx` | Client Component: form player (data nascita, posizione, squadra, provincia) e coach (licenza FIGC, tipo, squadra) |
| `src/app/actions/onboarding.ts` | Server Actions: `completePlayerOnboarding`, `completeCoachOnboarding` |
| `supabase/migrations/20260423000001_player_profile_team_name.sql` | Aggiunge `team_name TEXT` a `player_profiles` — **da eseguire su Supabase** |

### Flusso onboarding
- Dashboard controlla se `player_profiles` / `coach_profiles` esiste → se mancante, redirect a `/onboarding`
- `/onboarding` presenta il form appropriato per il ruolo; se già completato → redirect dashboard
- Al submit: INSERT nel profilo ruolo → redirect a `/dashboard`
- Scout: nessun form, passa direttamente alla dashboard

## File Homepage (creati — sessione 2026-04-29)

| File | Ruolo |
|---|---|
| `src/app/page.tsx` | Landing page pubblica — hero, 3 ruoli, come funziona, differenziatori, CTA |
| `src/lib/supabase/middleware.ts` | Aggiunto `pathname === "/"` a `isPublic` — la root non richiede auth |

### Design homepage
- Stack: dark `bg-slate-950`, accenti `teal-400`/`teal-500`, card `bg-slate-900`
- Sezioni: Nav fissa glassmorphism → Hero con glow + mock video card decorative → 3 ruoli → Come funziona (3 step) → Differenziatori (FIGC / 100% / 0€) → CTA finale → Footer
- Server Component statico (nessun client component)

## Fix applicati

- **Trigger `handle_new_user`**: aggiunto `SET search_path = ''` con `public.profiles` fully-qualified — richiesto da Supabase per trigger `SECURITY DEFINER` su `auth.users`.
- **Migration SQL**: policy che referenziano `certification_requests` spostate in sezione "differita" in fondo (create dopo la tabella).
- **Bucket Storage**: nomi ufficiali case-sensitive → `Video`, `Thumbnails`, `Avatar`. Policy in `20260422000001_storage_policies.sql` aggiornate.
- **Feed**: usa `createSignedUrls` (batch, TTL 1h) e `.in()` per ridurre da N+1 a 3 query totali.
- **FK `videos.player_id` / `certification_requests.player_id`**: spostate da `player_profiles(id)` a `profiles(id)` — `player_profiles` si crea in onboarding (non ancora obbligatorio), `profiles` invece esiste sempre dal signup. Migration: `20260422000002_fix_fk_player_id.sql`.
- **RLS feed**: aggiunta policy SELECT su `videos` per tutti gli utenti autenticati (non solo scout) + policy SELECT su `storage.objects` per bucket `Video` (necessaria a `createSignedUrls` con JWT utente). Migration: `20260422000003_fix_feed_rls.sql`.
- **Profilo griglia**: `<video>` con `preload=metadata` non renderizza alcun frame → box grigio che sembra vuoto. Fix: `src="#t=0.1"` + `onLoadedMetadata` che forza `currentTime=0.1` per mostrare il primo frame come thumbnail.
- **createSignedUrls → createSignedUrl**: nel profilo usiamo la versione singola in Promise.all per evitare mismatch path↔signedUrl del batch response.

## File Auth (creati)

| File | Ruolo |
|---|---|
| `src/middleware.ts` | Protegge le route, refresh sessione Supabase |
| `src/lib/supabase/middleware.ts` | Client Supabase per il middleware |
| `src/app/actions/auth.ts` | Server Actions: `login`, `signup`, `logout` |
| `src/app/auth/callback/route.ts` | Callback conferma email Supabase |
| `src/app/(auth)/login/page.tsx` | Pagina login |
| `src/app/(auth)/signup/page.tsx` | Signup multi-step: selezione ruolo → form |
| `src/app/dashboard/page.tsx` | Dashboard placeholder (mostra nome e ruolo) |

## File Feed Video (creati)

| File | Ruolo |
|---|---|
| `src/app/(app)/feed/page.tsx` | Pagina feed — carica lista video + componente client |
| `src/app/(app)/feed/feed-client.tsx` | Feed scroll verticale full-screen con snap + IntersectionObserver |
| `src/app/(app)/feed/video-card.tsx` | Singola card video: `<video>` con autoplay on-view, tap per play/pause |
| `src/app/(app)/upload/page.tsx` | Form upload video → Supabase Storage bucket `Video` |
| `src/app/actions/videos.ts` | Server Action `uploadVideo`: firma URL + INSERT record |

## File Profilo (creati)

| File | Ruolo |
|---|---|
| `src/app/(app)/profile/page.tsx` | Server Component: fetch profile + player_profile + videos, signed URL per la griglia |
| `src/app/(app)/profile/video-grid.tsx` | Griglia 3 colonne aspect 9/16 con preview video on-hover |
| `src/app/(app)/profile/logout-button.tsx` | Client Component per action `logout` |

## File Certificazione (creati)

| File | Ruolo |
|---|---|
| `src/app/actions/certification.ts` | Server Actions: `searchCoaches`, `requestCertification`, `cancelRequest`, `approveRequest`, `rejectRequest` |
| `src/app/(app)/certify/page.tsx` | Gate: solo player. Carica richiesta esistente + dati coach |
| `src/app/(app)/certify/certify-client.tsx` | Ricerca coach (debounced su cambio input), selezione, messaggio, invio. Stato richiesta esistente con opzioni annulla/rimuovi |
| `src/app/(app)/coach/page.tsx` | Gate: solo coach. Liste "Da valutare" (pending) + "Storico" |
| `src/app/(app)/coach/request-card.tsx` | Card per richiesta: approva inline, rifiuta con motivazione opzionale |

### RLS necessarie (migration `20260422000004_profiles_read_for_certification.sql`)
- `profiles` SELECT per tutti gli autenticati dove `role = 'coach'` (ricerca coach)
- `profiles` SELECT dove `role = 'player'` e il richiedente è il coach della relativa `certification_requests` (il coach vede il nome del player richiedente)

### Trigger attivo (già in initial_schema)
- `on_certification_updated` → quando `status` passa a `approved`, aggiorna `player_profiles.is_verified = true`, `verified_by = coach_id`, `verified_at = now()`
