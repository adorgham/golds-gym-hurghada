# Gold’s Gym Hurghada — Backend Architecture & Domain Model

## Purpose

This document defines the shared backend architecture, canonical domain model, relationships, business-rule boundaries, and implementation logic for the Gold’s Gym Hurghada digital ecosystem.

It is intended to govern the architecture behind:

- the public marketing website
- the member app
- the admin / staff backend
- group class scheduling
- memberships and passes
- personal training
- trainer profiles and availability
- bookings and waitlists
- payments
- secure check-in and attendance
- notifications
- dependants / kids participation
- content and fitness resources
- future loyalty, offers, and engagement features

The objective is to plan the backend once, with clear domain boundaries, so individual features can be implemented incrementally without creating duplicate data models or requiring disruptive redesign later.

---

## Current Delivery Priority — Website First, Backend Ready

The immediate delivery priority is the **public marketing website**.

This backend architecture defines the long-term canonical model, but it must not be interpreted as a requirement to implement every future capability before website launch.

Use the rule:

```text
MODEL NOW
IMPLEMENT WHEN REQUIRED
```

### What must be production-ready for website go-live

Implement the backend capabilities required by the live website and confirmed launch flows, including where applicable:

- public content and media;
- trainers;
- classes;
- studios / locations;
- recurring schedule + overrides + one-off sessions;
- membership and pass products;
- pricing;
- leads and attribution;
- member identity/account access where required;
- orders/payments/fulfillment where online purchase is in scope;
- entitlements needed by live membership/pass logic;
- permissions, audit and security controls required by implemented workflows.

### What should be architecturally prepared but not necessarily built yet

Preserve relationships for future capabilities such as:

- class booking;
- waitlists;
- PT booking;
- attendance;
- secure QR check-in;
- notifications;
- loyalty;
- corporate membership;
- hotel/partner integrations;
- native mobile applications.

Do not build unused workflows, infrastructure or UI solely because they appear in the target domain model.

### One identity across web and future app

A member must have one canonical identity and member record.

The same account and backend records must serve:

- authenticated member access on the web;
- a future PWA or mobile application.

Do not create separate website-member and app-member databases, identifiers or entitlement systems.

### Evolution rule

When a future feature is introduced:

1. reuse the canonical entities already defined here;
2. extend the existing domain cleanly;
3. avoid parallel replacement models;
4. migrate only when a documented architectural reason exists;
5. prefer small, reversible changes over speculative redesign.

The purpose of planning future relations now is to prevent dead ends — not to increase the initial implementation scope.

---

# 1. Core Architecture Principle

The Gold’s Gym Hurghada platform should use a **shared backend** as the canonical source of truth.

The website and member app should not maintain separate copies of:

- members
- memberships
- trainers
- classes
- schedules
- bookings
- products
- payments
- access rules
- attendance
- content relationships

Instead:

```text
                    SHARED BACKEND
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Public Website     Member App       Admin
        │                │                │
        └────────────────┴────────────────┘
```

Each interface presents the same underlying domain data differently according to user role and purpose.

---

# 2. Architectural Goals

The backend should be designed around the following principles:

1. **Single source of truth**
2. **Reusable entities**
3. **Clear domain boundaries**
4. **Minimal duplication**
5. **Historical integrity**
6. **Future-ready relationships**
7. **Low-friction administration**
8. **Business rules separated from presentation**
9. **Secure member and staff access**
10. **Incremental implementation without architectural dead ends**

---

# 3. Domain Overview

The backend should be organized conceptually into these domains:

| Domain | Primary Purpose |
|---|---|
| Identity & Accounts | Authentication, member/staff accounts, profiles |
| Members & Dependants | Member records, family/dependant relationships |
| Memberships & Passes | Membership plans, active memberships, day/multi-day passes |
| Products & Entitlements | What a person purchased and what access that purchase grants |
| Classes & Scheduling | Class definitions, recurring timetable, overrides, one-off sessions |
| Trainers & PT | Trainer profiles, specialties, availability, PT services |
| Bookings & Waitlists | Group class and PT reservation logic |
| Payments & Orders | Purchases, transactions, refunds, pricing |
| Access & Check-In | QR/access validation, facility entry, attendance |
| Facilities & Studios | Physical spaces and locations |
| Notifications | Reminders, cancellations, renewals, communication preferences |
| Content & Fitness Resources | Blog, fitness tips, workout guides, linked content |
| Admin & Audit | Roles, permissions, change history, operational controls |
| Promotions & Loyalty | Future offers, promo codes, rewards, campaigns |

---

# 4. Identity & Accounts

Authentication should be separated from business-profile data.

## 4.1 User Account

```text
user_accounts
- id
- email
- phone
- auth_provider
- auth_provider_user_id
- status
- email_verified_at
- phone_verified_at
- last_login_at
- created_at
- updated_at
```

A `user_account` represents authentication identity.

It should not itself contain all membership/business data.

## 4.2 Account Roles

A user account may have one or more roles.

```text
user_roles
- id
- user_account_id
- role
```

Suggested roles:

```text
member
staff
trainer
admin
super_admin
```

Avoid hard-coding application behavior directly from authentication identity.

---

# 5. Members & Dependants

## 5.1 Member

```text
members
- id
- user_account_id nullable
- first_name
- last_name
- date_of_birth nullable
- gender nullable
- phone
- email
- profile_photo_url nullable
- status
- joined_at
- created_at
- updated_at
```

A member record represents the real gym customer.

`user_account_id` may initially be nullable for members created at reception before activating their app account.

## 5.2 Dependants

Support dependants from the beginning because Kids classes may later be booked by a parent/guardian.

```text
dependants
- id
- primary_member_id
- first_name
- last_name
- date_of_birth
- gender nullable
- relationship_type
- status
- created_at
- updated_at
```

Examples:

```text
child
spouse
other
```

A dependant may later have:

- class bookings
- attendance
- pass entitlements
- age eligibility checks

without requiring a separate login account.

---

# 6. Memberships, Passes & Products

The backend should separate the **definition of a product** from the **customer’s purchased instance**.

## 6.1 Product

```text
products
- id
- product_type
- name
- slug
- description
- active
- created_at
- updated_at
```

Suggested product types:

```text
membership_plan
day_pass
multi_day_pass
class_pack
single_class
pt_package
pt_session
promotion
other
```

Examples:

- Monthly Membership
- 1-Day Pass
- 3-Day Pass
- 5-Day Pass
- 7-Day Pass
- Air Yoga Pack
- Single Pre-Paid Class
- PT 5-Session Package

## 6.2 Price

Avoid storing one permanent price directly on the product if pricing may change.

```text
product_prices
- id
- product_id
- currency
- amount
- valid_from
- valid_until nullable
- audience_type nullable
- active
```

This supports price history and future segmentation.

---

# 7. Membership Plans

## 7.1 Membership Plan Definition

```text
membership_plans
- id
- product_id
- billing_interval
- duration_days nullable
- auto_renew_supported
- active
```

## 7.2 Member Membership

```text
memberships
- id
- member_id
- membership_plan_id
- starts_at
- ends_at
- status
- auto_renew
- source_order_id nullable
- created_at
- updated_at
```

Suggested statuses:

```text
pending
active
paused
expired
cancelled
```

Membership history must be preserved.

---

# 8. Passes

Passes should be distinct from subscriptions.

## 8.1 Member Pass

```text
member_passes
- id
- member_id nullable
- dependant_id nullable
- product_id
- starts_at
- expires_at
- usage_limit nullable
- usage_count
- status
- source_order_id nullable
- created_at
```

This supports:

- day passes
- 3-day passes
- 5-day passes
- 7-day passes
- class packs
- temporary guest access

---

# 9. Entitlements

Entitlements should be a central reusable business-rule layer.

This prevents features from hard-coding product-specific conditions.

## 9.1 Entitlement Definition

```text
entitlements
- id
- code
- name
- description
```

Examples:

```text
gym_access
group_classes
spinning_access
martial_arts_access
air_yoga_prepaid
personal_training
locker_access
guest_access
```

## 9.2 Product Entitlements

```text
product_entitlements
- id
- product_id
- entitlement_id
- quantity nullable
- usage_period nullable
```

Example:

```text
Monthly Membership
→ gym_access
→ group_classes
```

Example:

```text
Air Yoga Pack
→ air_yoga_prepaid
quantity = 5
```

## 9.3 Member Entitlement Resolution

Entitlements may come from:

- active membership
- active pass
- class pack
- direct purchase
- promotion
- manual admin grant

This should be resolved centrally.

Conceptually:

```text
Member
   ↓
Active Products / Memberships / Passes
   ↓
Entitlements
   ↓
Access Decision
```

This is preferable to:

```text
if product_name == "Air Yoga Pack"
```

---

# 10. Facilities, Studios & Locations

## 10.1 Facility

```text
facilities
- id
- name
- type
- active
```

Potential examples:

- Main Gym
- Aerobics Studio
- Spinning Studio
- Martial Arts Studio
- Functional Training Floor
- Reception

## 10.2 Studio / Schedule Location

For schedule filtering, define canonical locations.

```text
studios
- id
- name
- slug
- facility_id nullable
- active
```

Canonical schedule values:

```text
aerobics
spinning
martial_arts
floor
```

Important:

`Floor` is a location/studio dimension.

It is not a member-access classification.

---

# 11. Trainers

## 11.1 Trainer

```text
trainers
- id
- user_account_id nullable
- first_name
- last_name nullable
- display_name
- bio
- photo_url
- active
- visible_publicly
- created_at
- updated_at
```

Use one canonical trainer record across:

- website trainer profile
- class schedule
- PT booking
- availability
- attendance
- future ratings/reviews

Do not create separate trainer records for separate features.

## 11.2 Trainer Specialties

```text
trainer_specialties
- id
- trainer_id
- specialty_code
- specialty_name
```

Examples:

- Spinning
- Yoga
- Boxing
- Functional Training
- Strength
- Mobility

## 11.3 Trainer Names From Current Schedule

Known names extracted from the current schedule source:

- Diana
- Jeyna
- Luba
- Zsanett
- Veronica
- Gogo
- Gabriella
- Eva
- Samantha
- Ramadan
- Hamees
- Waleed
- Ibrahim

Normalize any source value `Diann` to:

```text
Diana
```

Do not create both.

Sessions without a known trainer should support:

```text
trainer_id = null
```

Do not invent trainer assignments.

---

# 12. Personal Training

## 12.1 PT Service

```text
pt_services
- id
- trainer_id
- product_id nullable
- name
- duration_minutes
- active
```

## 12.2 Trainer Availability

```text
trainer_availability
- id
- trainer_id
- weekday nullable
- specific_date nullable
- start_time
- end_time
- recurrence_type
- active_from nullable
- active_until nullable
```

## 12.3 PT Booking

```text
pt_bookings
- id
- member_id
- trainer_id
- pt_service_id
- starts_at
- ends_at
- status
- source_order_id nullable
- created_at
```

Suggested statuses:

```text
pending
confirmed
completed
cancelled
no_show
```

---

# 13. Classes

A class should represent the reusable activity definition, not one occurrence.

## 13.1 Class Definition

```text
classes
- id
- name
- slug
- short_description
- full_description nullable
- default_duration_minutes
- default_level nullable
- default_studio_id nullable
- active
- visible_publicly
- image_url nullable
- created_at
- updated_at
```

Examples:

- Spinning
- Zumba
- Body Pump
- Hatha Yoga
- Pilates
- Kids Kick Boxing

---

# 14. Members & Access Classification

The frontend requires a simple classification:

```text
All
Pre-Paid
Ladies Only
Kids
```

However, the backend should avoid treating these as one simplistic business-rule enum where possible.

## 14.1 Presentation Classification

```text
access_labels
- id
- code
- label
```

Values:

```text
all
prepaid
ladies_only
kids
```

## 14.2 Underlying Rule Types

Where needed, business logic should be modeled using independent rules:

```text
audience_rule
gender_rule
age_rule
entitlement_rule
payment_rule
```

Example:

`Kids`

may resolve to:

```text
age_min = 4
age_max = 8
```

Example:

`Ladies Only`

may resolve to:

```text
gender_rule = female
```

Example:

`Pre-Paid`

may resolve to:

```text
required_entitlement = air_yoga_prepaid
```

The frontend can still show one concise badge.

---

# 15. Group Class Schedule Architecture

The schedule is a shared-backend capability used by:

- public website
- member app
- admin
- future booking system
- reminders
- attendance
- analytics

Approximately **90% of the schedule remains unchanged month-to-month**.

Therefore, months should not be independent full copies.

The canonical model should be:

```text
Recurring Weekly Schedule
        +
Schedule Overrides
        +
One-Off Sessions
        ↓
Resolved Sessions
        ↓
Website / Member App / Booking / Attendance
```

A month is a view of the schedule, not a separately authored timetable.

---

# 16. Recurring Sessions

## 16.1 Recurring Session

```text
recurring_sessions
- id
- class_id
- trainer_id nullable
- studio_id
- access_label_id nullable
- day_of_week
- start_time
- duration_minutes
- level nullable
- active_from
- active_until nullable
- booking_enabled
- capacity nullable
- status
- created_at
- updated_at
```

Example:

```text
Class: Spinning
Trainer: Hamees
Studio: Spinning Studio
Access: Ladies Only
Wednesday
19:00
active_from: 2026-09-01
active_until: null
```

This should appear every Wednesday until modified.

---

# 17. Schedule Overrides

Overrides change one specific occurrence without destroying the recurring base.

## 17.1 Schedule Override

```text
schedule_overrides
- id
- recurring_session_id
- effective_date
- override_type
- replacement_trainer_id nullable
- replacement_studio_id nullable
- replacement_access_label_id nullable
- replacement_start_time nullable
- replacement_duration_minutes nullable
- replacement_capacity nullable
- notes nullable
- created_at
```

Suggested override types:

```text
cancel
reschedule
trainer_change
studio_change
access_change
capacity_change
combined
```

Examples:

- Wednesday class cancelled once
- trainer substituted
- start time moved
- studio changed
- access changed

---

# 18. Permanent Future Changes

A permanent change should preserve history.

Example:

Spinning changes from 19:00 to 19:30 starting November.

Correct approach:

```text
old recurring session
active_until = 2026-10-31
```

Create/update future recurring session:

```text
active_from = 2026-11-01
start_time = 19:30
```

Do not overwrite old records in a way that changes historical schedules.

---

# 19. One-Off Sessions

## 19.1 One-Off Session

```text
one_off_sessions
- id
- class_id
- trainer_id nullable
- studio_id
- access_label_id nullable
- session_date
- start_time
- duration_minutes
- level nullable
- booking_enabled
- capacity nullable
- status
- created_at
```

Use for:

- special workshops
- holiday classes
- promotional sessions
- temporary events
- extra one-time classes

---

# 20. Resolved Session

The frontend and booking layer should operate on a resolved session representation.

Conceptually:

```text
resolved_session
- occurrence_id
- source_type
- recurring_session_id nullable
- one_off_session_id nullable
- occurrence_date
- start_datetime
- end_datetime
- class_id
- trainer_id nullable
- studio_id
- access rules
- booking status
- capacity
- cancellation status
```

This may be implemented as:

- service-layer output
- database view
- query layer
- materialized projection

depending on the technical stack.

Do not duplicate resolved occurrences permanently unless needed for operational reasons.

---

# 21. Group Class Booking

## 21.1 Class Booking

```text
class_bookings
- id
- member_id nullable
- dependant_id nullable
- occurrence_key
- class_id
- session_date
- start_datetime
- status
- booked_at
- cancelled_at nullable
- source_order_id nullable
```

Suggested statuses:

```text
confirmed
waitlisted
cancelled
attended
no_show
```

Only one of:

```text
member_id
dependant_id
```

should normally be populated.

## 21.2 Booking Eligibility

Booking logic should check:

1. session exists
2. session is active
3. session is not cancelled
4. booking window is open
5. participant is eligible
6. required entitlement exists
7. age rules are satisfied
8. gender/audience rules are satisfied where applicable
9. capacity is available
10. duplicate booking does not already exist

---

# 22. Waitlists

## 22.1 Waitlist Entry

```text
class_waitlist
- id
- member_id nullable
- dependant_id nullable
- occurrence_key
- position
- status
- created_at
```

Suggested statuses:

```text
waiting
promoted
expired
cancelled
```

When capacity becomes available, promotion logic can notify the next eligible participant.

---

# 23. Orders

Orders should represent commercial intent.

## 23.1 Order

```text
orders
- id
- member_id nullable
- guest_email nullable
- currency
- subtotal
- discount_total
- total
- status
- created_at
- completed_at nullable
```

Suggested statuses:

```text
draft
pending_payment
paid
cancelled
refunded
partially_refunded
```

## 23.2 Order Item

```text
order_items
- id
- order_id
- product_id
- quantity
- unit_price
- total_price
- metadata nullable
```

---

# 24. Payments

## 24.1 Payment

```text
payments
- id
- order_id
- payment_provider
- provider_transaction_id
- amount
- currency
- status
- paid_at nullable
- created_at
```

Suggested statuses:

```text
pending
authorized
paid
failed
refunded
partially_refunded
```

Avoid coupling membership activation directly to one payment provider.

Payment success should trigger fulfillment logic.

---

# 25. Fulfillment Logic

After payment:

```text
Order Paid
   ↓
Inspect Product Type
   ↓
Create / Extend:
- Membership
- Pass
- Class Pack
- PT Package
- Single Session Entitlement
   ↓
Grant Entitlements
```

This should be handled centrally rather than by frontend code.

---

# 26. Promotions

## 26.1 Promotion

```text
promotions
- id
- code nullable
- name
- discount_type
- discount_value
- starts_at
- ends_at
- usage_limit nullable
- active
```

Future targeting can support:

- new members
- tourists
- specific products
- certain dates
- first purchase

---

# 27. Secure Check-In & Access

The secure check-in feature should reference the same membership/pass/entitlement system.

## 27.1 Check-In

```text
checkins
- id
- member_id nullable
- dependant_id nullable
- facility_id
- checked_in_at
- checked_out_at nullable
- method
- validation_result
- source_device_id nullable
```

Methods may include:

```text
qr
staff
nfc
manual
```

## 27.2 Access Validation

Conceptually:

```text
Scan QR
  ↓
Resolve Member
  ↓
Check active membership/pass
  ↓
Check required entitlement
  ↓
Check validity dates
  ↓
Allow / deny
  ↓
Create check-in event
```

This logic should not be duplicated separately from membership access logic.

---

# 28. QR Tokens

If QR-based access is used:

```text
access_tokens
- id
- member_id
- token_hash
- issued_at
- expires_at
- revoked_at nullable
- token_type
```

Prefer short-lived or rotating tokens where appropriate.

Do not expose raw persistent member identifiers as the QR payload.

---

# 29. Class Attendance

Class attendance should reference booking/session occurrence.

## 29.1 Attendance

```text
class_attendance
- id
- occurrence_key
- member_id nullable
- dependant_id nullable
- class_booking_id nullable
- checked_in_at
- status
```

Suggested statuses:

```text
attended
late
no_show
manual
```

---

# 30. Notifications

Notifications should be event-driven rather than hard-coded into individual screens.

## 30.1 Notification Preference

```text
notification_preferences
- id
- member_id
- channel
- notification_type
- enabled
```

Channels:

```text
push
email
sms
whatsapp
```

Actual supported channels can be phased.

## 30.2 Notification Events

Possible events:

```text
class_reminder
class_cancelled
class_rescheduled
trainer_changed
booking_confirmed
waitlist_promoted
membership_expiring
membership_expired
payment_receipt
pt_booking_reminder
```

## 30.3 Notification Delivery Log

```text
notification_deliveries
- id
- member_id
- notification_type
- channel
- destination
- status
- sent_at nullable
- failed_at nullable
```

---

# 31. Content & Fitness Resources

Content should live in a reusable shared CMS domain.

## 31.1 Content Item

```text
content_items
- id
- content_type
- title
- slug
- excerpt
- body
- status
- published_at nullable
- author_id nullable
- image_url nullable
```

Content types:

```text
blog
fitness_tip
workout_guide
news
```

## 31.2 Content Relationships

```text
content_relations
- id
- content_item_id
- related_entity_type
- related_entity_id
```

This allows content to relate to:

- class
- trainer
- membership product
- facility
- workout category

Example:

A spinning workout guide can automatically appear on the Spinning class page.

---

# 32. Trainer / Class / Content Relationship

Conceptually:

```text
Trainer
   ├── teaches → Classes
   ├── appears in → Schedule Sessions
   ├── offers → PT Services
   └── relates to → Content

Class
   ├── appears in → Schedule
   ├── taught by → Trainers
   ├── requires → Access Rules
   └── relates to → Content
```

---

# 33. Admin Roles & Permissions

Do not give all staff full system access.

## 33.1 Admin Role

```text
admin_roles
- id
- name
```

Possible roles:

```text
super_admin
manager
reception
schedule_manager
trainer_manager
content_editor
finance
```

## 33.2 Permission

```text
permissions
- id
- code
- description
```

Examples:

```text
schedule.read
schedule.write
schedule.publish
members.read
members.write
payments.read
trainers.write
content.publish
checkin.override
```

## 33.3 Role Permission

```text
role_permissions
- role_id
- permission_id
```

---

# 34. Audit Log

Critical administrative changes should be auditable.

```text
audit_log
- id
- actor_user_id
- action
- entity_type
- entity_id
- before_data nullable
- after_data nullable
- created_at
```

Examples:

- schedule changed
- class cancelled
- membership manually extended
- payment refunded
- access override granted

---

# 35. Publishing State

Where content/schedules require preparation before going live, use state rather than duplicating data.

Possible states:

```text
draft
scheduled
published
archived
```

For recurring schedules, publishing may be applied to:

- upcoming changes
- one-off sessions
- public visibility

depending on the implementation.

---

# 36. Schedule Admin UX Logic

The backend should reflect how the gym actually works.

Because ~90% of the schedule repeats:

The normal admin workflow should be:

```text
Open Month
   ↓
Recurring Schedule Already Present
   ↓
Review Exceptions / Changes
   ↓
Edit Only Differences
   ↓
Preview
   ↓
Publish if required
```

Do not require the team to recreate every session monthly.

---

# 37. Schedule Edit Scope

When editing a recurring occurrence, support:

```text
This occurrence only
This and future occurrences
```

Examples:

- trainer absent this Wednesday → this occurrence only
- class permanently moves to a new time → this and future

This should be explicit to reduce accidental schedule corruption.

---

# 38. Website Consumption

The public website should consume shared backend data for:

- class schedule
- trainer pages
- class pages
- membership products
- passes
- content
- public offers

The website should prioritize discovery and marketing.

It should not own core business rules.

---

# 39. Member App Consumption

The member app should use the same backend entities for:

- membership status
- passes
- schedule
- class booking
- PT booking
- reminders
- check-in
- attendance
- purchases
- dependants
- notifications

The member app should not maintain separate copies of schedule or trainer data.

---

# 40. Admin Consumption

The admin interface should support:

- member management
- schedule management
- trainer management
- booking management
- check-ins
- products/pricing
- payments
- content
- notifications
- permissions

Admin UI complexity should be progressively disclosed.

Routine tasks should require the fewest possible fields.

---

# 41. API / Service Boundaries

Recommended logical service boundaries:

```text
Identity Service
Member Service
Membership Service
Entitlement Service
Schedule Service
Booking Service
Trainer Service
Commerce Service
Payment Service
Access Service
Notification Service
Content Service
Admin/Audit Service
```

This does not require a microservice architecture.

These can initially live inside one application/backend while maintaining clean code/domain boundaries.

---

# 42. Recommended Architectural Style

Prefer a **modular monolith** initially unless scale or operational requirements justify microservices.

Reasons:

- simpler deployment
- easier transactions
- lower operational complexity
- faster development
- shared relational data model
- still allows clean domain separation

Design modules so they can later be extracted if needed.

---

# 43. Database Strategy

A relational database is the natural fit because the system contains:

- members
- memberships
- schedules
- bookings
- orders
- payments
- trainers
- relationships
- historical data

Recommended principles:

- foreign keys
- explicit indexes
- soft-delete only where needed
- effective-date versioning
- audit trail for critical actions
- UTC timestamps internally
- display in local Hurghada timezone
- normalized core entities
- JSON only for non-critical flexible metadata

---

# 44. Timezone

All operational schedule logic should use the gym's local timezone.

Canonical business timezone:

```text
Africa/Cairo
```

Store timestamps in UTC where appropriate.

Schedule recurrence should be interpreted in the gym timezone before generating occurrences.

Do not rely on the browser timezone for canonical session times.

---

# 45. IDs and Slugs

Use internal immutable IDs for relationships.

Use slugs for public URLs.

Example:

```text
class_id = UUID
slug = spinning
```

Do not use mutable display names as foreign keys.

---

# 46. Historical Integrity

Never rewrite historical facts when future rules change.

Examples:

- membership plan price changes
- class time changes
- trainer replacement
- access rule changes

Historical records should preserve what was true at the time.

Use:

- effective dates
- versioning
- immutable transaction records
- snapshots where appropriate

---

# 47. Data Ownership Rules

Canonical ownership should be clear.

Examples:

```text
Trainer profile → Trainer domain
Class definition → Classes domain
Recurring schedule → Schedule domain
Member entitlement → Entitlement domain
Payment result → Payment domain
Booking → Booking domain
Attendance → Access/Attendance domain
```

Avoid one feature silently owning another domain’s data.

---

# 48. Avoid These Anti-Patterns

Do not:

- recreate the schedule every month
- store class sessions as plain text blobs
- use colors as database categories
- duplicate trainer records across features
- duplicate website/app schedule data
- hard-code entitlement checks inside frontend components
- overwrite past schedule data
- tie membership logic directly to one payment gateway
- use product names as business-rule identifiers
- invent trainer data when unknown
- create separate member records for every app feature

---

# 49. Suggested Entity Relationship Map

```text
USER_ACCOUNT
   │
   ├── MEMBER
   │     ├── DEPENDANTS
   │     ├── MEMBERSHIPS
   │     │      └── MEMBERSHIP_PLAN
   │     │              └── PRODUCT
   │     │
   │     ├── MEMBER_PASSES
   │     │      └── PRODUCT
   │     │
   │     ├── ORDERS
   │     │      ├── ORDER_ITEMS
   │     │      │      └── PRODUCT
   │     │      └── PAYMENTS
   │     │
   │     ├── CLASS_BOOKINGS
   │     │      └── RESOLVED_SESSION
   │     │              ├── CLASS
   │     │              ├── TRAINER
   │     │              ├── STUDIO
   │     │              └── ACCESS RULES
   │     │
   │     ├── PT_BOOKINGS
   │     │      └── TRAINER
   │     │
   │     ├── CHECKINS
   │     └── NOTIFICATION_PREFERENCES
   │
   ├── TRAINER
   │     ├── SPECIALTIES
   │     ├── PT_SERVICES
   │     ├── AVAILABILITY
   │     └── RECURRING_SESSIONS
   │
   └── STAFF / ADMIN ROLE
```

---

# 50. Schedule Relationship Map

```text
CLASS
  │
  ├── default studio
  ├── default duration
  └── public content
       │
       ↓
RECURRING_SESSION
  ├── TRAINER
  ├── STUDIO
  ├── ACCESS LABEL / RULE
  ├── recurrence
  └── effective dates
       │
       ├── SCHEDULE_OVERRIDE
       │
       └── generated occurrence
              │
              ↓
       RESOLVED_SESSION
              │
              ├── CLASS_BOOKING
              ├── WAITLIST
              ├── ATTENDANCE
              └── NOTIFICATION
```

---

# 51. Commerce Relationship Map

```text
PRODUCT
   ├── PRICE
   ├── ENTITLEMENTS
   └── PRODUCT TYPE
          │
          ↓
ORDER
   ├── ORDER ITEM
   └── PAYMENT
          │
          ↓
FULFILLMENT
   ├── MEMBERSHIP
   ├── PASS
   ├── CLASS PACK
   ├── PT PACKAGE
   └── ENTITLEMENT
```

---

# 52. Access Decision Logic

Conceptually:

```text
Request Access / Booking
        ↓
Identify participant
        ↓
Resolve active products
        ↓
Resolve entitlements
        ↓
Evaluate:
- date validity
- age rule
- gender rule
- access entitlement
- capacity
- booking status
        ↓
ALLOW / DENY
```

Keep this rule engine centralized.

---

# 53. Future Loyalty / Rewards

Do not implement now unless required, but reserve clean relationships.

Possible future entities:

```text
loyalty_accounts
loyalty_transactions
reward_rules
rewards
referrals
```

These should reference:

- member
- order
- attendance
- booking

rather than introducing a new customer identity model.

---

# 54. Future Corporate Memberships

Potential future support:

```text
organizations
organization_memberships
corporate_plans
```

Keep this separate from member identity.

A member may be linked to an organization while still using the normal membership/entitlement model.

---

# 55. Future Guest / Tourist Flow

Hurghada has a large tourist market.

The architecture should support purchases by users who are not yet full members.

Possible flow:

```text
Guest
  ↓
Purchase Day Pass
  ↓
Create lightweight member/customer record
  ↓
Issue entitlement
  ↓
Activate app/account optionally
```

Avoid requiring a full monthly-member onboarding process for a one-day visitor.

---

# 56. Future Hotel / Partner Integration

Potential partner relationships may include:

```text
partners
partner_offers
partner_codes
partner_passes
```

Examples:

- hotels
- resorts
- tour operators
- corporate partners

Partner products should still resolve through the same product/entitlement system.

---

# 57. Analytics Events

The backend should expose meaningful business events.

Examples:

```text
member_created
membership_started
membership_renewed
pass_purchased
class_viewed
class_booked
class_cancelled
class_attended
pt_booked
checkin_success
payment_completed
payment_failed
```

Keep analytics events distinct from core transactional records.

---

# 58. Data Privacy

Only store personal data necessary for operational purposes.

Sensitive information should:

- have clear access controls
- be encrypted where appropriate
- not be exposed in public APIs
- not be included in logs unnecessarily
- follow retention policies

Public trainer data and private staff/member data should be clearly separated.

---

# 59. Implementation Phasing

The architecture should be planned fully, but implementation can be phased.

## Phase 1 — Shared Foundation

- identity
- members
- trainers
- classes
- studios
- recurring schedule
- schedule overrides
- one-off sessions
- admin permissions
- audit logging

## Phase 2 — Membership Commerce

- products
- pricing
- memberships
- passes
- orders
- payments
- entitlements

## Phase 3 — Member App Core

- member account
- membership display
- live schedule
- passes
- notifications foundation

## Phase 4 — Bookings

- class bookings
- capacity
- waitlists
- dependant booking
- PT booking

## Phase 5 — Access & Attendance

- QR check-in
- access validation
- attendance
- class check-in

## Phase 6 — Engagement

- reminders
- content personalization
- offers
- loyalty
- referrals

The data model should support later phases even if their UI is not yet implemented.

---

# 60. Governing Rule for Feature Briefs

Feature specifications such as:

- Group Class Schedule Upgrade
- Secure Check-In Feature Plan
- Membership & Pass Sales
- Trainer Portal
- PT Booking
- Member App
- Notifications

should be treated as **child specifications** of this Backend Architecture & Domain Model.

A child feature may add detail, but it should not introduce a conflicting duplicate data model without an explicit architectural decision.

---

# 61. Group Class Schedule Specific Rule

The Group Class Schedule Upgrade must use this shared architecture.

In particular:

- recurring schedule logic belongs in the shared backend
- website and member app consume the same resolved schedule
- `Floor` is a Studio / Location value
- `Pre-Paid`, `Ladies Only`, and `Kids` are Members & Access presentation classifications
- underlying access rules may use entitlement, age, gender, or payment logic
- real trainer data must be used
- `Diann` must normalize to `Diana`
- unknown trainers remain unassigned
- historical schedule accuracy must be preserved

---

# 62. Source of Truth

For any implementation task:

1. inspect existing production architecture first
2. map current entities to this model
3. reuse existing entities where suitable
4. migrate incrementally
5. avoid unnecessary rewrites
6. preserve production data
7. document deviations from this architecture

This document defines the target domain model, not an instruction to destroy working systems and rebuild them wholesale.

---

# 63. Final Architecture Principle

The system should be designed so that:

```text
One Member
One Trainer
One Class
One Product
One Schedule Engine
One Entitlement Model
One Booking Model
One Payment Model
One Access Model
```

can serve every relevant surface.

The public website, member app, and admin experience should differ in presentation and permissions, but they should share the same canonical backend relationships and business logic.

---

# 64. 2026-09 Architecture Validation Addendum

This section records the cross-cutting controls that apply across all backend domains. It supplements the domain model without changing the approved shared-backend, modular-monolith, recurring-schedule, entitlement, or historical-integrity decisions.

## 64.1 Application architecture and API contracts

The recommended implementation remains a **modular monolith** unless measured scale or operational isolation later justifies extraction.

Maintain explicit module boundaries and service contracts for Identity, Members, Memberships/Entitlements, Scheduling, Bookings, Commerce/Payments, Check-In, Notifications, Content, and Admin/Audit.

Do not introduce GraphQL, microservices, queues, or additional infrastructure merely because they are fashionable. Choose REST, GraphQL, RPC, or asynchronous messaging according to the actual client and operational need. Public and mobile contracts should be documented and backward-compatible where practical.

For mobile/app-facing APIs, use versioned or otherwise compatibility-managed contracts so a backend deployment does not unexpectedly break an installed client.

## 64.2 Idempotency and duplicate protection

Commands that can create financial, access, booking, or entitlement side effects must be safely retryable.

Examples include:

- checkout/session creation;
- payment fulfillment;
- membership activation or renewal;
- pass issuance;
- booking creation/cancellation;
- waitlist promotion;
- QR/check-in recording;
- admin manual grants.

Use an idempotency key or equivalent unique operation key and enforce appropriate database uniqueness constraints. A repeated webhook or client retry must not create a second membership, pass, booking, order fulfillment, or check-in unintentionally.

## 64.3 Payment event processing and reconciliation

Payment success must be established from the payment provider's verified server-side event/webhook or equivalent authoritative provider state, not only from a browser redirect.

Payment processing should support:

- verified webhook signatures;
- idempotent event handling;
- provider event/transaction IDs;
- retry-safe fulfillment;
- failed and delayed payment states;
- refunds and partial refunds where supported;
- reconciliation between orders, payments and granted entitlements;
- an operational queue/report for unresolved mismatches.

Never store raw card numbers or security codes in the Gold's Gym Hurghada backend.

## 64.4 Concurrency and capacity integrity

Capacity-limited operations must be enforced transactionally at the backend.

For class booking, waitlist promotion, limited passes, or other scarce inventory, the system must prevent two simultaneous requests from consuming the same final place.

Use database transactions, row/version locking, atomic counters, uniqueness constraints, or equivalent concurrency controls appropriate to the chosen database.

Frontend availability is advisory; the backend is authoritative.

## 64.5 Stable occurrence identity

A resolved class occurrence needs a stable identity so bookings, attendance, notifications and audit records continue to reference the correct occurrence even when schedule rules are edited later.

The implementation may use a persisted occurrence record, deterministic occurrence key, or another durable method, but it must support:

- one booking target per actual occurrence;
- cancellation/reschedule history;
- historical reporting;
- attendance linkage;
- notification linkage;
- no accidental reassignment when recurrence rules change.

## 64.6 Domain events and side effects

Important state changes should emit explicit application/domain events internally, for example:

```text
MembershipActivated
PassIssued
PaymentSucceeded
ClassOccurrenceCancelled
BookingConfirmed
WaitlistPromoted
CheckInAccepted
CheckInDenied
```

The first implementation does not require a distributed event bus. Events may be handled inside the modular monolith. Where side effects must survive process failure, use a durable job/outbox approach or equivalent retry-safe mechanism.

## 64.7 Observability and operations

Production-critical flows should expose enough telemetry to diagnose failures without logging unnecessary personal data.

At minimum maintain:

- structured application logs;
- correlation/request IDs;
- error monitoring;
- payment/webhook processing status;
- schedule-resolution failures;
- booking/capacity conflicts;
- check-in allow/deny counts and reasons;
- notification delivery failures;
- admin audit events;
- basic service health metrics.

Define alerts for conditions that require staff action rather than relying on users to discover failures first.

## 64.8 Backup, restore and disaster recovery

The production database and critical media/configuration require automated backups.

Before launch, define and test:

- backup frequency;
- retention period;
- restore procedure;
- recovery point objective (RPO);
- recovery time objective (RTO);
- responsible owner;
- recovery test cadence.

A backup that has never been restored in a test should not be treated as proven recovery capability.

## 64.9 Privacy, retention and deletion

Personal data must have a documented business purpose and retention rule.

Define retention separately for at least:

- prospect/lead data;
- member account/profile data;
- membership contracts/transactions;
- check-in/access logs;
- attendance;
- payment metadata;
- audit logs;
- notification logs;
- dependants/minors.

Deletion/anonymization must preserve legally or financially necessary records where required while removing data that no longer has a valid purpose.

Do not put sensitive personal data into analytics parameters, URLs, QR payloads, or general-purpose logs.

## 64.10 Security baseline

Every API request that accesses member/staff objects must enforce authorization at both function/action and object level.

Required baseline controls include:

- least-privilege RBAC;
- strong authentication for staff/admin;
- MFA/passkeys where appropriate for privileged accounts;
- server-side authorization on every protected operation;
- input validation;
- rate limiting for abuse-sensitive endpoints;
- secret management outside source code;
- TLS in transit;
- secure session/token storage;
- dependency and vulnerability management;
- audit trails for privileged actions.

Public read APIs should expose only the fields intentionally designated public.

## 64.11 Caching and freshness

Cache stable public data where useful, but business decisions must use authoritative current state.

Examples:

- public trainer/class content may be cached aggressively;
- resolved public schedule views may use short-lived cache with explicit invalidation on schedule changes;
- membership eligibility, booking capacity, payment state and check-in authorization must not rely on stale public cache.

## 64.12 Feature flags and rollout safety

For high-impact features, support controlled rollout where practical:

- new schedule resolver;
- online payments;
- class booking;
- QR check-in;
- waitlists;
- new entitlement rules.

A feature flag is not required for every UI change, but it is useful for capabilities where rollback or staged staff testing materially reduces operational risk.

## 64.13 Ownership and documentation rule

Every domain needs a named operational owner and technical owner once the system enters production.

Each child feature specification must state:

- canonical entities it uses;
- domain owner;
- permissions involved;
- events/side effects;
- failure/retry behavior;
- audit requirements;
- analytics requirements;
- privacy/retention implications.

These additions are architectural guardrails, not a requirement to build all future functionality in the first release.

## 64.14 Release-scope discipline

The target domain model is broader than the first production release.

For every implementation task, classify each capability as:

```text
REQUIRED NOW
DEPENDENCY NOW
FUTURE-READY ONLY
```

Only `REQUIRED NOW` and genuine `DEPENDENCY NOW` capabilities should enter the active implementation scope.

`FUTURE-READY ONLY` means:

- preserve entity boundaries;
- reserve compatible relationships where useful;
- avoid contradictory schema decisions;
- document the future dependency;

but do not create unnecessary tables, jobs, integrations, UI, background workers or infrastructure until there is a confirmed use case.

Website go-live speed and production reliability take precedence over speculative feature completeness, while canonical data ownership and future compatibility must still be preserved.

