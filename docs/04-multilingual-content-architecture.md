# Multilingual Content Architecture

**Status:** Step 1 technical foundation approved for implementation
**Languages:** English, Arabic, German and Russian
**Default language:** English

## 1. Delivery rule

Each public page is a group of independent language editions, not a source page with literal translations.

An edition may have different headings, sections, order, FAQs, calls to action, images, metadata and internal links. Editions share only a stable page identity and verified canonical business records.

There is no automatic English fallback on an indexable localized URL. A missing or unpublished edition must remain out of the sitemap and return a not-found/noindex experience.

## 2. Stable page identities and URL contract

| Page identity | English | Arabic | German | Russian |
| --- | --- | --- | --- | --- |
| `home` | `/` | `/ar` | `/de` | `/ru` |
| `memberships` | `/memberships` | `/ar/memberships` | `/de/memberships` | `/ru/memberships` |
| `passes` | `/passes` | `/ar/passes` | `/de/passes` | `/ru/passes` |
| `personal_training` | `/personal-training` | `/ar/personal-training` | `/de/personal-training` | `/ru/personal-training` |
| `class_schedule` | `/classes/schedule` | `/ar/classes/schedule` | `/de/classes/schedule` | `/ru/classes/schedule` |

English preserves the existing unprefixed routes. Localized slugs are deliberately deferred; the initial release uses the same stable path segments under language prefixes.

The executable contract lives in `src/lib/localization.js`. Localized routes are not activated by this foundation step.

## 3. Rendering decision

The current application is a Vite/React browser-rendered SPA deployed through Base44. Base44 documents platform-managed crawler prerendering for public apps on confirmed custom domains and refreshes rendered copies after publication and public-data changes.

Therefore:

- keep the current React/Base44 architecture;
- do not introduce a parallel renderer or migrate frameworks before evidence requires it;
- keep indexing disabled until the production custom domain and crawler rendering are verified;
- treat browser HTML, crawler HTML and HTTP status behavior as separate production acceptance checks.

The repository's static build contains a browser application shell. It is not evidence that the Base44 crawler response is correct.

On 2026-10-29, the local production-build preview returned HTTP 200 for `/`, an unknown route and the not-yet-published `/ar/memberships` route. This is normal SPA fallback behavior, but it proves that the React not-found screen alone does not establish an HTTP 404. Production Base44 behavior must be tested separately on the custom domain.

## 4. Required production rendering gate

Before indexing is enabled, verify every published language edition on the production custom domain:

1. A normal browser receives and hydrates the correct edition.
2. Googlebot and another representative crawler receive rendered headings and body content, not only the application shell or a loading state.
3. The rendered response contains the approved localized title, description, canonical, reciprocal hreflang and visible structured data.
4. A nonexistent route and an unpublished language edition show the noindex not-found experience.
5. Confirm the HTTP status returned for nonexistent routes. If Base44 cannot return an appropriate status, record the platform constraint and decide whether an edge/hosting change is required before indexation.
6. Base44's generated crawler assets and the repository-generated robots/sitemap assets must not conflict. The production response is authoritative.

## 5. CMS boundary for the next step

`SitePage` represents one language edition per `page_key + locale`. Step 2 adds ordered content blocks, edition workflow, approval metadata, versioning and deterministic import keys locally. The schema must not be synchronized until the remote `SitePage` inventory and diff are reviewed.

The CMS provides these block types:

- editorial section;
- FAQ item;
- call to action;
- canonical membership/pass offers;
- canonical trainer profiles;
- canonical class schedule.

The final three are presentation references. Their authoritative business values remain in their existing entities.

Existing About, Facilities, Privacy and Terms records remain legacy `SitePage` records without a launch `page_key` and continue through the existing page editor. Before the new public-read rule is synchronized, every approved legacy record must receive an explicit publication state.

Canonical entities remain the only source for prices, membership/pass validity, trainers, class rules, schedule occurrences, contact facts and future entitlements. Language editions may reference and present these facts but must not duplicate their authoritative values in editorial copy.

## 6. Localized website runtime

The public runtime supports the five agreed route families for Arabic, German and Russian. English continues to use the existing unprefixed pages.

- A localized route fetches only its exact published `edition_key`.
- Missing, draft, unsupported and unpublished editions do not use English content as a fallback.
- The document language and direction follow the URL locale; Arabic uses RTL.
- The language switcher preserves page identity and only offers published editions.
- Interface chrome and forms use a small reviewed UI dictionary. Editorial content remains entirely CMS-controlled.
- Canonical offer, trainer and schedule blocks query the existing shared entities at render time.
- Localized routes are not added to the sitemap until their editions are approved and published.

## 7. Step 1 acceptance criteria

- EN, AR, DE and RU are the only supported launch locales.
- Arabic is identified as RTL.
- The five launch page identities and 20 candidate paths are deterministic and tested.
- Existing English URLs remain unchanged.
- Localized routes are not published prematurely.
- Base44 crawler prerendering is the selected launch path, subject to the production rendering gate above.
- A custom SSR/prerender rewrite is deferred unless production evidence fails the gate.
