# AGENTS.md

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.

## Gold’s Gym Hurghada Project Guidance

The current priority is the **production launch of the marketing website**.

Use `PROJECT.md` when working on project scope, milestone sequencing, deliverables, or cross-cutting implementation decisions.

Classify scope as:

- `REQUIRED NOW`
- `DEPENDENCY NOW`
- `FUTURE-READY ONLY`

Do not build future-only functionality unless it is a genuine dependency or has been explicitly promoted into active scope.

### Governing docs — read contextually

- `docs/01-website-member-app-shared-backend-architecture.md`
  - Use for product boundaries and website/member/backend responsibilities.

- `docs/02-backend-architecture-domain-model.md`
  - Use for schema, canonical entities, permissions, transactions, historical integrity, and shared backend changes.

- `docs/03-seo-aio-strategy.md`
  - Use for public routes, SEO/AIO, indexation, schema, content architecture, internal linking, and search-facing rendering.

### Specialized docs — read only when relevant

- `docs/10-group-class-schedule-upgrade.md`
  - Classes, studios, recurrence, overrides, schedule admin, public schedule UX.

- `docs/11-secure-check-in.md`
  - QR/member access, authorized devices, access validation, check-in and attendance.
  - Future-ready unless explicitly promoted into active scope.

- `docs/12-membership-pass-sales.md`
  - Memberships, passes, products, pricing, checkout, orders, payments, fulfillment and entitlements.

### Project execution rules

- Inspect the existing implementation before structural edits.
- Reuse existing Base44 patterns where they fit the governing architecture.
- Preserve production data and historical truth.
- Do not create separate website/app member, commerce, schedule, or entitlement models.
- Prefer small, reviewable, reversible changes.
- If implementation conflicts with a governing document, identify the conflict before creating a workaround.
- Run the relevant checks from `package.json` before finishing code changes.
- Codex may create `PLAN.md` and `STATUS.md` after the initial audit; these are execution documents, not replacements for `PROJECT.md` or `docs/`.

