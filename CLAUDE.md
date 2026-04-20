# Claude.md - Progetto Leva

App di scouting per il calcio giovanile italiano. Feed video verticale, tre utenti: giocatori, allenatori FIGC, scout.

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

