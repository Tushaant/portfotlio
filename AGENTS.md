# AGENTS.md

Guidance for cloud agents and developers working in this repository.

## Repository status

This repository (`portfotlio`) is currently a **greenfield stub**. It contains only `README.md` with a project title. There is no application source code, dependency manifests, tests, or service definitions yet.

## Cursor Cloud specific instructions

### Services

| Service | Required? | Notes |
|---------|-----------|-------|
| *(none)* | - | No runnable application or backend exists in the repo today. |

When application code is added, update this section with how to start each service (dev server, API, database, etc.).

### System tooling (VM)

The cloud VM provides these tools without extra setup:

- **Node.js** v22.x with **npm** 10.x
- **Python** 3.12
- **git** 2.x

No project-specific dependencies are installed until manifests such as `package.json` or `requirements.txt` are added to the repo.

### Lint / test / build / run

There are no project scripts yet. After scaffolding the portfolio app, document the standard commands here (for example `npm run dev`, `npm test`, `npm run lint`) and reference `package.json` scripts rather than duplicating them.

### Gotchas

- The repository name is `portfotlio` (likely intended as "portfolio"); confirm naming with the owner before publishing.
- The update script installs dependencies only when matching lockfiles/manifests exist, so empty-repo agent runs do not fail on missing `package.json`.
