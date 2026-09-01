# AGENTS.md

Guidance for cloud agents and developers working in this repository.

## Repository status

This repository (`portfotlio`) is Tushant Sharma's Next.js portfolio (AI Product Command Center). Live: https://portfotlio-zeta.vercel.app

## Cursor Cloud specific instructions

### Services

| Service | Required? | Notes |
|---------|-----------|-------|
| Next.js app | For UI work | `npm run dev` on port 3000. Chat and Voice share `POST /api/chat`. |

### System tooling (VM)

- **Node.js** v22.x with **npm** 10.x
- **Python** 3.12
- **git** 2.x

### Lint / test / build / run

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

Voice Agent uses browser `SpeechRecognition` / `speechSynthesis` (no paid STT/TTS). Microphone and TTS need a real browser with permission.

Private intelligence dashboard: `/admin` (password `ADMIN_PASSWORD`, local default `tushant-local`). CMS console moved to `/admin/cms`.

### Gotchas

- The repository name is `portfotlio` (likely intended as "portfolio").
- Do not put LLM keys in `NEXT_PUBLIC_*` variables.
- Chat and Voice must keep using `src/lib/agent.ts` as the shared portfolio brain.
- Do not store microphone recordings.
