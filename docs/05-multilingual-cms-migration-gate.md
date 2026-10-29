# Multilingual CMS production migration gate

**Audit date:** 2026-10-29

## Outcome

The read-only production inventory and schema comparison are complete. No production records, schemas or publication states were changed during the audit.

- Production contains zero `SitePage` records.
- The repository contains 15 local entity schemas; production exposes 16 entity keys.
- Fourteen local schemas match their production counterparts exactly.
- `SitePage` is the only intended schema update.
- Production contains duplicate empty entity keys, `member` and `Member`, whose embedded schema name is `Member`.

## `SitePage` change

The local schema preserves the existing `title`, `slug`, `content`, SEO and publication fields. It adds the multilingual edition identity, navigation, hero, structured content-block, workflow, version, approval and publication metadata required by the approved architecture.

The public read rule changes from unrestricted reads to published-record reads, while administrators retain access to drafts and review editions. Because production contains no `SitePage` records, this permission change cannot hide or break a legacy page record.

## Synchronization impact

Base44 entity synchronization replaces the complete remote schema set. A standard synchronization is therefore expected to:

1. update `SitePage`;
2. leave the other 14 local schemas unchanged;
3. remove the empty legacy lowercase `member` entity key.

Both `member` and `Member` contained zero records at audit time. The lowercase schema removal remains an explicit approval checkpoint because it is unrelated to multilingual content.

## Required approval

Before schema synchronization, the owner must explicitly approve updating `SitePage` and removing the empty lowercase `member` duplicate. After approval, the release operator must:

1. synchronize the entity schemas through the standard Base44 CLI workflow;
2. re-fetch the production schema set and confirm 15 schemas remain;
3. confirm the `SitePage` fields and published-only public read rule;
4. verify that all existing non-`SitePage` record counts remain unchanged;
5. import approved language editions as unpublished records.

Raw production exports and exact schema snapshots remain in the ignored migration work folder and must not be committed.
