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
- Tailwind CSS
- ESLint

## Struttura Progetto

```
leva-app/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── public/
├── CLAUDE.md
└── package.json
```

## Decisioni Prese

- Mobile-first: viewport con `userScalable=false` per feed verticale ottimizzato
- App Router (Next.js) per routing e layout annidati
- `src/` directory per separare codice sorgente dalla configurazione

## Prossimi Passi

- Definire autenticazione e ruoli (giocatore / allenatore / scout)
- Definire modello dati: profilo giocatore, video, certificazione allenatore
- Progettare il feed video verticale (componente core)
- Definire flusso di onboarding per ciascun tipo di utente
