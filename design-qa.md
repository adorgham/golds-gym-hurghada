# Group Class Schedule — Design QA

## Evidence

- Source visual truth: `00-work-files/schedule/0f4b99c6-9e0d-48d5-8e64-4c76b7cebaf5.png`
- Desktop implementation: `00-work-files/schedule/implementation-desktop.png`
- Mobile implementation: `00-work-files/schedule/implementation-mobile.png`
- Side-by-side comparison: `00-work-files/schedule/design-qa-comparison.png`
- Desktop viewport: 1672 × 941 CSS pixels at 1× density
- Mobile viewport: 390 × 844 CSS pixels at 1× density
- State: week of 26 October–1 November 2026, all studios and access types, populated from the production Base44 schedule

## Experience matched

- Dense seven-day timetable on desktop, with a stacked day-by-day layout below the large breakpoint.
- One compact control rail for view, studio, access and date navigation.
- Separate studio and access legend with consistent color mapping.
- Compact schedule cards with studio-colored rails, access badges, time, trainer and location hierarchy.
- Per-day class totals and a bottom “New Here?” membership call to action.

## Intentional differences

- The existing Gold’s Gym Hurghada global navigation and page shell are preserved.
- The reference’s weight-plate hero photograph is not reproduced because no approved standalone asset was supplied.
- Capacity, class fullness, difficulty, duration and highlighted-session states are not invented when production records do not provide them.
- The implementation uses the real published timetable, so density and card positions differ from the reference’s illustrative data.

## Validation

- Desktop and mobile full-page visual inspection completed.
- Day/week switching and studio filtering verified against populated production data.
- 51 current-week occurrences render across all seven days.
- Mobile document width is contained at 390 pixels; filter rails scroll locally without page overflow.
- Browser console checked with no errors.
- `npm run check`, `npx base44 build` and `git diff --check` pass.

## Comparison history

1. Initial mobile pass made the legend too tall at 390 pixels. Severity: P2. Fixed by using a two-column legend on mobile.
2. Post-fix desktop/mobile comparison found no remaining P0, P1 or P2 visual issues.

## Final result

Passed for owner visual review. Optional P3 enhancement: add an approved wide hero image later if the business wants the photographic treatment from the reference.
