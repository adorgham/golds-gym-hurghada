# Group Class Schedule — Design QA

## Evidence

- Source visual truth: `00-work-files/schedule/0f4b99c6-9e0d-48d5-8e64-4c76b7cebaf5.png`
- Desktop implementation: `00-work-files/schedule/implementation-desktop.png`
- Initial mobile implementation: `00-work-files/schedule/implementation-mobile.png`
- Mobile day-first implementation: `00-work-files/schedule/mobile-day-first-implementation.png`
- Mobile filter and guide entry: `00-work-files/schedule/mobile-filters-guide-entry.png`
- Mobile filter and guide dialog: `00-work-files/schedule/mobile-filter-guide-open.png`
- Desktop without duplicate guide: `00-work-files/schedule/desktop-without-duplicate-guide.png`
- Side-by-side comparison: `00-work-files/schedule/design-qa-comparison.png`
- Desktop viewport: 1672 × 941 CSS pixels at 1× density
- Mobile viewport: 390 × 844 CSS pixels at 1× density
- State: week of 26 October–1 November 2026, all studios and access types, populated from the production Base44 schedule

## Experience matched

- Dense seven-day timetable and complete control rail on desktop.
- Day-first mobile timetable with a compact date strip, class counts and optional full-week mode.
- Mobile studio/access filters and plain-language class explanations in one focused dialog; filters automatically open the next day containing a match when needed.
- Desktop uses the labeled, color-coded filter rail without repeating the same information in a second guide.
- Compact schedule cards with studio-colored rails, access badges, time, trainer and location hierarchy.
- Per-day class totals and a bottom “New Here?” membership call to action.

## Intentional differences

- The existing Gold’s Gym Hurghada global navigation and page shell are preserved.
- The reference’s weight-plate hero photograph is not reproduced because no approved standalone asset was supplied.
- Capacity, class fullness, difficulty, duration and highlighted-session states are not invented when production records do not provide them.
- The implementation uses the real published timetable, so density and card positions differ from the reference’s illustrative data.

## Validation

- Desktop and mobile full-page visual inspection completed.
- Day/full-week switching and studio filtering verified against populated production data.
- 51 current-week occurrences render across all seven days.
- Mobile document width is contained at 390 pixels; the date strip scrolls locally without page overflow.
- Browser console checked with no errors.
- `npm run check` and `git diff --check` pass.

## Comparison history

1. Initial mobile pass placed controls and the complete legend before the timetable. Severity: P1. Reworked mobile into a day-first flow and moved filters into a dialog.
2. The selected day could have no results after applying a filter even when the week contained matches. Severity: P2. The filter action now selects the next matching day.
3. The desktop legend repeated the filter rail, while the icon-only mobile filter did not explain class types clearly. Severity: P2. Removed the desktop legend and combined labeled mobile filtering with the class guide.
4. Post-fix mobile and desktop regression checks found no remaining P0, P1 or P2 visual issues.

## Final result

Passed for owner visual review. Optional P3 enhancement: add an approved wide hero image later if the business wants the photographic treatment from the reference.
