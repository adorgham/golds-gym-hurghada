# Base44 Project

Use this repository to run and edit the app locally, then publish changes back through Base44.

Any change pushed to the repo will also be reflected in the Base44 Builder.

## Project Documentation

This repository contains the Gold’s Gym Hurghada website and shared backend work.

For project scope, delivery milestones, architecture, and feature requirements, use:

- `PROJECT.md` — project kickoff, launch scope, milestone sequence, and definition of done.
- `AGENTS.md` — repository/Codex working instructions and document-routing rules.
- `docs/` — governing architecture, SEO/AIO, and specialized feature specifications.

The current business priority is the **production launch of the marketing website**. Future member/app capabilities should remain compatible with the shared backend but must not delay launch unless they are genuine dependencies.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Use the repository-local Base44 CLI through `npx base44`.
5. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) — the local Base44 backend runs on it.

Run `base44 --help` (or see the [CLI reference](https://docs.base44.com/developers/references/cli/commands/introduction)) for the full command surface.

## Run Locally

Three commands, from the project root:

```bash
npx base44 login   # one-time per machine
npx base44 link    # one-time per clone
npx base44 dev     # local backend + frontend together
```

Open the frontend URL that `base44 dev` prints (typically `http://localhost:5173`).

### Public business details

Configure approved public contact details in the Base44/Vite build environment. Until set, the website intentionally hides the corresponding phone, email, address, hours and WhatsApp controls rather than showing placeholders.

```bash
VITE_PUBLIC_WHATSAPP_NUMBER=201234567890
VITE_PUBLIC_PHONE=+20 12 3456 7890
VITE_PUBLIC_EMAIL=hello@example.com
VITE_PUBLIC_ADDRESS=Approved public address
VITE_PUBLIC_OPENING_HOURS=Approved opening hours
VITE_PUBLIC_SITE_URL=https://www.goldsgymhurgahda.co
VITE_PUBLIC_ALLOW_INDEXING=false
```

Notes:

- **Every fresh clone needs `base44 link`.** It writes `base44/.app.jsonc` (the app-id pointer), which is deliberately gitignored. Your app id is in the Builder URL (`app.base44.com/apps/<id>/...`); `base44 link --help` shows the non-interactive flags.
- `VITE_PUBLIC_ALLOW_INDEXING` must remain `false` or unset in development and staging. Set it to `true` only during the approved production-domain cutover; the build then emits indexable HTML, production robots rules and `sitemap.xml` for stable public routes.
- Dynamic trainer, pass and article URLs must be added to the launch sitemap after the approved production content/slugs are frozen in Sprint 5.
- **`base44 dev` runs the frontend for you** (via `site.serveCommand` in this repo's `base44/config.jsonc`) — never run `npm run dev` yourself: alone it serves a UI with no backend behind it (`[base44] Proxy not enabled`, every `/api` call fails), and alongside `base44 dev` the second Vite silently takes the next port and you end up looking at the wrong one.
- **The app must be published at least once for the UI to load under `base44 dev`.** The frontend boots by fetching app settings from the hosted app; before the first publish that fails and every page redirects to login. The local API works regardless.
- Entities, functions, and auth run locally — entity data is **in-memory only**, wiped when `base44 dev` restarts. Everything else (Core integrations, OAuth login) is forwarded to your deployed app. Full breakdown: [Local development overview](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview).

## Frontend Only, Hosted Backend

To work on just the frontend against your app's live hosted backend:

```bash
npx base44 dev --remote
```

⚠️ In this mode writes go to your app's **production data** — plain `base44 dev` keeps everything local.

## Publish Your Changes

After pushing your changes to git, open the Base44 dashboard and publish the app:

```bash
npx base44 dashboard open
```

This repo syncs to Base44 through git, so publish from the dashboard rather than `base44 deploy` — a CLI deploy ships your local tree directly, bypassing the sync, and the deployed state silently diverges from the repo.

## Docs & Support

GitHub integration: [https://docs.base44.com/developers/app-code/local-development/github](https://docs.base44.com/developers/app-code/local-development/github)

Local development: [https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview)

Support: [https://app.base44.com/support](https://app.base44.com/support)
