# Gold’s Gym Hurghada — Website, Member App & Shared Backend Architecture

**Status:** Architecture source of truth  
**Version:** 1.1  
**Date:** 2026-09-26  
**Project:** Gold’s Gym Hurghada digital ecosystem

---

## 1. Architecture decision

Use **two separate frontends with one shared backend and one data model**.

```text
PUBLIC WEBSITE                     MEMBER / OPERATIONS APP
www.goldsgymhurgahda.co          app.goldsgymhurgahda.co
Marketing + Sales + SEO/AIO        Members + Staff + Admin
            \                         /
             \                       /
              └──── SHARED BACKEND ─┘
```

The public website is built for **discovery and conversion**.

The app is built for **member service and gym operations**.

Do not maintain duplicate member, membership, booking, lead or trainer databases between the two products.

---

## 1A. Current delivery priority

The immediate production priority is the **public marketing website**.

The shared backend must support the website’s live requirements while preserving the domain boundaries and relationships required for future member and mobile application capabilities.

Future capabilities described in this architecture are **architectural provisions, not instructions to implement every feature in the initial release**.

### Initial release priority

Prioritize:

- public marketing and SEO/AIO pages;
- memberships and visitor passes;
- trainer and class discovery;
- group class schedule;
- lead generation;
- checkout / payment entry where included in launch scope;
- member authentication and member account access on web where required.

### Member access model

Members may use their account through:

- the web member experience;
- a future packaged/mobile application.

Both interfaces must use the **same identity, member record, memberships, passes, entitlements, schedules, bookings and transaction history**.

Do not create separate “website member” and “app member” identities.

### Build policy

Use the principle:

```text
MODEL NOW
IMPLEMENT WHEN REQUIRED
```

The backend should define stable canonical entities and relationships needed for future expansion, but functionality should be implemented only when required by the current delivery phase or a confirmed near-term dependency.

Examples of capabilities that may be modeled before full implementation:

- booking and waitlist relationships;
- attendance;
- notification relationships;
- loyalty;
- corporate accounts;
- advanced check-in hardware;
- richer PT availability.

Do not build future UI, workflows or infrastructure merely because the architecture allows them.

### Anti-temporary-system rule

Do not create temporary website-only data models that will later need to be replaced by separate app models.

The website may launch first, but the underlying records must remain reusable by the future member/app ecosystem.

This delivery approach follows an evolutionary architecture: small, reversible releases should serve the current business goal while keeping clean boundaries for later expansion.

---

## 2. Product roles

### A. Public marketing & sales website

Primary users:

- prospects;
- local residents;
- tourists and short-stay visitors;
- search-engine users;
- AI/search discovery systems.

Primary responsibilities:

- Gold’s Gym Hurghada brand experience;
- SEO and AI discovery;
- memberships;
- 1-day, 3-day, 5-day and 7-day passes;
- personal training sales;
- trainer discovery;
- public class information and schedule;
- facilities;
- fitness content;
- campaigns and offers;
- lead generation;
- public checkout/purchase entry points;
- contact, location and policies.

Recommended domain:

```text
www.goldsgymhurgahda.co
```

---

### B. Member & operations app

Primary users:

- members;
- pass holders;
- reception staff;
- trainers where relevant;
- managers;
- administrators.

Primary responsibilities:

- member authentication;
- digital membership card / QR;
- current membership/pass status;
- expiry and freeze status;
- bookings;
- class registration;
- personal-training booking;
- profile/account management;
- check-in scanning;
- staff member lookup;
- lead management;
- operational schedule management;
- reporting;
- admin and permissions.

Recommended web-app domain:

```text
app.goldsgymhurgahda.co
```

The same member app can later be wrapped/published as iOS and Android apps while continuing to use the same backend.

---

## 3. Public website structure

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
├── /blog                 # optional: branch news only
│   └── /blog/:slug
│
├── /privacy-policy
├── /terms-and-conditions
├── /refund-cancellation-policy
├── /cookie-policy
└── /club-rules
```

The website should not contain staff tools or admin workspaces.

Member account access may be exposed through the web experience, but authenticated member functionality must remain separated from public indexable content and use the same shared backend identity/data model as the future mobile app.

---

## 4. Member & operations app structure

The app uses role-aware navigation. The routes below describe logical modules and can be adjusted during implementation.

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
│   ├── /member/notifications
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
    ├── /admin/users-roles
    ├── /admin/authorized-devices
    ├── /admin/memberships-passes
    ├── /admin/content-media
    ├── /admin/payments
    ├── /admin/audit-logs
    └── /admin/settings
```

### Member navigation

Keep the consumer app simple:

- Home;
- Membership;
- Book;
- QR / Member Card;
- Profile.

### Staff navigation

Show operational tools only to authorized roles:

- Check-In;
- Members;
- Leads;
- Schedule;
- Trainers;
- Reports.

### Admin navigation

Show configuration and security controls only to administrators/managers with the required permissions.

---

## 5. Shared backend

Both frontends connect to the same controlled backend.

Suggested core entities:

```text
User
Member
StaffUser
Role
Permission
AuthorizedDevice
Lead
CampaignAttribution
MembershipPlan
Membership
PassProduct
PassPurchase
Trainer
TrainerAvailability
ClassType
ClassSession
Booking
PersonalTrainingBooking
CheckIn
Payment
Order
Promotion
Notification
Content
Media
AuditLog
```

The exact entity model can evolve, but there should be only **one authoritative record** for each business object.

---

## 6. Relationship between website and app

### Discovery → member journey

```text
Google / AI / Ads / Social
          ↓
Public Website
          ↓
Membership / Pass / PT / Class decision
          ↓
Lead or Purchase / Account Creation
          ↓
Shared Backend
          ↓
Member Web Account / Future App
          ↓
Book → Check In → Train → Engage → Renew
```

### Website → member experience handoff

The public site may send users into authenticated member functionality when login is required.

Examples:

```text
Join Now
→ purchase/signup
→ account created
→ Open Member Account
```

```text
Book This Class
→ login/member deep link
→ member booking flow
```

```text
Manage Membership
→ authenticated member experience
```

Preserve campaign/source attribution across the handoff where technically possible.

---

## 7. Lead architecture

Do **not** maintain a separate website lead database that later syncs into the app.

Recommended flow:

```text
Website Lead Form
      ↓
createLead API / backend function
      ↓
Shared Lead entity
      ↓
Staff App / CRM View
```

The public endpoint should allow **create-only** behavior.

It must not allow the public website to:

- list leads;
- read other lead records;
- edit arbitrary leads;
- access member or staff data.

Store relevant attribution with the lead:

- source;
- medium;
- campaign;
- UTM values;
- landing page;
- lead form;
- requested product/service;
- timestamp.

---

## 8. Membership and pass purchase flow

Recommended relationship:

```text
Public Website
→ Select membership/pass
→ Checkout
→ Payment result
→ Backend creates/updates customer + entitlement
→ Member receives account access
→ Membership/pass appears in web member account
→ Same record is available to future mobile app
```

The public website handles **sales discovery and checkout entry**.

The authenticated member experience handles **ongoing ownership and use**, whether accessed on the web or through a future mobile app.

Member experience examples:

- current plan;
- activation date;
- expiry date;
- freeze status;
- renewal options;
- digital QR/member card;
- purchase history where required.

---

## 9. Classes and personal training

### Public website

Used for discovery:

- class types;
- public schedule;
- trainer profiles;
- personal-training proposition;
- pricing or enquiry route where appropriate.

### Authenticated member experience

Used for member-specific action when implemented:

- class booking;
- cancellation;
- remaining capacity if exposed;
- trainer/session booking;
- booking history;
- member-specific availability;
- reminders.

This keeps public pages useful to search users without exposing private booking logic.

---

## 10. Member QR and reception check-in

The member experience can display the member’s QR/digital membership credential when that capability is implemented.

Reception validates it through the operations app.

```text
Member QR
      ↓
Authorized Reception Device
      ↓
Staff Check-In Module
      ↓
Shared Backend
      ↓
Membership / Pass Validation
      ↓
Access Decision + Check-In Log
```

Supported input methods can include:

- phone/tablet camera QR scan;
- USB 1D/2D/QR scanner connected to an authorized reception PC;
- manual lookup fallback;
- future turnstile/RFID/NFC integrations.

Only pre-approved devices should be permitted to use staff check-in functionality.

Device authorization is defined separately in the **Secure Member Check-In Feature Plan**.

This is a future operational capability unless explicitly included in the current website launch scope.

---

## 11. Authentication and authorization

### Public website

Default state: anonymous/public.

Only narrowly scoped backend actions should be exposed, for example:

- create lead;
- start checkout;
- read public membership/pass data;
- read public trainers/classes/content;
- submit permitted forms.

### Member account

Requires authenticated member session for private data.

Members can access only their own permitted records regardless of whether they use web or a future mobile app.

### Staff/admin

Use role-based access control.

Example hierarchy:

```text
Member
Reception
Trainer
Manager
Administrator
```

Permissions should be action-based rather than relying only on page visibility.

Examples:

```text
checkin.scan
member.read_limited
lead.read
lead.update
class.manage
trainer.manage
membership.adjust
payment.view
user.manage
device.manage
```

The backend must enforce permissions even if someone manually calls an endpoint.

---

## 12. Mobile app strategy

### Phase 1 — Web-first member access

Launch the website first and provide authenticated member access on the web where required.

The shared backend, identity and domain model must already be reusable by future mobile applications.

### Phase 2 — Responsive member web app / richer member portal

Expand the authenticated member experience mobile-first.

Prioritize only confirmed member needs, such as:

- fast login;
- membership/pass status;
- digital QR card;
- bookings;
- profile/account management;
- notifications where supported.

### Phase 3 — iOS and Android packaging

Package or build a mobile application when business demand justifies it.

The mobile application must continue using the same:

- backend;
- authentication;
- member records;
- memberships;
- passes;
- bookings;
- QR credentials.

### Phase 4 — Native divergence only if justified

Consider a separate native codebase only if future requirements materially justify it, such as:

- advanced Bluetooth integrations;
- substantial offline capability;
- advanced background services;
- deep hardware integration;
- significantly different native UX.

Do not create a second native codebase merely for branding or basic mobile access.

---

## 13. SEO/AIO boundary

This architecture deliberately separates discovery from private application complexity.

### Public website

- indexable;
- crawlable;
- included in XML sitemap;
- canonical URLs;
- schema;
- semantic HTML;
- SEO/AIO content;
- public commercial pages;
- public fitness content.

### Authenticated member / operations surfaces

- not SEO content surfaces;
- private routes excluded from public sitemap;
- authenticated routes protected;
- utility/login pages `noindex` where applicable;
- no duplicate search-facing commercial/content pages.

This prevents private product surfaces from competing with the public website for search visibility and keeps the search architecture clean.

---

## 14. Analytics relationship

Use a shared measurement strategy but distinguish product surfaces.

Recommended context fields:

```text
surface = website | member_web | member_app | staff_app
user_type = anonymous | lead | member | staff | admin
```

Important cross-surface events:

- lead submitted;
- join started;
- checkout started;
- purchase completed;
- account activated;
- member login;
- class booked;
- PT booking requested/completed;
- QR opened;
- check-in successful;
- check-in denied;
- membership renewed.

Campaign attribution should be retained from the website into downstream conversion records where possible.

---

## 15. Data ownership matrix

| Data | Source of truth | Public website | Member web / future app | Staff/Admin |
|---|---|---|---|---|
| Public content | Shared backend/CMS | Read | Optional read | Manage |
| Membership plans | Shared backend | Read | Read | Manage |
| Pass products | Shared backend | Read | Read | Manage |
| Leads | Shared backend | Create only | No | Read/manage |
| Members | Shared backend | Restricted creation via signup | Own record | Authorized access |
| Memberships | Shared backend | Purchase/start | Own record | Authorized management |
| Trainers | Shared backend | Public read | Read/book | Manage |
| Classes | Shared backend | Public read | Read/book | Manage |
| Bookings | Shared backend | Start/handoff if allowed | Own bookings | Manage |
| Check-ins | Shared backend | No | Own history if exposed | Create/read by permission |
| Authorized devices | Shared backend | No | No | Admin/manager only |
| Payments/orders | Shared backend/payment provider | Create checkout | Own permitted records | Authorized view/manage |
| Media | Shared backend | Read | Read | Manage |

---

## 16. Recommended rollout

### Phase 1 — Website go-live foundation

- public website architecture;
- shared canonical data model;
- secure backend/API boundaries;
- roles and permissions foundation;
- trainers/classes/schedule needed by the website;
- memberships and passes needed by the website;
- lead creation;
- member authentication/account access where required;
- SEO/AIO and analytics implementation.

### Phase 2 — Core commercial journey

- checkout/payment flow if not included in Phase 1;
- purchase fulfillment;
- member membership/pass view;
- renewal flows required by the business.

### Phase 3 — Member engagement

Implement only when prioritized:

- class booking;
- personal-training booking;
- notifications;
- richer member account management;
- digital member card.

### Phase 4 — Operations

Implement when operationally required:

- reception check-in;
- authorized-device controls;
- lead/CRM management;
- reporting;
- audit tooling.

### Phase 5 — Mobile distribution

When justified:

- package/build member app for iOS/Android;
- real-device QA;
- app-store assets;
- store submission;
- deep links from website into installed app where supported.

The existence of a later phase in this architecture is not an implementation mandate.

---

## 17. Final architecture rule

Gold’s Gym Hurghada should operate as **one digital ecosystem, delivered incrementally**:

```text
GO LIVE NOW                         EXPAND LATER
Public Website                      Member / Staff Capabilities
       \                               /
        \                             /
         └────── Shared Backend ─────┘
```

The public website currently owns the priority journey:

**Discover → Explore → Compare → Enquire / Buy → Account**

The authenticated member experience can then expand through:

**Activate → Book → Check In → Train → Engage → Renew**

The shared backend connects the full customer lifecycle without duplicated records or fragile synchronization jobs.

The implementation rule is:

> Build what the website and confirmed near-term workflows require now. Model stable relationships for future capabilities, but do not pre-build unused product complexity.
