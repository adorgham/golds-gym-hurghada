# Gold's Gym Hurghada — Delivery Plan to GTM

**Status:** Sprint 3 synchronized and populated; Sprint 4 implementation in progress; staff schedule-mutation UAT and final production cutover remain pending

**Planning basis:** repository audit completed 2026-10-26

**Scope rule:** model only what must remain canonical; implement only confirmed launch flows.

## Delivery guardrails

- `REQUIRED NOW`: production marketing website, public content, enquiries, SEO/AIO, analytics, operations and release readiness.
- `DEPENDENCY NOW`: the smallest secure Base44 entities, permissions and backend functions required by those public flows.
- `FUTURE-READY ONLY`: member account expansion, online sales, entitlements, booking/waitlists, attendance, QR check-in, notifications and mobile application.
- Base44 remains the shared backend. Do not introduce parallel website-only records or a second backend.
- No entity synchronization, remote development session, production data write, publish, domain cutover or indexation change without a reviewed migration/release checkpoint.

## Sprint 1 — Technical foundation and release controls

### Scope

| Item | Classification | Status | Acceptance criteria |
| --- | --- | --- | --- |
| Canonicalize local Base44 schemas and identify migration risk | DEPENDENCY NOW | Implemented locally; remote review pending | One file per entity; invalid custom `User.role` override removed; remote diff reviewed before synchronization |
| Secure public lead and PT enquiry writes | REQUIRED NOW | Implemented locally | Browser cannot choose workflow status; backend validates and bounds input; public direct entity create is denied |
| Capture first-touch campaign attribution | REQUIRED NOW | Implemented locally | UTM fields, landing page and referrer reach Lead/Booking records without blocking submission |
| Keep public pages usable with an expired optional auth token | REQUIRED NOW | Implemented locally | A failed optional `auth.me()` does not redirect the public website; protected admin route remains protected |
| Normalize explicit public-read permissions | DEPENDENCY NOW | Implemented locally | Public content entities use explicit `read: true`; all writes remain admin-only |
| Establish a useful engineering baseline | REQUIRED NOW | Implemented locally | lint, typecheck, build and CI gates pass; Base44 build is separately verified before release |
| Confirm rendering/hosting path | REQUIRED NOW | Decision pending | staging crawl demonstrates acceptable discoverability or prerender/hosting work is promoted before launch |
| Define staging, release and recovery procedure | REQUIRED NOW | Documented here | release gates, rollback inputs and production no-go actions are explicit |

### Validation commands

```bash
npm run check
npm run lint
npm run typecheck
npm run build
npx base44 whoami
npx base44 build
base44 dev
```

`base44 dev` must use the local ephemeral backend. Do not use `base44 dev --remote` for acceptance testing because it writes to production data.

Local results on 2026-10-26: lint passed, typecheck passed, Vite build passed, and `npx base44 build` completed with the linked app ID. End-to-end function execution remains pending because Deno is not installed and no non-production Base44 environment has yet been confirmed.

### Migration and release notes

1. Export or inventory the remote entities before synchronization.
2. Review the remote-to-local schema diff, especially Lead, Booking and duplicate entity filenames.
3. Deploy the two submission functions and schema permission changes in the same reviewed release.
4. Smoke-test anonymous lead and PT enquiry submissions locally, then in a non-production/staging environment.
5. Confirm records are visible only to an administrator and that status is always created as `New`.
6. Confirm Base44's native function abuse limits or add an approved rate-limit control; honeypot/timing validation alone is not a production rate limit.
7. Keep the site-wide `noindex` controls enabled through staging. Remove them only in the production cutover sprint.

### Sprint 1 no-go actions

- Do not push/synchronize entities until the remote inventory and migration diff are reviewed.
- Do not use the hosted production backend for form testing.
- Do not enable search indexing or change the production domain.
- Do not expose anonymous functions in production until the rate-limit/abuse-control gate is confirmed.
- Do not implement payments, member entitlements, class booking, waitlists or QR check-in.
- Do not treat fallback/demo content as launch content.

## Sprint 2 — Public journeys and launch CMS

### Scope

| Item | Classification | Status |
| --- | --- | --- |
| Complete public Home, Memberships, Passes, Personal Training, Trainers, Facilities, About, Contact and legal/policy journeys | REQUIRED NOW | Implemented locally; approved content pending |
| Remove fabricated fallback records and unverified branch claims | REQUIRED NOW | Implemented locally |
| Provide honest loading, empty, unavailable and unpublished states | REQUIRED NOW | Implemented locally |
| Add admin CRUD/publication workflows for trainers, offers, articles and website/legal pages | REQUIRED NOW | Implemented locally; staging UAT pending |
| Preserve existing lead, PT enquiry, member and media operations | REQUIRED NOW | Preserved; staging UAT pending |
| Fix article section routing and admin workflow state updates | REQUIRED NOW | Implemented locally |
| Load approved launch content with stable slugs and data-integrity checks | DEPENDENCY NOW | Blocked on owner-approved source content and remote schema review |
| Rich member account and commercial fulfillment | FUTURE-READY ONLY | Deferred |

### Acceptance criteria

- Every public CTA has an approved destination and tested success/failure path.
- Admin users can manage all launch content without direct database editing.
- Anonymous users cannot read lead, booking, member or operational records.
- No fabricated trainer, price, schedule or article can appear when backend data is missing.
- Responsive and accessibility smoke tests pass on the agreed browser/device matrix.

### Validation commands

```bash
npm run check
npx base44 build
```

Local results on 2026-10-26: lint, typecheck, Vite production build and Base44 production build passed. Browser/device UAT remains pending because approved content and a confirmed non-production Base44 environment are not yet available.

### Migration and content notes

1. `SitePage` is a new public-read/admin-write entity used for About, Facilities, Privacy and Terms content.
2. `Article`, `Membership`, `Pass` and `Trainer` now have `is_published`; new admin-created records default to unpublished.
3. For migration compatibility, existing records without `is_published` remain visible. Inventory them before schema synchronization, explicitly approve each launch record, and set the field during content migration.
4. Public business contact details now come from the documented `VITE_PUBLIC_*` variables. Unconfigured values and their related controls stay hidden.
5. About and Facilities deliberately show a pending state until owner-approved facts and branch photography/content are published; stock photography is not presented as the Hurghada branch.
6. Do not synchronize the new entity or publication fields until the Sprint 1 remote inventory/diff gate is complete.

## Sprint 3 — Group class schedule

### Scope

| Item | Classification | Status |
| --- | --- | --- |
| Preserve `ClassSession` as the canonical recurring weekly rule | DEPENDENCY NOW | Synchronized to the shared Base44 backend |
| Resolve recurring rules, date-specific overrides and one-off sessions in `Africa/Cairo` | REQUIRED NOW | Implemented locally |
| Add independent Studio and Members/Access filters with URL state | REQUIRED NOW | Implemented locally |
| Provide responsive public week/day views with cancellations and amendments labelled | REQUIRED NOW | Populated desktop/mobile UAT passed |
| Add class catalogue and low-friction schedule administration | REQUIRED NOW | Implemented; staff mutation UAT pending |
| Support “this occurrence” and versioned “this and future” changes | REQUIRED NOW | Implemented locally |
| Preserve stable dated occurrence keys for future consumers | DEPENDENCY NOW | Implemented locally |
| Capacity consumption, booking, waitlists, attendance and notifications | FUTURE-READY ONLY | Deferred |

### Acceptance criteria

- Admin can publish and amend a recurring weekly schedule plus date-specific exceptions.
- Public day/week views resolve the same canonical records and work on mobile.
- Closed/cancelled/moved sessions do not require copied monthly schedules.
- Booking controls and live capacity claims are absent until those workflows are approved.

### Validation commands

```bash
npm run test:schedule
npm run check
npx base44 build
```

The schedule resolver validation covers Cairo-week boundaries, date-only cancellation, amended time/trainer/studio/access, one-off sessions, combined filters and invalid date handling.

### Migration notes

1. Export/inventory remote `FitnessClass`, `ClassSession` and `Trainer` records before schema synchronization.
2. `ClassSession` remains the recurring base record; do not copy it into a second website-only schedule table.
3. Map every existing session to a canonical `FitnessClass` and, where possible, a canonical `Trainer`. Leave unknown trainers unassigned; normalize `Diann` to `Diana` only when that source value exists.
4. Map legacy `room` values to `studio`: `aerobics`, `spinning`, `martial_arts` or `floor`. Do not infer access rules from room or category.
5. Populate `access_types` from approved source data. An empty/unset legacy value resolves to unrestricted `all`; overlapping values such as `kids` plus `prepaid` remain supported.
6. Existing records without `is_published` remain visible for migration compatibility. Explicitly review and set publication state during migration.
7. Add `ScheduleOverride` and `OneOffSession` only after reviewing the remote schema diff. Enforce one override per recurring-session/date pair; the admin reports duplicate keys for cleanup.
8. Verify at least two historical periods and recurrence boundaries before launch. No schedule source data was invented or seeded during implementation.
9. Do not publish or synchronize from the local tree until the Sprint 1 remote inventory/release gate is complete.

## Sprint 4 — SEO, analytics and quality hardening

**Status:** In progress. The owner confirmed `https://www.goldsgymhurgahda.co` as the future canonical production domain on 2026-10-27. Indexing remains disabled until the controlled Sprint 6 cutover.

### Multilingual Step 1 — technical foundation

**Status:** Implemented locally; production rendering gate remains pending until the custom-domain release candidate exists.

- Stable launch locales are `en`, `ar`, `de` and `ru`; English remains unprefixed and Arabic is RTL.
- Five stable page identities map deterministically to 20 candidate language-edition routes. The executable contract is validated by `npm run test:localization`.
- Language content is modeled as independent editions, not synchronized translations. No English fallback is allowed on an indexable localized URL.
- Base44's platform-managed crawler prerendering is the selected launch path. A framework migration or parallel renderer is deferred unless the production-domain crawler test fails.
- Localized routes, CMS schema changes and content imports are intentionally excluded from Step 1 and remain unpublished.
- Before enabling indexing, test normal browser output, crawler-rendered HTML, localized SEO tags, sitemap/robots ownership and unknown-route HTTP behavior on the confirmed custom domain.

### Multilingual Step 2 — CMS foundation

**Status:** Implemented locally; the read-only production inventory and schema diff gate passed on 2026-10-29. Synchronization awaits explicit approval because the full-sync operation will remove an empty legacy lowercase `member` schema duplicate.

- `SitePage` remains the single CMS entity and now supports one independent record per deterministic `page_key + locale` edition.
- Ordered edition blocks support editorial sections, FAQs, CTAs and references to canonical offers, trainers and schedules without copying authoritative commercial data.
- The admin separates launch language editions from legacy About, Facilities, Privacy and Terms pages so existing workflows remain available.
- EN, AR, DE and RU editions have independent draft, review, approved and published states, version increments and approval metadata.
- Duplicate page/locale editions are rejected by the admin. Import reconciliation uses the deterministic `edition_key`; the remote backend does not yet enforce a database uniqueness constraint.
- Draft/review editions are intended for administrators only. The local schema changes `SitePage` public read access to published records while retaining administrator access to all editions.
- Before schema synchronization, inventory/export any remote `SitePage` records and explicitly set `is_published` on approved legacy records. Records with an unset publication flag will no longer be anonymously readable after this RLS change.
- The production audit found zero `SitePage` records, so no legacy page records require publication-state migration. Fourteen local schemas match production exactly; `SitePage` is the only intended change. Production also contains empty `member` and `Member` schema keys, and standard synchronization is expected to remove the lowercase duplicate.
- Content import, localized public routes and production publication remain excluded from Step 2.

### Multilingual Step 3 — localized website runtime

**Status:** Implemented locally; populated UAT remains blocked on the Step 2 Base44 schema gate and approved published editions.

- Added route families for the five agreed page identities under `/ar`, `/de` and `/ru`; `/en/*` redirects to the existing unprefixed English route.
- Existing English pages and presentation remain unchanged.
- Localized routes load only their exact published `edition_key`; they never fall back to English content. Missing, unsupported or unpublished editions render the localized noindex not-found state.
- The application updates document `lang` and `dir`; Arabic editions render RTL, including editorial Markdown and CMS editing direction.
- Navigation, language switching, mobile actions, footer interface labels, enquiry forms and system states have EN/AR/DE/RU interface text.
- The language switcher preserves the corresponding page identity and exposes only English plus published CMS editions.
- Edition blocks render independent editorial copy, FAQs, CTAs and enquiry forms. Canonical offer, trainer and schedule blocks read the existing shared entities instead of copying commercial or operational records.
- Localized URLs remain excluded from generated sitemaps until approved editions exist. Reciprocal hreflang and language-aware sitemap generation remain Step 4 work.

### Scope

- `REQUIRED NOW`: metadata, canonicals, structured data, sitemap, robots rules, internal links, analytics event contract and campaign attribution verification.
- `REQUIRED NOW`: performance, accessibility, security and cross-browser remediation.
- `DEPENDENCY NOW`: validate Base44 SPA rendering with Google/search tooling; introduce prerendering only if evidence shows the current rendering path is insufficient.

### Implemented in the current Sprint 4 pass

- Centralized canonical URLs and structured-data URLs on the confirmed `.co` domain.
- Kept site-wide indexing controlled by `VITE_PUBLIC_ALLOW_INDEXING`; build output now generates matching robots rules, index HTML directives and a static sitemap.
- Prevented stale canonical and structured-data tags from leaking between SPA routes; auth, admin, missing-content and 404 routes remain `noindex`.
- Added schedule interaction events and corrected WhatsApp/PT events that previously overstated submissions or booking starts.
- Added reduced-motion support, accessible public-form labels and a valid web manifest.
- Dynamic trainer, pass and article sitemap entries remain a Sprint 5 content-freeze task because their approved production slugs are not yet frozen.

### Remaining Sprint 4 exit gates

- Confirm whether Base44 analytics is the GTM system of record or provide the approved GA4/GTM measurement ID and consent requirements.
- Confirm Base44's native anonymous-function abuse limits or approve an additional rate-limit control for the public lead functions.
- Run Google/Search Console or equivalent rendered-crawl validation once an accessible staging or production-domain deployment exists; Base44 hosting serves a client-rendered SPA, so source HTML alone does not prove rendered indexability.
- Complete representative keyboard, screen-reader and cross-browser UAT on the release candidate.

### Acceptance criteria

- All indexable URLs return correct canonical/meta/structured content and are present in the sitemap.
- Private/admin/auth pages remain excluded.
- Analytics records the approved funnel without collecting unnecessary sensitive data.
- Performance and accessibility budgets are agreed and met on representative mobile hardware.

## Sprint 5 — UAT and production readiness

### Scope and acceptance criteria

- Approved production content, prices, contact details, policies, domain and measurement IDs are loaded.
- Anonymous/public, administrator, enquiry and failure/retry journeys pass UAT.
- Backups/export, release owner, rollback procedure and incident contacts are confirmed.
- Base44 build/publish process is rehearsed from the Git-backed source of truth.
- No P0/P1 defects remain; accepted lower-priority defects are documented with owners.

## Sprint 6 — GTM kickoff and controlled launch

### Sequence

1. Freeze launch content and code.
2. Publish the reviewed Base44 release from the Git-backed workflow.
3. Complete domain/DNS and HTTPS checks.
4. Run production smoke tests without destructive data.
5. Remove `noindex` and blocking robots directives only after the canonical production domain is verified.
6. Submit sitemap and start the launch monitoring window.
7. Monitor enquiries, errors, analytics, indexing and page performance; use the documented rollback path if launch gates regress.

## Recovery baseline

- Git commit/tag identifies every release candidate and production release.
- Remote entity inventory/export is captured before schema-affecting publication.
- Rollback means republishing the last known-good Git state; data rollback is a separate, explicitly approved operation.
- Submission failures must retain WhatsApp/phone fallbacks and must not expose internal errors or personal data in logs.

## Decision points requiring owner approval

1. **Resolved 2026-10-27:** the future canonical production domain is `www.goldsgymhurgahda.co`; indexing remains disabled until domain cutover.
2. Confirm official phone, WhatsApp number, email, address, opening hours and map location; current values are placeholders.
3. Confirm whether launch includes enquiry-only memberships/passes or online payment and fulfillment. Recommendation: enquiry-only for GTM unless a payment provider, policies and operational owner are already confirmed.
4. Confirm whether PT is an enquiry/request or a real-time booking commitment. Recommendation: keep it as a request for launch.
5. Approve launch content, prices, trainer roster, schedule ownership and legal/policy copy.
6. Confirm Base44 staging/non-production environment availability and the staff administrator accounts permitted to run UAT.
