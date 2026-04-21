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
│   │   ├── api/
│   │   │   └── notify/
│   │   │       └── route.ts      ← webhook Supabase → FCM push
│   │   ├── layout.tsx            ← viewport mobile-first, font Geist
│   │   ├── page.tsx              ← homepage (ancora template default)
│   │   └── globals.css
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts         ← createBrowserClient (componenti client)
│       │   ├── server.ts         ← createServerClient SSR (Server Components, API routes)
│       │   └── types.ts          ← tipi TypeScript manuali del DB
│       └── firebase/
│           └── admin.ts          ← Firebase Admin singleton + sendPushNotification / sendPushToMultiple
├── supabase/
│   └── migrations/
│       └── 20260420000001_initial_schema.sql   ← DA ESEGUIRE SU SUPABASE (vedi sotto)
├── .env.local                    ← NON in git — credenziali reali
├── .env.local.example            ← template variabili d'ambiente
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
| `videos` | Video caricati dai giocatori — `video_url` punta a Supabase Storage (bucket privato `videos`) |
| `certification_requests` | Richieste verifica giocatore→coach — `player_id UNIQUE` (una sola richiesta attiva per giocatore) |
| `fcm_tokens` | Token FCM per notifiche push — uno per device per utente |

### Trigger SQL attivi

- **`on_auth_user_created`** → crea riga in `profiles` automaticamente al signup
- **`on_certification_updated`** → quando coach approva: setta `player_profiles.is_verified = true`, `verified_by`, `verified_at`

### Storage bucket da creare (via dashboard Supabase)

| Bucket | Accesso |
|---|---|
| `videos` | Privato |
| `thumbnails` | Pubblico |
| `avatars` | Pubblico |

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

## ⚠️ Azioni Manuali Ancora da Fare

### 1. ✅ Migration SQL — eseguita
### 2. ✅ Bucket Storage — da creare (ancora pendente se non fatto)
Vai su Supabase Dashboard → Storage → New bucket:
- `videos` (privato)
- `thumbnails` (pubblico)
- `avatars` (pubblico)

### 3. ✅ Firebase — configurato (service account `leva-853e4`)
### 4. Configurare Supabase Webhook
- Vai su Supabase Dashboard → Database → Webhooks → Create webhook
- Tabella: `certification_requests`, eventi: `INSERT` + `UPDATE`
- URL: `https://tuo-dominio.com/api/notify`
- Header: `Authorization: Bearer 4e48f36720df63ce29c836bf943bc0046f24e344a4d3f89de1fffc446aa52e49`

---

## Prossimi Passi (sviluppo)

1. **Completare setup** — eseguire le 4 azioni manuali sopra
2. ✅ **Autenticazione** — signup con selezione ruolo, login, middleware sessione, callback email
3. **Onboarding per ruolo** — form di completamento profilo diverso per ogni ruolo
4. **Feed video verticale** — componente core dell'app, stile TikTok, scroll snap
5. **Upload video** — form caricamento video su Supabase Storage + creazione record `videos`
6. **Flusso certificazione UI** — ricerca coach, invio richiesta, schermata approvazione coach
7. **Profilo scout + paywall** — abbonamento scout, integrazione pagamento (Stripe da valutare)

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
