# Gold's Gym Hurghada — Group Class Schedule Upgrade

**Status:** Launch-scope feature specification  
**Version:** 1.1  
**Date:** 2026-09-26  
**Parent:** Gold’s Gym Hurghada — Backend Architecture & Domain Model


## Delivery priority

This is a **website-launch feature**.

The public class schedule and the admin/backend capabilities required to maintain it are `REQUIRED NOW`.

Future member-specific functionality such as booking, waitlists, reminders and attendance is `FUTURE-READY ONLY` unless explicitly promoted into the active delivery milestone.

Use the shared canonical trainer, class, studio, schedule and entitlement relationships. Do not create a temporary website-only schedule model.

---

## Objective

Upgrade the existing Group Class Schedule feature on the Gold's Gym Hurghada website and admin/backend.

The existing public schedule UI and overall experience are already good and should be preserved.

A reference image will be supplied showing the intended refinements.

This is **not** a request to rebuild or significantly redesign the current schedule page.

The main objectives are:

1. Add clear Studio/Location filtering.
2. Add clear Members & Access filtering.
3. Display these classifications cleanly on schedule cards.
4. Make schedule administration extremely simple.
5. Exploit the fact that approximately 90% of the schedule remains unchanged month-to-month.
6. Avoid rebuilding or duplicating an entire schedule every month.
7. Preserve the existing Gold's Gym visual system and responsive behavior.

---

## 1. First inspect the existing implementation

Before making changes:

- inspect the existing schedule frontend
- inspect the existing admin/backend schedule management
- inspect the database/schema
- inspect existing trainer/class entities
- inspect how recurring schedules are currently represented
- inspect how current filters work
- inspect mobile and desktop schedule rendering

Reuse existing architecture/components where sensible.

Do not create parallel systems if the required capability can be cleanly added to the existing implementation.

Do not delete or rewrite working functionality unnecessarily.

---

## 2. Public taxonomy

We need **two separate classification dimensions**.

### A. Studio / Location

Values:

- Aerobics Studio
- Spinning Studio
- Martial Arts Studio
- Floor

Important:

`Floor` belongs here.

It means the class takes place on the main gym floor rather than inside one of the studios.

Do **not** classify Floor under access/member restrictions.

### B. Members & Access

Values:

- All
- Pre-Paid
- Ladies Only
- Kids

Important:

These describe who can participate and/or the access requirement.

They are independent from the Studio/Location.

Examples:

- Spinning Studio + Ladies Only
- Martial Arts Studio + Kids
- Aerobics Studio + Pre-Paid
- Floor + All
- Martial Arts Studio + Pre-Paid

Do not collapse these into one generic category field.

---

## 3. Frontend filters

Keep the existing schedule UX and layout.

Above the timetable we should have the following filter groups:

### View

- Week
- Day

Preserve the existing behavior where applicable.

### Studio

- All
- Aerobics
- Spinning
- Martial Arts
- Floor

### Members & Access

- All
- Pre-Paid
- Ladies Only
- Kids

The supplied reference image illustrates the intended information hierarchy.

Do not treat the reference image as a pixel-perfect redesign requirement.

Use the existing live website components, spacing, typography, responsive system and Gold's Gym brand styles.

---

## 4. Filtering logic

Studio and Members & Access are independent filter dimensions.

Example:

- Studio = Spinning
- Members & Access = Ladies Only

should return only sessions satisfying **both** conditions.

Use AND logic between filter groups.

Selecting `All` within a filter group clears that group's restriction.

Where appropriate, preserve filter state in the URL, for example:

`/classes?view=week&studio=spinning&access=ladies-only`

Do this only if it fits cleanly with the current routing architecture.

Browser back/forward navigation should continue working correctly.

---

## 5. Schedule cards

Preserve the existing class-card visual style.

Each session should be able to communicate:

- start time
- class name
- trainer
- duration
- level, if available
- Studio / Location
- Members & Access badge, when applicable

Example:

```text
19:00

SPINNING

Hamees
45 min

Spinning Studio     LADIES ONLY
```

The Studio should be a subtle structural/location indicator.

Members & Access should use a clearer badge treatment.

Do not rely on color alone to communicate meaning.

Explicit text labels must remain visible.

---

## 6. Important schedule architecture

Approximately **90% of the Gold's Gym Hurghada schedule stays the same every month**.

Therefore:

- Do **not** model each month as a completely separate schedule requiring staff to recreate all sessions.
- Do **not** make monthly duplication the primary data model.

Instead implement the schedule around:

1. recurring/base weekly sessions
2. date-specific/month-specific overrides
3. one-off sessions

Conceptually:

```text
Recurring weekly schedule
+
date/month overrides
+
one-off sessions
=
resolved schedule displayed to the visitor
```

A month should essentially be a **view of the schedule** rather than a completely independent dataset.

---

## 7. Recurring/base sessions

A recurring session should represent the normal weekly class.

Suggested conceptual structure:

```text
recurring_sessions
- id
- class_id
- trainer_id
- studio_id
- access_type_id
- day_of_week
- start_time
- duration_minutes
- active_from
- active_until
- status
```

Adapt this to the existing schema rather than blindly creating these exact tables.

Example:

```text
Spinning
Trainer: Hamees
Studio: Spinning Studio
Access: Ladies Only
Wednesday
19:00
active_from: 2026-09-01
active_until: null
```

This session should automatically appear every applicable Wednesday until changed.

---

## 8. Overrides / exceptions

Staff need to be able to modify a single occurrence without changing the recurring schedule.

Examples:

- class cancelled on one date
- trainer replacement
- different start time
- different studio
- different access rule

Suggested conceptual structure:

```text
schedule_overrides
- id
- recurring_session_id
- effective_date
- change_type
- replacement_trainer_id
- replacement_start_time
- replacement_studio_id
- replacement_access_type_id
- notes
```

Again: adapt this to the existing architecture.

The UI should distinguish clearly between:

- This date only
- This and future sessions

Example:

If Wednesday Spinning is cancelled only on 14 October, create an exception.

If Wednesday Spinning permanently changes from 19:00 to 19:30 starting November, version/end the old recurring schedule and create/update the future recurring rule appropriately.

Historical schedules must remain accurate.

---

## 9. One-off sessions

Support sessions which are not part of the recurring schedule.

Example use cases:

- special event
- temporary workshop
- additional holiday class
- promotional class

These should have a real date instead of a weekly recurrence rule.

---

## 10. Backend / Admin UX

The admin experience is extremely important.

It needs to be understandable by gym staff without technical knowledge.

The normal workflow should **not** be:

> Create October schedule from scratch.

Instead:

1. Open October.
2. Existing recurring schedule is already there automatically.
3. See only what needs changing.
4. Add/edit exceptions.
5. Preview.
6. Publish if a publishing workflow is required.

The backend should make the 90% unchanged schedule effectively **zero work**.

---

## 11. Admin schedule screen

Reuse the current admin UI where appropriate.

Ideal primary view:

**Weekly schedule grid**

Actions should include:

- Add Session
- Edit
- Duplicate Session
- Cancel / remove occurrence
- Change Trainer
- Change Time
- Change Studio
- Change Members & Access
- Preview

When editing a recurring session, ask:

**Apply to:**

- This occurrence only
- This and future occurrences

Avoid asking this when it is unnecessary.

---

## 12. Fast session creation

Creating a session should require minimal input.

```text
Class:
[select]

Trainer:
[select]

Studio:
[select]

Members & Access:
[select]

Day:
[select]

Time:
[time]

Duration:
[duration]
```

Where sensible, classes can have defaults such as:

- default duration
- default studio
- default access classification

But allow the schedule session to override those defaults.

Do not force staff to repeatedly enter identical information.

---

## 13. Preview

The admin should have an easy:

**Preview Website**

action.

It should display as close as possible to the real public schedule.

If the project already has preview infrastructure, reuse it.

Do not build a second rendering implementation simply for preview.

---

## 14. Historical integrity

Do not overwrite historical schedule information when recurring schedules change.

Example:

If Spinning was at 19:00 during September/October and changes to 19:30 from November:

September and October must continue showing 19:00 if historical dates are viewed.

Use effective dates/versioning or an equivalent clean implementation.

---

## 15. Trainer data

Use existing trainer records if already present.

The instructor names extracted from the current schedule source include:

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

Important correction:

Any source value `Diann` should be normalized to:

**Diana**

Do **not** create both Diana and Diann.

Some schedule sessions in the source do not specify a trainer.

Those should support:

`trainer_id = null`

Do not invent trainer names.

Before inserting trainer records, check whether they already exist to avoid duplicates.

---

## 16. Existing schedule content

Do not replace real schedule data with placeholder/mock instructor or class names.

Use the actual CMS/database values.

If data needs migration from the supplied source schedule, preserve the source values accurately.

Do not use names such as Ahmed Mohamed, Omar Khalil, etc. unless they actually exist in our database/source data.

---

## 17. Data model principles

Keep these concepts independent:

- Class
- Trainer
- Studio
- Members & Access
- Recurring Session
- Schedule Override
- One-Off Session

Do not store a whole schedule entry as unstructured text.

Do not use visual color names as database values.

Bad:

`category = "pink"`

Good:

`access_type = "ladies_only"`

Colors belong to presentation.

---

## 18. Suggested normalized values

Studio/location slugs:

```text
aerobics
spinning
martial_arts
floor
```

Members/access slugs:

```text
all
prepaid
ladies_only
kids
```

Use project naming conventions if there is already an established enum/slug standard.

---

## 19. Frontend responsiveness

The current website experience is already approved.

Preserve:

- desktop weekly grid
- mobile usability
- existing typography
- existing Gold's Gym visual hierarchy
- dark UI
- yellow brand emphasis

Do not make the mobile schedule into a compressed desktop table if the existing site already handles this better.

Filters need to remain easy to scan and use on mobile.

---

## 20. Marketing usability

The public schedule is part of the marketing website, not merely an internal timetable.

A visitor should be able to understand within seconds:

- what classes are available
- when they happen
- where they happen
- who teaches them
- whether the class is Ladies Only
- whether it is for Kids
- whether it requires Pre-Paid access

Avoid clutter.

Do not add backend concepts such as recurrence or override terminology to the public interface.

---

## 21. Implementation approach

### Phase 1 — Audit

Inspect the existing implementation and report:

- relevant files/components
- current schedule schema
- current admin implementation
- current frontend filter implementation
- whether any recurrence system already exists
- migrations required
- risks to existing schedule data

### Phase 2 — Engineering plan

Propose the smallest clean set of changes required.

Prefer extending existing architecture over replacing it.

Explain specifically how existing schedule records will be migrated safely.

### Phase 3 — Implement backend/data model

Implement:

- Studio/Location classification
- Members & Access classification
- recurring schedule support
- overrides/exceptions
- one-off sessions as necessary
- historical integrity
- validation

### Phase 4 — Admin UX

Implement the low-friction schedule maintenance workflow.

### Phase 5 — Frontend

Add:

- Studio filters
- Members & Access filters
- appropriate card labels
- combined filtering
- URL state if appropriate

Preserve the approved schedule experience.

### Phase 6 — QA

Test:

- desktop
- mobile
- current month
- next month
- historical month
- recurring classes
- date-only cancellation
- trainer replacement
- permanent future time change
- Floor filtering
- Ladies Only filtering
- Kids filtering
- Pre-Paid filtering
- combined Studio + Access filtering
- classes without trainers
- no duplicate Diana/Diann trainer
- no regression to existing classes/schedule

---

## 22. Acceptance criteria

The implementation is complete when:

1. Existing public schedule experience remains recognizably the same.
2. Studio filters exist:
   - All
   - Aerobics
   - Spinning
   - Martial Arts
   - Floor
3. Members & Access filters exist:
   - All
   - Pre-Paid
   - Ladies Only
   - Kids
4. Studio and Members & Access can be combined.
5. Floor is treated as a location, not an access category.
6. Recurring weekly sessions automatically continue into future months.
7. Staff do not recreate 90% of the schedule every month.
8. A single occurrence can be changed without modifying the base schedule.
9. Permanent future changes can be made without corrupting historical schedules.
10. One-off sessions are supported.
11. Trainer names come from real records/source data.
12. Diann is normalized to Diana.
13. Sessions without a known trainer remain unassigned rather than receiving invented data.
14. Admin changes are easy to preview.
15. The implementation remains responsive and consistent with the existing Gold's Gym UI.
16. Existing schedule data is migrated safely with no avoidable data loss.

---

## Important

The supplied reference image is primarily a UX/information-architecture reference.

Do **not** blindly reproduce generated sample content from the image.

Do **not** use fake class data or trainer names from the reference image.

The live site and existing database are the source of truth for actual content.

Preserve the existing design wherever possible and implement the taxonomy, recurring-schedule logic, backend usability and filter improvements cleanly within it.

---

## 22. Architecture validation additions — September 2026

These additions align the schedule feature with the master Backend Architecture & Domain Model without redesigning the approved public UI.

### Shared-domain rule

This feature is a child specification of the shared Classes & Scheduling domain. The website, member app and admin must consume the same canonical class, trainer, studio and schedule data.

Do not introduce website-only recurrence or trainer records.

### Access classification versus enforcement

Keep the public **Members & Access** filter exactly as approved:

- All
- Pre-Paid
- Ladies Only
- Kids

However, do not force those labels into one mutually exclusive backend rule field.

A session may require more than one independent condition. The backend may therefore resolve presentation labels from underlying rules such as:

```text
audience_rule
age_rule
gender_rule
entitlement_rule
payment_rule
```

Example: a Kids Kick Boxing session can be a kids/audience session and also require pre-payment.

The frontend remains simple while the backend preserves correct eligibility logic.

### Stable occurrence identity

Every actual dated class occurrence must have a stable identifier/key before bookings, attendance or notifications reference it.

Changing a recurrence rule later must not cause historical bookings or attendance to point at a different occurrence.

### Capacity and booking concurrency

If booking/capacity is enabled now or later, capacity must be enforced by the backend transactionally.

The displayed `slots_available` value is not authoritative by itself. Two simultaneous booking requests must not be able to claim the same final space.

### Cache and invalidation

The public resolved schedule may be cached because most sessions are stable.

Any cache must be invalidated or refreshed when:

- a recurring rule changes;
- an override is created/changed;
- a one-off session changes;
- a trainer/studio assignment affecting display changes;
- a cancellation or reschedule is published.

Member eligibility and booking capacity must be resolved from current authoritative state rather than a stale public schedule cache.

### Accessibility

Filters and schedule interactions must remain keyboard operable, have accessible labels/states, and not rely on color alone.

On small screens, prefer a readable day/list representation over forcing a desktop weekly grid into an unusable horizontal layout.

### SEO boundary

The schedule page should expose current schedule facts as crawlable text/HTML where practical, but routine recurring gym classes should not automatically generate one indexable URL per occurrence.

Filter/calendar parameters must not create uncontrolled indexable URL inventories.

Routine classes should not automatically be marked up as public `Event` rich-result targets merely for SEO. Genuine public event-style classes/workshops may be assessed separately under the SEO & AIO Strategy.

### Operational QA additions

Before migration/launch, verify:

- at least two historical periods render identically before and after migration;
- recurrence boundaries across month/year changes;
- cancellation and reschedule precedence;
- daylight-saving/timezone behavior using `Africa/Cairo`;
- null/unassigned trainer handling;
- overlapping labels/rules such as Kids + Pre-Paid;
- filter state/back-button behavior;
- cache invalidation;
- no duplicate occurrence generation;
- no booking/attendance reference breakage after recurring-rule edits.
