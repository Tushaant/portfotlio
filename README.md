# Tushant.AI Product OS — Command Center Portfolio

Immersive **AI Product Manager** portfolio: Cyberpunk mission-control energy meets Linear/Stripe craft.

> Inspiration reference: [portfolio-web-tushant.lovable.app](https://portfolio-web-tushant.lovable.app)  
> Notion projects source: [Tushant Sharma — Notion](https://woolly-saga-8e5.notion.site/Tushant-Sharma-05d5b8ce678a4698ae6e7c89c726027e)  
> Resume source: uploaded `TUSHANT_SHARMA_1CAGAI_b7f6.pdf` → `public/resume/Tushant_Sharma_Resume.pdf` (PDF only — no fabricated resume content)

---

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Framer Motion · GSAP-ready · Lenis smooth scroll
- Three.js · React Three Fiber · Drei
- Zustand · Lucide · JSON CMS under `content/cms/`

## Features

- 3D neural/globe hero with mouse parallax
- AI Profile Dashboard, career stations, skill galaxy, holographic tech chips
- 13 Notion-sourced projects with attached delivery screenshots
- Interactive case studies, trophy room, communication console
- Resume chatbot (⌘J) — answers **only** from resume PDF + portfolio CMS
- Command palette (⌘K), preloader, custom cursor, sound/music/hologram/terminal toggles
- Lightweight JSON CMS console at `/admin`

## Quick start (self-host / preview)

```bash
npm install
npm run dev
# → http://localhost:3000
```

Production:

```bash
npm run build
npm start
# → http://localhost:3000
```

### Deploy on Vercel

1. Push this repo to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Framework: Next.js · Build: `npm run build` · Output: default
4. Deploy — no env vars required for the local knowledge agent

Optional: set `OPENAI_API_KEY` later if you extend `/api/chat` to call an LLM (current agent is deterministic RAG over CMS).

## CMS (no code edits)

| Content | File |
|--------|------|
| Resume / profile | `content/cms/resume.json` |
| Experience timeline | `content/cms/experience.json` |
| Projects | `content/cms/projects.json` |
| Case studies | `content/cms/case-studies.json` |
| Achievements | `content/cms/achievements.json` |
| Skills galaxy | `content/cms/skills.json` |
| Tech stack | `content/cms/tech-stack.json` |
| Site / nav | `content/cms/site.json` |

Images: `public/projects/*` · Resume PDF: `public/resume/Tushant_Sharma_Resume.pdf`  
Admin UI preview: `/admin`

## Keyboard

| Shortcut | Action |
|----------|--------|
| ⌘/Ctrl + K | Command palette / search |
| ⌘/Ctrl + J | Resume AI agent |
| Esc | Close overlays |

## Project structure

```
content/cms/          # JSON CMS
public/projects/      # Notion delivery screenshots
public/resume/        # Source PDF
src/app/              # Pages + API routes
src/components/       # UI, sections, three, agent
src/lib/cms.ts        # CMS loaders + knowledge base
src/lib/agent.ts      # Strict resume/portfolio agent
```

## Scripts

```bash
npm run dev      # local preview
npm run build    # production build
npm start        # serve production
npm run lint     # eslint
```

---

Built as an **AI Product Operating System**, not a scrolling resume.
