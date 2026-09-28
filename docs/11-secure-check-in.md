# Gold’s Gym Hurghada — Secure Member Check-In Feature Plan

**Status:** Validated feature specification  
**Version:** 1.1  
**Date:** 2026-09-26  
**Parent:** Gold’s Gym Hurghada — Backend Architecture & Domain Model

## Delivery priority

Secure check-in is currently **`FUTURE-READY ONLY`** for the website-first launch unless it is explicitly promoted into an active milestone.

The current release should preserve the canonical member, membership, pass, entitlement, identity and audit relationships needed by this feature, but should not build check-in devices, QR rotation, attendance UI, turnstile integrations or reception workflows solely for future use.

If check-in becomes active scope, implement it against the existing shared backend rather than introducing a separate access-control data model.

---

## Purpose

Create one secure reception check-in platform that validates current member/pass entitlements and records access through approved staff devices.

Supported input methods can include:

- mobile/tablet camera QR scanning;
- reception PC + USB HID QR/2D scanner;
- authorized manual lookup;
- future turnstile, NFC or RFID integrations.

All methods must use the same backend Access & Check-In domain and entitlement resolver.

---

## 1. Governing architecture

```text
Member Credential
      ↓
Authorized Staff Device
      ↓
Authenticated Staff Session
      ↓
Check-In Service
      ↓
Identity + Entitlement Validation
      ↓
Access Decision
      ↓
Check-In / Denial Audit Record
```

The check-in feature must not maintain a separate copy of memberships, passes or access rules.

The shared backend remains authoritative.

---

## 2. Security model

Every check-in request should require all applicable controls:

```text
Staff authentication
+
Staff permission
+
Authorized device credential
+
Valid member credential/token
+
Current entitlement/access validation
```

Do not rely on IP address, MAC address, browser fingerprint, user agent, or knowledge of a member ID as a security boundary.

Privileged staff/admin accounts should support MFA/passkeys or equivalent strong authentication where practical.

Backend authorization is mandatory even if the UI hides a function.

---

## 3. Device authorization

Use an `authorized_devices` entity or equivalent.

Suggested fields:

```text
id
device_name
device_type
location
status
registered_at
registered_by
last_seen_at
last_used_by
revoked_at
device_credential_reference
```

Statuses:

```text
pending
authorized
suspended
revoked
```

A new device must not automatically gain scanning privileges merely because a staff user logs in.

Enrollment options may include:

- manager approval;
- one-time pairing code;
- QR pairing flow;
- WebAuthn/passkey-style device registration where appropriate.

Device credentials must be revocable independently of the employee account.

---

## 4. Member credential / QR design

The QR/barcode must not contain personal data such as:

- name;
- phone;
- membership type;
- expiry;
- payment status.

Use an opaque token or signed credential that resolves server-side.

Prefer short-lived or rotating QR credentials for the member app where operationally practical.

A static screenshot should not become a permanently reusable access key.

The token design must support:

- expiration;
- revocation;
- replay/duplicate detection where required;
- member resolution without exposing raw database IDs.

---

## 5. Replay and duplicate-use protection

Check-in is a security-sensitive business flow.

Implement controls appropriate to the final credential model, such as:

- short token lifetime or rotating QR;
- nonce/jti or equivalent unique token identifier;
- recent-use detection;
- server-side duplicate-window rules;
- rate limiting on validation endpoints;
- abnormal repeated-scan monitoring.

Do not block legitimate reception retries blindly. The backend should distinguish a harmless retry of the same operation from a suspicious repeated credential use.

Check-in writes should be idempotent within an appropriate short window so a network retry does not create duplicate visit records.

---

## 6. Access decision logic

The backend should evaluate the participant against the shared entitlement model.

Conceptually:

```text
Scan
 ↓
Resolve credential
 ↓
Resolve member/dependant
 ↓
Validate account/member status
 ↓
Resolve active membership/pass/products
 ↓
Resolve required gym-access entitlement
 ↓
Apply date/time/access restrictions
 ↓
ALLOW / DENY / MANUAL REVIEW
```

Possible results:

```text
active
expired
frozen
suspended
invalid_token
valid_day_pass
valid_multi_day_pass
not_yet_valid
already_used_if_applicable
manual_review_required
```

The access service should return a machine-readable reason code plus a staff-friendly explanation.

---

## 7. Reception data minimization

Show staff only what is required to make the access decision.

Typical result screen:

- member photo where operationally required;
- member name;
- active membership/pass label;
- status;
- validity/expiry;
- access decision;
- concise operational note.

Do not expose payment details, unnecessary contact data, sensitive notes, or unrelated member history on the standard scanning screen.

---

## 8. Mobile/tablet camera flow

1. Employee signs in.
2. Backend validates account and permission.
3. Device authorization is validated.
4. Employee opens Member Check-In.
5. Camera permission is requested.
6. Member QR is scanned.
7. Credential is submitted to backend.
8. Backend resolves entitlement/access.
9. Result is shown immediately.
10. Allow/deny decision is recorded.

---

## 9. Reception PC + USB scanner flow

Use a standard USB scanner supporting QR/2D and HID/keyboard mode where suitable.

```text
Member QR
→ USB Scanner
→ Authorized Reception PC
→ Staff App
→ Check-In API
→ Access Decision
```

The scanner itself does not need to connect directly to the backend.

The reception computer/browser/device is the controlled endpoint.

---

## 10. Manual lookup and override

Manual lookup is a fallback, not a bypass around access policy.

Reception may be permitted to search a member using limited identifiers.

A manual access override must require a dedicated permission and record:

- staff actor;
- device;
- member;
- original denial reason;
- override reason;
- timestamp;
- optional manager approval where policy requires it.

Do not allow silent overrides.

---

## 11. Check-in record

Suggested canonical record:

```text
checkins
- id
- member_id nullable
- dependant_id nullable
- facility_id
- occurred_at
- decision
- reason_code nullable
- staff_user_id
- authorized_device_id
- method
- operation_key
- metadata minimal/controlled
- created_at
```

Methods may include:

```text
mobile_camera
usb_scanner
manual_lookup
turnstile
nfc
rfid
```

Use a unique `operation_key` or equivalent to support retry-safe/idempotent writes.

---

## 12. Offline / degraded mode

Do not silently treat stale cached membership data as fully authoritative.

Recommended priority:

1. **Online validation** — normal mode.
2. **Temporary connectivity failure** — clearly show degraded status and retry.
3. **Staff-assisted manual procedure** — allowed according to documented club policy.
4. **Optional future offline authorization** — only if explicitly designed using a bounded, signed, time-limited entitlement snapshot and a reconciliation process.

If offline acceptance is introduced later, define:

- maximum offline age;
- which membership/pass types may be accepted;
- deny-list/revocation limitations;
- local encryption;
- sync conflict handling;
- audit/reconciliation rules.

Do not build a complex offline access system in MVP unless real operations require it.

---

## 13. Rate limiting and abuse controls

Protect check-in and credential-validation endpoints against unrestricted automated use.

Controls may include:

- per-device rate limits;
- per-staff-session rate limits;
- token failure thresholds;
- suspicious repeated member-token detection;
- alerts for unusual denial or scan volumes.

Limits should not interrupt legitimate peak reception throughput.

---

## 14. Audit and observability

Record security/operational events such as:

- device enrollment request;
- device approved/revoked;
- staff permission change;
- successful check-in;
- denied check-in + reason;
- manual override;
- repeated invalid token attempts;
- service/webhook/system errors.

Production monitoring should surface unusual failure rates and service outages.

Avoid putting unnecessary PII or raw QR tokens into application logs.

---

## 15. Privacy and retention

Define a written retention policy for access/check-in records.

Retention should be based on actual operational, security, accounting or legal needs rather than indefinite storage by default.

The system must support appropriate deletion/anonymization while preserving records that must legitimately remain for audit or transaction purposes.

Dependants/minors require additional data minimization and access discipline.

---

## 16. Admin device management

Recommended route/module:

```text
Admin
└── Authorized Devices
```

Functions:

- pending requests;
- approve;
- rename;
- suspend;
- revoke;
- view last activity;
- view assigned location;
- inspect suspicious activity;
- revoke lost/replaced devices immediately.

Permissions should distinguish device viewing from device approval/revocation.

---

## 17. Relationship to class attendance

Facility check-in and class attendance are related but distinct facts.

```text
Facility Check-In
= member entered gym

Class Attendance
= participant attended a specific resolved class occurrence
```

Do not infer class attendance merely from gym entry.

If class attendance scanning is introduced, it should reference the canonical resolved session/booking entities.

---

## 18. MVP

### Phase 1

- staff authentication;
- action-level permission;
- authorized device registry;
- camera QR scan;
- opaque member credential;
- server-side entitlement validation;
- retry-safe check-in record;
- device management;
- audit trail;
- manual fallback/override rules.

### Phase 2

- reception PC optimized flow;
- USB HID scanner;
- rotating/short-lived member app QR if not already implemented;
- improved fraud/duplicate-use monitoring;
- occupancy/attendance reporting.

### Phase 3

Only if justified:

- turnstiles;
- NFC/RFID;
- controlled offline authorization;
- dedicated kiosks;
- physical membership cards;
- deeper access-control hardware integration.

---

## 19. QA / acceptance criteria

Before launch verify:

- unauthorized staff cannot check in members;
- authorized staff on an unapproved device cannot use scanning;
- revoked devices fail immediately;
- raw member data is not encoded in QR;
- expired/frozen/suspended users receive correct decisions;
- day and multi-day pass validity is correct;
- repeated network submissions do not create duplicate records;
- replay/duplicate-use rules behave as intended;
- manual overrides are permissioned and audited;
- peak reception scanning is responsive;
- logs do not expose raw credentials or unnecessary PII;
- entitlement changes take effect without stale-cache authorization;
- check-in history remains linked to the correct member/device/staff actor.

---

## 20. Final rule

The secure check-in system is an **access client of the shared entitlement domain**, not a separate membership system.

Security should be layered around staff identity, device authorization, member credential validity, current backend entitlement, replay protection, idempotent logging and auditable overrides.
