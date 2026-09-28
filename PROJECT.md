# Gold’s Gym Hurghada — Project Kickoff & Delivery Brief

**Status:** Active delivery brief  
**Date:** 2026-09-26  
**Primary public domain:** `https://www.goldsgymhurgahda.co`

---

## 1. Project Objective

Deliver the production-ready Gold’s Gym Hurghada marketing website and the backend capabilities required to support it.

The **website launch is the primary milestone**.

Future functionality must not delay launch unless it is a genuine technical or business dependency for the current release.

The backend should be ready for the website now and structurally prepared for later member, booking, check-in, notification, loyalty, partner, and mobile-app capabilities without creating duplicate data models or requiring a rebuild.

Use the rule:

```text
MODEL NOW
IMPLEMENT WHEN REQUIRED
```

---

## 2. Current Delivery Scope

### REQUIRED NOW

Prioritize the capabilities needed for the public website and confirmed launch flows:

- homepage and public marketing pages;
- memberships;
- 1-day, 3-day, 5-day and 7-day passes;
- personal training;
- trainer profiles;
- group fitness classes;
- group class schedule;
- facilities;
- fitness content;
- contact and lead generation;
- legal/policy pages;
- SEO/AIO implementation;
- analytics and attribution;
- CMS/admin functionality required to manage the live website;
- member authentication / member web account where required;
- checkout and payments where included in launch scope.

### DEPENDENCY NOW

Implement only the backend foundations genuinely required by launch-scope capabilities, such as:

- canonical entities and relationships;
- identity/authentication;
- roles and permissions;
- products/pricing;
- orders/payments/fulfillment where relevant;
- entitlements where relevant;
- audit/security controls;
- reliable schedule resolution;
- migration/data-integrity safeguards.

### FUTURE-READY ONLY

Preserve clean architecture for, but do not pre-build unless explicitly promoted into active scope:

- class booking;
- waitlists;
- PT booking;
- attendance;
- secure QR check-in;
- notifications;
- loyalty;
- corporate memberships;
- hotel/partner integrations;
- packaged/native mobile applications.

---

## 3. Core Product Architecture

```text
PUBLIC WEBSITE
www.goldsgymhurgahda.co
Marketing + SEO/AIO + Sales
        │
        ▼
SHARED BACKEND
        │
        ├── Members
        ├── Memberships & Passes
        ├── Products & Pricing
        ├── Trainers
        ├── Classes & Schedule
        ├── Leads
        ├── Orders & Payments
        ├── Entitlements
        ├── Content
        └── Permissions / Audit
        │
        ▼
AUTHENTICATED MEMBER WEB EXPERIENCE
        │
        └── Future mobile application
```

There must be **one canonical record** for each business object.

Do not create separate website/app versions of:

- members;
- memberships;
- passes;
- trainers;
- classes;
- schedules;
- bookings;
- orders;
- payments;
- entitlements.

Members may use the same account through the web member experience now and a future mobile application later.

---

## 4. Governing Documentation

This file is the project-level delivery brief. Detailed requirements live in specialized documents under `docs/`.

### Master documents

- `docs/01-website-member-app-shared-backend-architecture.md`
  - product-surface ownership;
  - website/member/backend boundaries;
  - rollout principles.

- `docs/02-backend-architecture-domain-model.md`
  - canonical backend/domain model;
  - schema changes;
  - permissions;
  - historical integrity;
  - transactions and future-ready relationships.

- `docs/03-seo-aio-strategy.md`
  - public URLs;
  - SEO/AIO;
  - indexation;
  - structured data;
  - content architecture;
  - internal linking;
  - public/private search boundary.

### Specialized feature documents

- `docs/10-group-class-schedule-upgrade.md`
  - classes;
  - studios/locations;
  - recurrence;
  - overrides;
  - schedule admin;
  - public schedule UX.

- `docs/11-secure-check-in.md`
  - member QR/access;
  - staff devices;
  - entitlement validation;
  - check-in/attendance.
  - Currently future-ready unless explicitly promoted into active scope.

- `docs/12-membership-pass-sales.md`
  - memberships;
  - passes;
  - products/pricing;
  - checkout;
  - orders/payments;
  - fulfillment;
  - entitlements.

---

## 5. Authority Order

When requirements overlap, use this order:

```text
PROJECT.md — delivery priority / active scope
        ↓
01 — Website, Member App & Shared Backend Architecture
        ↓
02 — Backend Architecture & Domain Model
        ↓
03 — SEO & AIO Strategy
        ↓
Relevant specialized feature document
        ↓
Current implementation details
```

`PROJECT.md` controls **what is active now**.

The master documents control **how the system should be structured**.

Specialized documents add detail but must not contradict the master documents.

If the current codebase conflicts with the governing architecture, identify the conflict and propose the safest migration rather than silently adding a parallel workaround.

---

## 6. Codex Kickoff

Before major implementation:

1. audit the existing repository;
2. inspect the current database/schema;
3. inspect routes, components, backend functions and integrations;
4. inspect CMS/admin, authentication, analytics and deployment configuration;
5. identify reusable working implementation;
6. compare the current state against the governing MD files;
7. classify work as `REQUIRED NOW`, `DEPENDENCY NOW`, or `FUTURE-READY ONLY`;
8. produce a milestone-based implementation plan;
9. identify migrations, risks and dependencies before major structural changes.

Do not rewrite working systems merely because the target architecture is broader.

---

## 7. Delivery Timeline — Milestone Sequence

No calendar dates are assumed in this brief. The delivery timeline is the following ordered milestone sequence.

### Milestone 1 — Audit & Plan

Deliver:

- current-state architecture;
- repo/database audit;
- gap analysis against governing docs;
- migration requirements;
- implementation plan;
- risks/dependencies;
- validation approach.

### Milestone 2 — Backend & Data Foundation

Stabilize only what website launch needs:

- canonical entities;
- relationships;
- roles/permissions;
- public/private backend boundaries;
- trainers/classes/studios/schedule;
- memberships/passes/products/pricing;
- leads;
- orders/payments/entitlements where required;
- audit/security foundations.

### Milestone 3 — Public Website Completion

Complete launch-critical public experiences:

- home;
- memberships;
- passes;
- personal training;
- trainers;
- classes;
- schedule;
- facilities;
- fitness content;
- about/contact;
- legal/policy pages.

Preserve the approved visual language unless a change is required for correctness, usability, responsiveness, accessibility or SEO.

### Milestone 4 — Commercial & Member Web Flows

Complete confirmed launch-scope flows:

```text
Discover
→ Compare
→ Enquire / Buy
→ Account
```

Where applicable:

- lead forms;
- membership/pass purchase;
- checkout/payment;
- fulfillment;
- account creation/login;
- membership/pass status;
- purchase history.

### Milestone 5 — Group Class Schedule

Complete:

- recurring weekly schedule;
- date-specific overrides;
- one-off sessions;
- trainer/studio/access relationships;
- admin workflow;
- public week/day schedule;
- filtering;
- responsive behavior.

Months are views of the schedule, not duplicated monthly schedules.

### Milestone 6 — SEO / AIO / Analytics

Complete and verify:

- intent ownership;
- metadata;
- canonicals;
- sitemap;
- robots/index controls;
- structured data;
- breadcrumbs;
- internal linking;
- semantic HTML;
- dynamic-route behavior;
- conversion tracking;
- campaign attribution;
- public/private search boundary.

### Milestone 7 — Security, QA & Production

Complete:

- authorization verification;
- validation/rate limiting where required;
- payment/webhook integrity where applicable;
- error handling/logging/monitoring;
- responsive QA;
- accessibility QA;
- SEO technical QA;
- forms;
- checkout;
- member login;
- schedule;
- admin workflows;
- production configuration;
- backup/recovery readiness;
- rollback path;
- staging/UAT;
- production launch verification.

---

## 8. Definition of Done

The initial website project is ready for launch when:

- all required public routes are production-ready;
- launch-critical CMS/admin workflows work;
- memberships/passes display correct canonical data;
- lead flows work end-to-end;
- payment flows work correctly if included in launch;
- member web login works where required;
- the class schedule is driven by the shared backend;
- SEO/AIO requirements are implemented;
- analytics and conversion tracking are verified;
- permissions/security checks pass;
- desktop/mobile QA passes;
- launch-critical accessibility issues are resolved;
- staging/UAT is approved;
- production deployment is verified;
- rollback and recovery procedures exist.

---

## 9. Codex Execution Rules

For each milestone:

1. inspect before editing;
2. keep changes scoped to the active milestone;
3. reuse existing working code and Base44 patterns where appropriate;
4. avoid duplicate data models;
5. preserve production data and historical records;
6. keep changes small, reviewable and reversible;
7. run available lint, typecheck, tests, build and relevant smoke checks;
8. fix validation failures before moving forward;
9. record important decisions, known issues and follow-ups;
10. do not expand into future-only scope without a genuine dependency.

After the initial audit, Codex may create and maintain:

```text
PLAN.md
STATUS.md
```

These are execution documents. `PROJECT.md` and `docs/` remain the governing project/specification sources.

---

## 10. Final Delivery Principle

```text
GO LIVE NOW
Marketing Website
+
Only the backend capabilities it genuinely requires
+
Stable shared domain foundations

THEN EXPAND
Member Features
Bookings
Check-In
Notifications
Mobile App
Loyalty
Partner Integrations
```

The objective is to launch the website quickly **without creating technical debt that forces the future member/app ecosystem to be rebuilt**.
