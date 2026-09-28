# Gold’s Gym Hurghada — Membership & Pass Sales

**Status:** Feature specification  
**Version:** 1.1  
**Date:** 2026-09-26  
**Parent:** Gold’s Gym Hurghada — Backend Architecture & Domain Model  
**SEO governance:** Gold’s Gym Hurghada — SEO and AIO Strategy

## Delivery priority

Membership and pass discovery is a **website-launch requirement**.

Classify implementation as follows:

### `REQUIRED NOW`

- canonical membership/pass products;
- current pricing and inclusions;
- public website presentation;
- lead or purchase CTA;
- checkout/payment flow if online purchase is included in launch;
- order/payment records required by that flow;
- fulfillment into the canonical membership/pass/entitlement model;
- authenticated member web visibility where included in launch scope.

### `DEPENDENCY NOW`

Implement only the backend foundations required to make the above reliable, including appropriate identity, entitlement, idempotency, payment reconciliation, permission and audit controls.

### `FUTURE-READY ONLY`

Unless explicitly promoted into an active milestone:

- native mobile purchase flows;
- loyalty;
- corporate membership;
- hotel/partner distribution;
- complex promotions;
- class-pack balances;
- PT-package balances;
- advanced renewal automation.

The website and future mobile application must use the same products, purchases, memberships, passes and entitlements.

---

## Purpose

Define the commercial, backend and cross-surface architecture for selling and managing Gold’s Gym Hurghada memberships and short-stay passes without creating a separate commerce model for the website, member app or reception.

Initial commercial scope should support:

- monthly memberships;
- 1-day pass;
- 3-day pass;
- 5-day pass;
- 7-day pass;
- future class packs / prepaid classes;
- future PT packages;
- guest/tourist purchase flows;
- staff-assisted sales;
- future renewals and promotions.

The public website owns product discovery and conversion. The shared backend owns products, prices, orders, payments, fulfillment and entitlements. The authenticated member experience owns post-purchase use and management, whether accessed on the web now or through a future mobile app.

---

## 1. Governing principle

```text
Public Website / Staff Sale / Member Web / Future App
                 ↓
             Product
                 ↓
              Price
                 ↓
              Order
                 ↓
             Payment
                 ↓
            Fulfillment
                 ↓
 Membership / Pass / Pack / Entitlement
                 ↓
 Member Web / Future App + Check-In + Booking
```

Do not create separate website-only membership/pass records.

---

## 2. Product versus purchased instance

A product is the sellable definition.

Examples:

```text
Monthly Membership
1-Day Pass
3-Day Pass
5-Day Pass
7-Day Pass
Air Yoga 5-Class Pack
PT 5-Session Package
```

The customer's membership/pass is a purchased/issued instance with its own validity and status.

Never use a mutable product name as the business-rule identifier.

---

## 3. Canonical entities

Use the entities defined by the Backend Architecture & Domain Model, including:

```text
products
product_prices
membership_plans
memberships
member_passes
entitlements
product_entitlements
orders
order_items
payments
promotions
members
user_accounts
```

Future additions may include:

```text
class_pack_balances
pt_package_balances
refunds
promotion_redemptions
corporate_accounts
partner_codes
```

Only introduce separate entities when they represent a real domain concept rather than a UI variation.

---

## 4. Product types

Recommended canonical product types:

```text
membership_plan
day_pass
multi_day_pass
class_pack
single_class
pt_package
pt_session
promotion_related
other
```

`1-day`, `3-day`, `5-day`, and `7-day` are product configurations, not four separate commerce systems.

---

## 5. Pricing model

Price must be versioned/effective-dated rather than overwritten historically.

Suggested structure:

```text
product_prices
- id
- product_id
- currency
- amount
- valid_from
- valid_until nullable
- customer/audience condition nullable
- active
```

Historical orders keep the actual charged unit price even when the current public price changes.

Do not recalculate old orders from today's product price.

---

## 6. Entitlements

Products grant entitlements.

Examples:

```text
Monthly Membership
→ gym_access
→ group_classes

1-Day Pass
→ gym_access
valid for configured period

Air Yoga Pack
→ air_yoga_prepaid
quantity = 5
```

This is the bridge between sales and operations.

Check-in and booking should ask the entitlement system whether access is valid; they should not inspect the marketing product name directly.

---

## 7. Membership lifecycle

Suggested statuses:

```text
pending
active
paused
expired
cancelled
```

Membership instance should include:

```text
member_id
membership_plan_id
starts_at
ends_at
status
auto_renew if applicable
source_order_id
created_at
updated_at
```

Future freeze/extension rules should update the membership according to explicit policy and remain auditable.

Do not overwrite history to make a changed plan appear as if it always had the new terms.

---

## 8. Pass lifecycle

A pass represents temporary or usage-limited access.

Suggested fields:

```text
member_id or guest/member reference
product_id
starts_at
expires_at
usage_limit nullable
usage_count
status
source_order_id
```

Pass activation policy must be explicit per product, for example:

- starts immediately on purchase;
- starts on selected date;
- starts on first check-in;
- must be activated by staff.

Do not leave activation semantics implicit.

---

## 9. Tourist / guest flow

Hurghada visitor access should not require the same onboarding burden as a long-term membership.

Preferred journey:

```text
Visitor finds Pass page
→ chooses pass
→ provides minimum required identity/contact information
→ pays
→ backend creates lightweight member/customer record if needed
→ pass is fulfilled
→ account/app activation offered
→ QR/access credential becomes available
```

Principles:

- minimize required fields;
- make validity, inclusions, ID requirements and activation rules clear before payment;
- avoid forcing a complex profile setup before a short-stay purchase;
- permit later account activation/claiming of the purchase where technically suitable.

---

## 10. Public website sales experience

Primary commercial pages:

```text
/memberships
/passes
```

Conditional detail pages may exist according to the SEO & AIO Strategy.

The website should show current machine-readable HTML facts such as:

- product name;
- price/currency;
- duration/validity;
- what's included;
- exclusions;
- activation/start rule;
- check-in requirements;
- important restrictions;
- cancellation/refund summary;
- primary CTA.

Do not put critical offer terms only in images.

---

## 11. Indexation and pass-page rule

`/memberships` owns broad membership intent.

`/passes` owns broad visitor/short-stay access intent.

Do not automatically index a separate 1/3/5/7-day page if the only meaningful difference is duration and price.

A detail URL is indexable only when it provides sufficiently distinct user value and search intent under the SEO & AIO Strategy.

Transactional routes such as checkout, success, account and receipt pages should not compete with the commercial landing pages.

---

## 12. Checkout initiation

The frontend creates or requests an order/checkout through a narrowly scoped backend command.

The server, not browser-supplied values, must determine authoritative:

- product ID;
- current valid price;
- currency;
- eligibility/promotion;
- tax/fee treatment if applicable;
- fulfillment mapping.

Do not trust a client-submitted amount as the final charge amount.

---

## 13. Order model

Suggested order statuses:

```text
draft
pending_payment
paid
cancelled
refunded
partially_refunded
```

Each order item snapshots:

- product reference;
- product name/description as needed for receipt/history;
- quantity;
- actual unit price;
- actual total;
- relevant commercial terms/version where required.

This protects transaction history after products/prices change.

---

## 14. Payment provider boundary

Use a compliant payment provider for card/payment handling.

Gold’s Gym Hurghada should store only the provider references and transaction metadata needed for operations/reconciliation.

Never store raw card number or card security code.

The domain model must not be tied so tightly to one payment gateway that memberships become impossible to migrate later.

---

## 15. Authoritative payment completion

Do not activate a membership/pass solely because the browser reached a `success` URL.

Fulfillment must be driven by a verified server-side payment event/webhook or authoritative provider status.

The browser success page can display progress, but the backend payment state is authoritative.

---

## 16. Idempotent fulfillment

Payment providers and networks retry events.

The fulfillment flow must safely handle the same payment/event more than once.

Use:

- unique provider event/transaction IDs;
- idempotency keys for create/update commands where supported;
- database uniqueness constraints;
- fulfillment status/operation key.

A duplicate event must not issue two passes, two memberships, or duplicate entitlement balances.

---

## 17. Payment state handling

Support at minimum:

```text
pending
authorized if provider uses it
paid
failed
refunded
partially_refunded
```

Where payment methods may complete asynchronously, the user experience should distinguish pending from paid.

Do not grant irreversible access based on a payment state that is not actually final unless the business deliberately accepts that risk.

---

## 18. Reconciliation

Create an operational reconciliation path between:

```text
Order
↔ Payment Provider Transaction
↔ Fulfillment
↔ Membership/Pass/Entitlement
```

Staff/admin should be able to identify exceptions such as:

- paid but not fulfilled;
- fulfilled but payment failed/reversed;
- duplicated provider event;
- refund completed but entitlement not adjusted;
- order total/provider amount mismatch.

These cases should not require engineers to inspect the database manually as the normal process.

---

## 19. Refund / cancellation integration

Commercial policies belong in legal/operational policy, but the backend must support their execution.

A refund should not automatically mean the same action for every product.

Define per-product consequences such as:

- revoke unused pass;
- shorten/cancel membership;
- preserve consumed usage;
- manual review if access has already been used;
- issue partial refund where policy permits.

Every privileged adjustment should be auditable.

---

## 20. Promotions

Promotion logic may be phased later but should use central product/order pricing logic.

Potential rules:

- fixed amount;
- percentage;
- selected products;
- start/end date;
- usage limit;
- first purchase;
- partner/corporate code.

The server validates promotions before order creation/payment.

Do not implement discounts purely in frontend JavaScript.

---

## 21. Staff-assisted sales

Reception/admin may create a sale for a customer using the same products, prices, orders and fulfillment logic.

Record:

- staff actor;
- sales channel;
- member/customer;
- product;
- payment method/provider reference;
- any authorized manual adjustment.

Do not maintain a second reception-only membership database.

---

## 22. Member app after purchase

The member app should display canonical current state, for example:

- active membership;
- active passes;
- start/expiry;
- remaining usage where applicable;
- QR/member card;
- purchase/order history where useful;
- renewal or repurchase CTA;
- cancellation/freeze controls only if policy and implementation support them.

The app should not infer status from old purchase receipts.

---

## 23. Relationship to check-in

Check-in asks:

```text
Does this member currently possess the required gym_access entitlement?
```

It should not ask:

```text
Did this person once buy a product named 'Monthly Membership'?
```

Pass validity/usage rules must be resolved centrally and atomically when a check-in consumes a usage-limited entitlement.

---

## 24. Relationship to group classes

A standard membership may grant `group_classes`.

A prepaid specialty class may require a separate entitlement such as:

```text
air_yoga_prepaid
```

The public Members & Access label `Pre-Paid` is presentation metadata; booking eligibility is enforced through the entitlement/rule engine.

A class can therefore also have audience restrictions such as Kids or Ladies Only independently from payment rules.

---

## 25. Concurrency and limited balances

Usage-limited packs/pass balances must be consumed transactionally.

Two simultaneous requests must not both consume the same final credit.

Use database transactions, atomic counters/ledger entries, uniqueness constraints or equivalent backend controls.

Frontend displayed balances are informational; backend state is authoritative.

---

## 26. Ledger preference for consumable credits

For prepaid class packs or PT packages, prefer an auditable usage ledger over only storing a mutable counter.

Conceptually:

```text
Pack issued: +5
Class booked/consumed: -1
Cancellation restored: +1
Admin adjustment: +/-1 with reason
```

A cached `remaining_balance` may exist for performance but should be derivable/reconcilable from the ledger where practical.

---

## 27. Account identity and duplicate customers

Define matching/linking rules so the same person does not receive a new disconnected member record on every purchase.

Use verified identifiers carefully, for example email/phone plus account claim/verification.

Do not merge customer records automatically on weak similarities such as name alone.

Provide an audited admin merge/link workflow if duplicate records occur.

---

## 28. Analytics and attribution

Preserve marketing attribution from website discovery into order/purchase records where technically possible.

Useful events:

```text
view_memberships
view_pass
select_product
checkout_started
payment_succeeded
payment_failed
purchase_membership
purchase_pass
account_activated
renewal_started
renewal_completed
```

Useful non-sensitive parameters:

```text
product_type
product_id
pass_duration
currency
sales_channel
campaign/source attribution
```

Do not send personal, payment or membership-secret information into analytics event parameters.

---

## 29. CRM / lifecycle readiness

The architecture should support future lifecycle messaging without requiring a new commerce model.

Potential triggers:

- abandoned checkout where consent/legal basis allows;
- purchase confirmation;
- pass activation reminder;
- membership expiring;
- renewal reminder;
- first visit after purchase;
- unused prepaid credits.

Notification preferences and consent must be respected.

---

## 30. Admin requirements

Staff/admin should eventually be able to manage:

- products;
- prices/effective dates;
- product visibility;
- entitlement grants;
- memberships;
- passes;
- orders;
- payment status/reconciliation;
- refunds according to permission;
- promotions;
- manual adjustments;
- audit history.

Routine operations should not require direct database edits.

---

## 31. Roles and permissions

Examples:

```text
product.read
product.manage
price.manage
order.read
payment.read
refund.execute
membership.create
membership.adjust
pass.issue
entitlement.grant_manual
promotion.manage
```

High-impact actions should be separated from ordinary reception permissions.

---

## 32. Audit requirements

Audit at minimum:

- product/price changes;
- membership manual activation/extension;
- pass issuance/revocation;
- manual entitlement grants;
- refunds;
- promotion changes;
- order/payment reconciliation adjustments;
- duplicate-member merge/link actions.

---

## 33. Privacy and data minimization

Collect only information genuinely required for:

- contract/purchase;
- account/access;
- payment/provider reconciliation;
- legal/accounting obligations;
- service delivery.

Guest/day-pass flows should request fewer fields than long-term membership onboarding where possible.

Define retention for orders, payments, member profiles and abandoned leads/checkouts separately.

---

## 34. Failure handling

Design explicit user/staff outcomes for:

- payment declined;
- payment still processing;
- webhook delayed;
- fulfillment failed;
- entitlement grant failed;
- duplicate checkout retry;
- provider temporarily unavailable;
- expired price/promotion;
- member-account linking conflict.

The system should recover safely without duplicate charges or access grants.

---

## 35. MVP scope

### Phase 1 — Commercial foundation

- products;
- current prices;
- monthly membership product(s);
- 1/3/5/7-day passes;
- orders/order items;
- one payment provider integration;
- verified webhook processing;
- idempotent fulfillment;
- member/pass issuance;
- core entitlements;
- purchase confirmation;
- staff reconciliation visibility;
- website conversion tracking.

### Phase 2 — Member self-service

- account activation;
- active products in member app;
- purchase history;
- repurchase/renewal;
- configurable pass activation if needed;
- improved notifications.

### Phase 3 — Expanded products

- prepaid class packs;
- PT packages;
- promotions;
- partner/hotel codes;
- corporate memberships;
- enhanced lifecycle CRM.

Do not build Phase 3 complexity before the initial product economics and operational workflows justify it.

---

## 36. QA / acceptance criteria

Before launch verify:

- authoritative price comes from backend;
- historical order price remains stable after price changes;
- success-page refresh does not duplicate fulfillment;
- duplicate webhooks do not duplicate membership/pass issuance;
- failed payments do not grant paid entitlements;
- delayed payment state is handled correctly;
- refunds/adjustments are auditable;
- 1/3/5/7-day validity rules behave exactly as configured;
- timezone/date boundaries use the approved business timezone;
- guest purchase can be linked safely to a later account;
- check-in immediately reflects entitlement status;
- analytics contains no sensitive payment/member data;
- search-facing pages remain separate from private checkout/account URLs;
- mobile checkout is usable and fast.

---

## 37. Final rule

Membership and pass sales should be implemented as one shared **commerce → fulfillment → entitlement** pipeline.

The website sells, the payment provider processes, the backend fulfills, and the member app/check-in/booking systems consume the resulting canonical entitlements.

Do not duplicate this logic per product, per frontend, or per sales channel.
