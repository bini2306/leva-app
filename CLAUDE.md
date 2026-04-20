# Claude.md - Progetto Leva

App italiana di scouting per il calcio giovanile. Feed video verticale stile TikTok. La credibilità del sistema si basa sulla certificazione dei profili da parte degli allenatori con licenza FIGC — non dall'auto-dichiarazione del giocatore.

## Utenti

| Ruolo | Età / Requisito | Costo | Azione principale |
|---|---|---|---|
| **Giocatore** | 14-18 anni | Gratis | Carica video delle proprie giocate |
| **Allenatore FIGC** | Licenza FIGC | Gratis | Certifica ("firma") i profili dei propri giocatori |
| **Scout** | — | A pagamento | Cerca e contatta talenti verificati |

## Meccanica chiave

- Il giocatore carica video → l'allenatore FIGC firma il profilo → lo scout vede solo profili certificati
- La firma dell'allenatore è il differenziatore di credibilità rispetto ad altri servizi
- Modello freemium: gratuito per chi produce contenuto (giocatori + allenatori), monetizzazione lato scout

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (auth + database + storage video)
- Firebase Admin SDK (solo notifiche push FCM)

## Struttura Progetto

```
leva-app/
├── src/
│   ├── app/
│   │   ├── api/notify/route.ts   ← webhook Supabase + invio FCM
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts         ← client browser
│       │   ├── server.ts         ← client SSR (cookies)
│       │   └── types.ts          ← tipi DB manuali (sostituire con gen)
│       └── firebase/
│           └── admin.ts          ← Firebase Admin singleton + helper FCM
├── supabase/
│   └── migrations/
│       └── 20260420000001_initial_schema.sql
├── .env.local.example
├── CLAUDE.md
└── package.json
```

## Decisioni Prese

- Mobile-first: viewport con `userScalable=false` per feed verticale ottimizzato
- App Router (Next.js) per routing e layout annidati
- Supabase come backend primario: auth, DB, storage video (bucket privato)
- Firebase usato SOLO per FCM push — nessun Firestore, nessun Auth Firebase
- FCM tokens salvati in Supabase (tabella `fcm_tokens`)
- Notifiche triggerate da Supabase Webhook → `/api/notify` → Firebase Admin SDK
- Un giocatore ha al massimo UNA richiesta di certificazione attiva (`player_id UNIQUE`)
- Scout vedono TUTTI i profili nel feed, con badge visivo che distingue verificati da non verificati
- Trigger SQL automatico: approvazione coach → `player_profiles.is_verified = true`

## Schema DB (tabelle principali)

| Tabella | Descrizione |
|---|---|
| `profiles` | Profilo base per tutti gli utenti (role: player/coach/scout) |
| `player_profiles` | Dati giocatore + flag `is_verified` |
| `coach_profiles` | Dati coach + numero licenza FIGC |
| `scout_profiles` | Dati scout + stato abbonamento |
| `videos` | Video caricati dai giocatori (URL Supabase Storage) |
| `certification_requests` | Richieste di verifica giocatore→coach (status: pending/approved/rejected) |
| `fcm_tokens` | Token FCM per notifiche push |

## Variabili d'Ambiente Necessarie

Vedi `.env.local.example` — copiare in `.env.local` e compilare con i valori reali.

## Prossimi Passi

- Creare progetto su Supabase e configurare `.env.local`
- Eseguire migration SQL su Supabase
- Configurare Firebase project e ottenere credenziali Admin SDK
- Configurare Supabase Webhook puntando a `/api/notify`
- Implementare autenticazione (signup con selezione ruolo)
- Progettare il feed video verticale (componente core)
