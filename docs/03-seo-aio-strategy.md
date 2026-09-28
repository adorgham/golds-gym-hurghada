# Gold's Gym Hurghada — SEO and AIO Strategy

**Status:** Master source of truth  
**Version:** 1.2  
**Date:** 2026-09-25  
**Project:** Gold's Gym Hurghada web app and digital marketing ecosystem  
**Scope:** Public marketing website SEO/AIO, public website–authenticated member experience boundary, URL governance, indexation, structured data, local entity signals, content architecture, content production, internal linking, evidence, publishing QA and measurement.

---

## 1. Purpose and governance

This document is the governing SEO and AIO framework for Gold's Gym Hurghada. It adapts the working methodology used in the `raisutis-seo-aio-360-master-v3.13.xlsx` reference into a fitness, membership, booking, local-search and tourism context.

From this point forward:

1. **This file is the strategic source of truth** for SEO and AIO decisions.
2. Any new indexable page must have a defined purpose, search intent, entity role and internal-link role before it is published.
3. Existing indexed slugs are locked by default. Refresh in place unless a documented migration decision is made.
4. Route, canonical, hreflang, sitemap, schema or indexation changes must be reflected in this strategy.
5. Content is not created because a keyword exists. It is created when there is a distinct user need, a distinct search intent, a credible Gold's Gym Hurghada answer and a useful business role.
6. Public-facing copy must read as finished customer content. Internal research notes, prompts, evidence-process wording and implementation instructions must never leak into public pages.
7. SEO, AIO and conversion are designed together. Pages should help people understand the offer, make a decision and complete an action.

### Priority convention

- **P0 — Critical:** indexation, crawlability, transactional integrity, local entity accuracy, brand/trust risks.
- **P1 — High impact:** commercial growth, major content clusters, high-value technical improvements, conversion support.
- **P2 — Expansion:** useful long-tail content, secondary features, backlog opportunities.

---

## 2. Strategic objective

Gold's Gym Hurghada should become the clearest digital entity for:

- Gold's Gym in Hurghada.
- Gym memberships in Hurghada.
- Day and short-stay gym access in Hurghada.
- Personal training in Hurghada.
- Gold's Gym Hurghada trainers.
- Group fitness classes and schedules in Hurghada.
- The branch's actual facilities, equipment, opening information and visitor rules.
- Practical, first-party fitness knowledge produced or reviewed by credible trainers.

The site must serve both **local members** and **visitors/tourists** without fragmenting the domain into thin keyword pages.

The SEO/AIO model is:

**Local entity authority + commercial landing pages + first-party fitness expertise + structured factual information + strong internal relationships + clean technical execution.**

---

## 3. Core operating principles

### 3.1 One primary intent per indexable URL

Each indexable page receives:

- one primary search intent;
- one primary keyword theme;
- closely related supporting variations;
- one defined funnel role;
- one main conversion action.

A page may rank for many queries, but it should not try to own several unrelated intents.

### 3.2 Content clusters, not isolated articles

Commercial pages are cluster hubs. Supporting educational pages answer narrower questions and connect users back to relevant services.

Examples:

```text
/personal-training
    ↕
/trainers/:trainer-name
    ↕
/fitness/guides/how-to-choose-a-personal-trainer
    ↕
/fitness/tips/how-often-should-you-train-with-a-personal-trainer
```

```text
/passes
    ↕
/passes/day-pass
    ↕
/facilities
    ↕
/contact
```

### 3.3 Cannibalisation rule

If a secondary keyword represents a genuinely different user question that deserves a standalone answer, move it into the content backlog instead of forcing it into an existing page.

Do not create separate pages merely for close keyword variants such as:

```text
/gym-hurghada
/hurghada-gym
/best-gym-hurghada
/gym-in-hurghada
```

The homepage should consolidate the principal brand + location + gym intent.

### 3.4 Indexed URL preservation

Once a URL earns search visibility, links or citations:

- preserve the slug by default;
- refresh content in place;
- use a true server-side 301 only when a migration is justified;
- never create chains such as A → B → C;
- update internal links, sitemap, canonicals and hreflang after a migration.

### 3.5 Evidence and freshness

Operational facts and fitness claims have different evidence requirements.

**Operational facts** — pricing, pass validity, opening hours, trainer availability, class schedules, facilities, booking rules — must come from the branch's current internal truth.

**Fitness/health claims** — training effects, exercise guidance, recovery, nutrition or safety claims — require credible external evidence when material.

Time-sensitive content must carry an internal **last verified** date.

### 3.6 AIO principle

Make important information easy for humans and machines to extract:

- descriptive headings;
- concise definitions and direct answers;
- factual tables where useful;
- visible authorship;
- trainer/entity relationships;
- clear prices, validity and eligibility rules;
- structured HTML text, not information trapped inside graphics;
- original photos and captions when they add context;
- meaningful breadcrumbs and internal links.

### 3.7 No generic AI-content footprint

Do not publish pages that feel mass-generated through repetitive intros, identical section wording or generic advice.

Especially avoid repeating the same opening formula across:

- pass pages;
- trainer profiles;
- class pages;
- workout pages;
- fitness guides.

Every public page should begin from the page's actual user situation.

### 3.8 Public website vs authenticated member/operations experience

Gold's Gym Hurghada should use **two frontends with one shared backend/data model**:

- **Public marketing website** — discovery, SEO/AIO, commercial landing pages, public schedules, content, campaigns, lead generation and public purchase/checkout entry points.
- **Authenticated member & operations experience** — member web access now and future mobile-app access, using the same identity and backend for digital membership ID, bookings, membership status, check-in, staff workflows, CRM/lead handling and administration.

This separation is an SEO/AIO advantage, not only a product decision. The public website remains fast, crawlable, content-rich and intentionally structured for discovery, while private member/admin complexity stays outside the public search architecture.

Rules:

1. The public website is the canonical search/discovery surface.
2. The private app must not compete with public commercial/content pages for indexation.
3. Authenticated member, staff and admin routes are excluded from public XML sitemaps and set to `noindex` where they can be reached without authentication.
4. Private data must be protected by authentication/authorization; `robots.txt` is never a security control.
5. Both frontends may read/write the same approved backend entities through role-scoped APIs/functions.
6. Public forms should create leads directly in the shared backend; do not maintain a second lead database or periodic sync if the same backend is available.
7. Public join/buy/book actions may hand off into the app when authentication or member-specific functionality is required, while preserving source/UTM attribution.
8. Search-facing content should not be duplicated on the app subdomain unless there is a product reason; where unavoidable, keep the app version non-indexable.

---

## 4. Entity model

The site should consistently reinforce a small set of real-world entities.

### Primary entity

**Gold's Gym Hurghada**

Entity type: physical health club / gym / local business.

Core facts to keep consistent:

- official branch name;
- relationship to the Gold's Gym franchise/master brand;
- exact address;
- map coordinates;
- phone;
- WhatsApp, if official;
- email;
- opening hours;
- logo;
- website;
- social profiles;
- facilities;
- services;
- accepted membership/pass types.

### Supporting entities

#### Gold's Gym master brand

Use approved franchise branding and correctly describe the Hurghada branch relationship. Do not invent corporate claims, awards or superlatives.

#### Hurghada branch location

A single physical-location entity should be reinforced across the website, Google Business Profile, maps, citations, social profiles and official Gold's Gym channels.

#### Trainers

Each public trainer page should represent a real `Person` entity with:

- full name;
- authentic portrait;
- role;
- specialties;
- verified certifications/qualifications;
- languages;
- experience;
- training approach;
- available session types;
- branch relationship;
- relevant authored/reviewed fitness content.

#### Classes

Class pages represent stable training offerings such as cycling, functional training, yoga or other actual branch programs. The live schedule is operational data; the class page is the stable informational entity.

#### Memberships and passes

These are commercial service/offer entities with:

- current price;
- duration/validity;
- inclusions;
- eligibility;
- purchase/booking action;
- terms;
- cancellation/refund rules;
- branch/location applicability.

---

## 5. Audience and search-demand model

The site should address several audience groups without creating duplicate location pages.

### Local residents

Main needs:

- monthly memberships;
- facilities;
- group classes;
- personal training;
- trainer selection;
- opening hours;
- location and contact;
- membership value.

### Expats and long-stay residents

Main needs:

- English-accessible information;
- monthly plans;
- trainer languages;
- facilities;
- personal training;
- clear payment and cancellation terms.

### Tourists and short-stay visitors

Main needs:

- gym day pass Hurghada;
- weekly/short-stay gym access;
- price;
- how to buy;
- what is included;
- whether tourists can use the gym;
- proximity/location;
- opening hours;
- what to bring;
- ID/access requirements.

### Fitness-content audience

Main needs:

- practical workouts;
- technique and programming guidance;
- beginner education;
- trainer-backed fitness tips;
- branch-relevant training advice.

Content may attract users who are not yet ready to join. Internal linking should move qualified visitors toward relevant commercial pages without forcing sales language into every article.

---

## 6. Website and app search architecture

### 6.1 Public marketing website

Recommended canonical public host:

```text
https://www.goldsgymhurgahda.co
```

Use one canonical host consistently. If the apex domain is preferred instead of `www`, redirect the other host to it.

The public website owns all search-facing, marketing and commercial content:

```text
www.goldsgymhurgahda.co
/
├── /memberships
│
├── /passes
│   ├── /passes/day-pass
│   ├── /passes/3-day-pass
│   ├── /passes/5-day-pass
│   └── /passes/7-day-pass
│
├── /personal-training
│
├── /trainers
│   └── /trainers/:trainer-name
│
├── /classes
│   ├── /classes/schedule
│   └── /classes/:class-slug
│
├── /facilities
├── /about
├── /contact
│
├── /fitness
│   ├── /fitness/workouts
│   │   └── /fitness/workouts/:slug
│   ├── /fitness/guides
│   │   └── /fitness/guides/:slug
│   └── /fitness/tips
│       └── /fitness/tips/:slug
│
├── /blog                         # optional; branch news/updates only
│   └── /blog/:slug
│
├── /privacy-policy
├── /terms-and-conditions
├── /refund-cancellation-policy
├── /cookie-policy
└── /club-rules
```

### 6.2 Authenticated member and operations web app

Recommended host:

```text
https://app.goldsgymhurgahda.co
```

This web app is the authenticated member/operations product surface rather than an SEO content surface. It can later serve or be complemented by a mobile application using the same backend, identity, memberships, passes and entitlements. Suggested logical structure:

```text
app.goldsgymhurgahda.co
/
├── /login
│
├── /member
│   ├── /member/dashboard
│   ├── /member/membership
│   ├── /member/digital-card
│   ├── /member/bookings
│   ├── /member/classes
│   ├── /member/personal-training
│   └── /member/profile
│
├── /staff
│   ├── /staff/check-in
│   ├── /staff/members
│   ├── /staff/leads
│   ├── /staff/classes
│   ├── /staff/trainers
│   └── /staff/reporting
│
└── /admin
    ├── users-and-roles
    ├── authorized-devices
    ├── memberships-and-passes
    ├── content-and-media
    └── system-settings
```

These routes are illustrative logical modules; implementation may use role-aware navigation rather than exposing every path exactly as written.

### 6.3 Search boundary

- `www.goldsgymhurgahda.co` = indexable public discovery surface.
- `app.goldsgymhurgahda.co` = authenticated/private product surface.
- The app subdomain is excluded from the public website sitemap.
- Member, staff and admin routes must not be indexed.
- Public content should live on the website, not be duplicated into the app for SEO.
- The website may deep-link into the app for login, booking, membership management or other authenticated actions.

### Blog rule

`/blog` is optional.

If used, it must have a separate editorial role from `/fitness`.

Use `/blog` for:

- branch announcements;
- local events;
- competitions;
- community stories;
- new equipment;
- trainer appointments;
- seasonal opening information;
- Gold's Gym Hurghada news.

Do **not** publish generic workouts, evergreen fitness education or standard training tips into `/blog`. Those belong under `/fitness`.

If there is no genuine local-news publishing need, omit `/blog` entirely.

## 7. Indexable page map and intent ownership

| Route | Page role | Primary intent | Funnel | Index? | Primary schema direction |
|---|---|---|---|---|---|
| `/` | Home / local entity hub | Gold's Gym Hurghada / gym in Hurghada | Commercial | Yes | `HealthClub` + `Organization` |
| `/memberships` | Membership hub | gym membership Hurghada | Commercial | Yes | `Service` / `Offer` |
| `/passes` | Visitor-access hub | gym passes Hurghada | Commercial | Yes | `Service` / `Offer` |
| `/passes/day-pass` | Pass detail | gym day pass Hurghada | Transactional | Conditional* | `Service` / `Offer` |
| `/passes/3-day-pass` | Pass detail | 3-day gym pass Hurghada | Transactional | Conditional* | `Service` / `Offer` |
| `/passes/5-day-pass` | Pass detail | 5-day gym pass Hurghada | Transactional | Conditional* | `Service` / `Offer` |
| `/passes/7-day-pass` | Pass detail | weekly / 7-day gym pass Hurghada | Transactional | Conditional* | `Service` / `Offer` |
| `/personal-training` | Service page | personal training Hurghada | Commercial | Yes | `Service` |
| `/trainers` | People hub | Gold's Gym Hurghada trainers | Commercial / trust | Yes | `CollectionPage` |
| `/trainers/:name` | Trainer profile | individual trainer / specialty | Trust / commercial | Yes when complete | `ProfilePage` + `Person` |
| `/classes` | Class hub | group fitness classes Hurghada | Commercial | Yes | `CollectionPage` / `ItemList` |
| `/classes/schedule` | Operational schedule | Gold's Gym Hurghada class schedule | Navigational | Yes if crawlable/stable | `WebPage` |
| `/classes/:slug` | Stable class detail | specific fitness class in Hurghada | Commercial / informational | Yes when substantive | `Service` |
| `/facilities` | Facility evidence | Gold's Gym Hurghada facilities/equipment | Commercial / trust | Yes | `WebPage` |
| `/about` | Brand / branch story | Gold's Gym Hurghada information | Trust | Yes | `AboutPage` / `Organization` |
| `/contact` | Local conversion | Gold's Gym Hurghada contact/location | Navigational | Yes | `ContactPage` + local entity |
| `/fitness` | Knowledge hub | fitness training resources | Informational | Yes | `CollectionPage` |
| `/fitness/workouts` | Workout hub | workout plans | Informational | Yes | `CollectionPage` |
| `/fitness/workouts/:slug` | Workout | specific workout intent | Informational | Yes when original | `Article` |
| `/fitness/guides` | Guide hub | fitness guides | Informational | Yes | `CollectionPage` |
| `/fitness/guides/:slug` | Evergreen guide | specific education intent | Informational | Yes | `Article` |
| `/fitness/tips` | Tips hub | practical fitness tips | Informational | Yes | `CollectionPage` |
| `/fitness/tips/:slug` | Tip | narrow fitness question | Informational | Yes | `Article` |
| `/blog` | Local updates hub | Gold's Gym Hurghada news | Branded / informational | Only if maintained | `CollectionPage` |
| `/privacy-policy` | Legal | privacy | Trust | Yes | `WebPage` |
| `/terms-and-conditions` | Legal/contract | transaction/site terms | Trust | Yes | `WebPage` |
| `/refund-cancellation-policy` | Policy | cancellations/refunds | Trust / support | Yes | `WebPage` |
| `/cookie-policy` | Legal | cookie disclosure | Trust | Yes | `WebPage` |
| `/club-rules` | Operational policy | Gold's Gym Hurghada rules | Trust / support | Yes | `WebPage` |

\* **Pass-page indexability rule:** a pass-detail URL should be indexed only when it has a meaningful standalone offer, distinct user demand and sufficiently unique content. If the only difference is a number of days and price, keep `/passes` as the main indexable page and consider noindexing thin transactional variants.

**Private authenticated-surface rule:** `app.goldsgymhurgahda.co`, including member, staff and admin web routes, is outside the public indexable page map. Future mobile-app interfaces use the same backend but are likewise not public search surfaces. These routes should not appear in the public XML sitemap or compete with the marketing website for search visibility.

---

## 8. URL rules

### Public URL standard

- lowercase;
- hyphen-separated words;
- short and descriptive;
- no unnecessary IDs;
- no session tokens;
- no mixed case;
- no dates unless the date is essential to the content identity;
- no keyword stuffing;
- no duplicate route aliases.

Preferred:

```text
/passes/day-pass
/personal-training
/fitness/workouts/beginner-chest-workout
```

Avoid:

```text
/pass?id=42
/Best-Gym-Hurghada-Egypt
/blog/2026/09/25/post-123
```

### Query parameters

Parameters used for:

- filters;
- sorting;
- tracking;
- calendar states;
- campaign attribution;

must not create uncontrolled indexable URL inventories.

Canonicalize to the clean page where appropriate and prevent infinite schedule/calendar crawl spaces.

### Trailing slashes

Choose one convention and enforce it globally with redirects. Do not allow both versions to return 200.

### Route aliases

Legacy or renamed routes must 301 directly to the canonical route.

### 404 behavior

Invalid slugs and unsupported language codes must return a real 404, not a generic 200 page.

---

## 9. Pass-page strategy

The short-stay product is a strategic SEO opportunity because Hurghada has tourism demand.

The core query is not simply "membership." Visitors may ask:

- Can tourists use Gold's Gym Hurghada?
- Is there a gym day pass in Hurghada?
- Can I train for a week in Hurghada?
- What does a Gold's Gym Hurghada day pass include?
- Do I need ID?
- Can I buy access online before arriving?

The `/passes` hub should answer the overall visitor-access intent.

Each detail page, if indexed, should contain:

1. unique H1;
2. current price;
3. exact validity;
4. what's included;
5. what's excluded;
6. who it is suited to;
7. purchase/booking process;
8. check-in requirements;
9. opening/access hours;
10. what to bring;
11. cancellation/refund rules;
12. link to facilities;
13. link to contact/location;
14. comparison with other pass options;
15. concise FAQs only where useful.

Do not publish four near-identical pages with only duration and price changed.

---

## 10. Membership page framework

`/memberships` should own the broad membership intent.

Recommended structure:

1. **Hero:** clear membership proposition.
2. **Membership options:** plan name, billing period, price, key inclusions.
3. **What membership includes:** facilities, classes or other actual benefits.
4. **Who each plan suits:** concise decision support.
5. **How to join:** online/offline steps.
6. **Personal training:** relevant cross-link, not bundled unless truly included.
7. **Classes:** relevant cross-link.
8. **Club access and rules:** important restrictions.
9. **Cancellation/freeze policy:** concise summary with policy link.
10. **FAQs:** only real purchase objections/questions.
11. **CTA:** join/buy/contact.

Prices and inclusions must be machine-readable HTML text, not only artwork.

---

## 11. Personal-training cluster

### `/personal-training`

Owns the service-level intent:

- personal training Hurghada;
- personal trainer at Gold's Gym Hurghada;
- one-to-one training.

Page content:

- what personal training is at this branch;
- available coaching goals/specialties;
- how trainer matching works;
- session formats;
- pricing or pricing process;
- what happens in the first session;
- actual trainer links;
- facility context;
- booking CTA;
- relevant FAQs.

### `/trainers`

Acts as the people/entity hub.

Each trainer card should expose:

- name;
- real image;
- specialty;
- languages;
- short credential summary;
- profile link.

### `/trainers/:trainer-name`

Profile framework:

1. trainer name and role;
2. authentic portrait;
3. specialties;
4. verified credentials;
5. years/areas of experience, if verifiable;
6. coaching approach in the trainer's own voice where possible;
7. languages;
8. ideal client situations;
9. available training/session types;
10. branch association;
11. relevant classes;
12. authored/reviewed fitness content;
13. booking CTA.

Never manufacture qualifications, transformations, testimonials or performance claims.

---

## 12. Classes and schedule architecture

### `/classes`

Stable class hub.

It should explain the group-training offer and link to each substantive class page and the schedule.

### `/classes/:class-slug`

Create a dedicated page only for a stable class/program that has enough unique information.

Suggested blocks:

- class definition;
- training focus;
- intensity;
- typical duration;
- experience level;
- what to expect;
- trainer(s);
- equipment;
- what to bring;
- who it may or may not suit;
- schedule link;
- booking/join CTA.

### `/classes/schedule`

The schedule is operational content.

Requirements:

- important schedule data rendered as crawlable text/HTML;
- clear date/week context;
- trainer and class links where available;
- no infinite crawlable calendar URLs;
- past schedule states should not multiply the index;
- update timestamps where helpful;
- avoid creating separate indexable URLs for every recurring class session.

Do not mark routine members-only classes as public `Event` rich-result opportunities merely for SEO.

---

## 13. Facilities page

`/facilities` should be an evidence page, not only an image gallery.

Recommended sections:

- strength training;
- free weights;
- plate-loaded / selectorized machines;
- cardio;
- functional training;
- group-training spaces;
- personal-training areas;
- changing/locker facilities;
- other actual amenities.

Use real branch photography.

For equipment claims, name brands/models only when verified and useful.

The page should link to:

- memberships;
- passes;
- personal training;
- classes;
- contact/location.

---

## 14. Fitness knowledge architecture

The content hub is intentionally organized by **content job**, not by vague "blog" categories.

### `/fitness/guides`

Purpose: evergreen education.

Examples:

- how to start strength training;
- cardio vs strength training;
- how to choose a personal trainer;
- beginner guide to progressive overload;
- how to return to the gym after a break.

### `/fitness/workouts`

Purpose: actionable training sessions/programs.

Examples:

- beginner full-body workout;
- upper-body strength workout;
- 30-minute hotel-to-gym transition workout;
- chest and triceps workout;
- lower-body workout for beginners.

### `/fitness/tips`

Purpose: narrower practical questions.

Examples:

- how long to rest between sets;
- what to bring to the gym;
- how often beginners should train;
- how to warm up before lifting.

### Content-type separation rule

Ask:

- **Guide:** does the user need understanding?
- **Workout:** does the user need a session/program to perform?
- **Tip:** does the user need a short practical answer?
- **Blog/news:** is this a branch-specific update or timely story?

If the answer overlaps two types, choose the dominant intent and publish one canonical page.

---

## 15. Keyword and intent governance

Before any page is drafted, record:

- proposed URL;
- page type;
- primary search intent;
- primary keyword theme;
- supporting variations;
- audience;
- funnel stage;
- entity/topic;
- parent cluster;
- internal links in;
- internal links out;
- CTA;
- evidence requirements;
- status/priority.

### Keyword ownership rules

1. Every indexable URL owns one primary theme.
2. Existing ownership must be checked before creating a new page.
3. Synonyms normally belong on one page.
4. Distinct questions may become separate pages.
5. Commercial and informational intent should not be merged when doing so makes the page less useful.
6. Search volume alone does not justify a page.
7. Gold's Gym brand terms must be represented accurately and consistently.
8. Avoid unsupported "best", "#1", "largest" or similar claims unless the franchise provides approved evidence.

---

## 16. Content creation workflow — mandatory

Every substantial page or article should follow this workflow:

```text
1. Topic / business need
↓
2. Intent check
↓
3. Keyword ownership & cannibalisation check
↓
4. SERP / demand review where relevant
↓
5. Source Pack
↓
6. Fact Pack
↓
7. Page brief & outline
↓
8. Native draft
↓
9. Trainer / operational verification
↓
10. SEO metadata
↓
11. AIO extraction pass
↓
12. Internal linking
↓
13. Schema mapping
↓
14. Publish
↓
15. Technical QA
↓
16. Indexation / performance monitoring
↓
17. Refresh when facts or demand change
```

### Step 1 — Topic / business need

Every piece must answer a real need:

- revenue;
- conversion;
- member support;
- trainer discovery;
- visitor access;
- local entity completeness;
- topical authority;
- retention or education.

### Step 2 — Intent check

Define what the user is trying to accomplish.

Examples:

- "gym day pass Hurghada" → transactional/commercial;
- "how long to rest between sets" → informational;
- "Gold's Gym Hurghada opening hours" → navigational/local;
- "personal trainer Hurghada" → commercial.

### Step 3 — Ownership/cannibalisation check

Confirm no existing page already owns the same intent.

If it does:

- improve the existing page;
- merge supporting material;
- do not create a competing URL.

### Step 4 — Search-demand review

Where useful, review:

- Google Search Console;
- Google Ads Keyword Planner;
- actual search results;
- Google Business Profile query data;
- onsite search;
- social/community questions;
- sales/front-desk questions.

Do not let keyword tools override customer reality.

### Step 5 — Source Pack

Gather source material before writing.

#### Operational source hierarchy

1. Gold's Gym Hurghada management / current internal records.
2. Official franchise/master-brand material supplied to the branch.
3. Current CMS pricing, schedules and trainer records.
4. Equipment/manufacturer documentation where relevant.

#### Fitness/health source hierarchy

Prefer:

1. authoritative public-health or medical bodies;
2. established professional exercise-science organizations;
3. systematic reviews / peer-reviewed research;
4. qualified subject-matter expert review;
5. official product/equipment documentation for technical claims.

Do not use influencer content or generic competitor blogs as the primary evidence for health claims.

### Step 6 — Fact Pack

Extract only claims that can be responsibly supported.

Record internally:

- fact/claim;
- source;
- source date;
- last verified date;
- whether the claim is time-sensitive;
- whether it may be published directly;
- expert reviewer if required.

The Fact Pack is the factual boundary for the draft.

### Step 7 — Page brief

The brief should define:

- user problem;
- page goal;
- unique angle;
- primary intent;
- keyword theme;
- H1 direction;
- required facts;
- proposed headings;
- CTA;
- internal-link targets;
- schema/entity targets;
- content type;
- visual requirements.

### Step 8 — Native draft

Write for the real reader, not for a keyword list.

Requirements:

- useful opening;
- no padded introduction;
- direct answer early;
- natural keyword use;
- branch-specific facts where relevant;
- original examples where useful;
- no repetitive template language;
- no unsupported superlatives.

### Step 9 — Verification

Operational pages: verify with management/current CMS.

Trainer pages: trainer/manager confirms biography and credentials.

Fitness content: author/reviewer confirms exercise claims and safety guidance.

### Step 10 — Metadata

Create unique:

- SEO title;
- meta description;
- H1;
- slug;
- social title/description if needed.

### Step 11 — AIO extraction pass

Ask:

- Can a machine identify the page's main entity?
- Can the primary question be answered from the first section?
- Are prices/durations/inclusions explicit?
- Are tables labelled clearly?
- Are headings descriptive?
- Are terms defined in plain language?
- Does the page show who wrote/reviewed it?
- Are important facts available as text?
- Are ambiguity and conditions made explicit?