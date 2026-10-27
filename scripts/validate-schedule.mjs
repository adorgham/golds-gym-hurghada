import assert from "node:assert/strict";
import { filterSchedule, isValidDateKey, normalizeTrainerName, resolveSchedule, startOfWeek } from "../src/lib/schedule.js";
import { BASELINE_EFFECTIVE_DATE, CLASS_NAMES, SCHEDULE_ROWS, TRAINER_NAMES } from "./migrate-october-2026-schedule.mjs";

const recurring = [
  { id: "r1", class_id: "c1", class_name: "Spinning", trainer_id: "t1", day_of_week: "Wednesday", start_time: "19:00", duration_minutes: 45, studio: "spinning", access_types: ["ladies_only", "prepaid"], active_from: "2026-10-01", is_published: true },
  { id: "r2", class_id: "c2", class_name: "Mobility", day_of_week: "Friday", start_time: "10:00", duration_minutes: 60, studio: "floor", access_types: ["all"], active_from: "2026-10-01", active_until: "2026-10-31", is_published: true },
];

const overrides = [
  { id: "o1", recurring_session_id: "r1", effective_date: "2026-10-14", change_type: "Cancel", is_published: true },
  { id: "o2", recurring_session_id: "r1", effective_date: "2026-10-21", change_type: "Modify", replacement_start_time: "19:30", replacement_trainer_id: "t2", replacement_trainer_name: "Diana", replacement_studio: "aerobics", replacement_access_types: ["kids", "prepaid"], is_published: true },
];

const oneOffs = [
  { id: "x1", class_id: "c3", class_name: "Workshop", session_date: "2026-10-22", start_time: "16:00", duration_minutes: 90, studio: "martial_arts", access_types: ["prepaid"], status: "Scheduled", is_published: true },
];

const result = resolveSchedule({ recurring, overrides, oneOffs, fromDate: "2026-10-12", toDate: "2026-10-25" });
assert.equal(startOfWeek("2026-10-14"), "2026-10-12");
assert.equal(isValidDateKey("2026-10-14"), true);
assert.equal(isValidDateKey("2026-02-31"), false);
assert.equal(normalizeTrainerName("Diann"), "Diana");
assert.equal(result.find((item) => item.occurrence_date === "2026-10-14")?.is_cancelled, true);
assert.equal(result.find((item) => item.occurrence_date === "2026-10-21")?.start_time, "19:30");
assert.equal(result.find((item) => item.occurrence_date === "2026-10-21")?.trainer_name, "Diana");
assert.equal(result.some((item) => item.occurrence_id === "oneoff:x1"), true);
assert.equal(filterSchedule(result, { studio: "aerobics", access: "kids" }).length, 1);
assert.equal(filterSchedule(result, { studio: "spinning", access: "kids" }).length, 0);
assert.equal(result.some((item) => item.recurring_session_id === "r2"), true);

const versioned = resolveSchedule({
  recurring: [
    { id: "old", class_name: "Spinning", day_of_week: "Wednesday", start_time: "19:00", studio: "spinning", active_from: "2026-09-01", active_until: "2026-10-31", is_published: true },
    { id: "new", class_name: "Spinning", day_of_week: "Wednesday", start_time: "19:30", studio: "spinning", active_from: "2026-11-01", is_published: true },
  ],
  fromDate: "2026-10-28",
  toDate: "2026-11-04",
});
assert.equal(versioned.find((item) => item.occurrence_date === "2026-10-28")?.start_time, "19:00");
assert.equal(versioned.find((item) => item.occurrence_date === "2026-11-04")?.start_time, "19:30");
assert.equal(versioned.find((item) => item.occurrence_date === "2026-10-28")?.occurrence_id, "recurring:old:2026-10-28");

const publicIgnoresDraftOverride = resolveSchedule({
  recurring: [recurring[0]],
  overrides: [{ recurring_session_id: "r1", effective_date: "2026-10-21", change_type: "Modify", replacement_start_time: "20:00", is_published: false }],
  fromDate: "2026-10-21",
  toDate: "2026-10-21",
});
assert.equal(publicIgnoresDraftOverride[0]?.start_time, "19:00");

assert.equal(SCHEDULE_ROWS.length, 51);
assert.equal(CLASS_NAMES.length, 27);
assert.equal(TRAINER_NAMES.length, 13);
assert.equal(new Set(SCHEDULE_ROWS.map((row) => row.source_key)).size, 51);
assert.equal(SCHEDULE_ROWS.some((row) => row.day_of_week === "Friday"), false);
assert.equal(SCHEDULE_ROWS.some((row) => Object.hasOwn(row, "duration_minutes")), false);
assert.equal(SCHEDULE_ROWS.filter((row) => row.trainer_name == null).length, 10);
assert.equal(SCHEDULE_ROWS.filter((row) => row.age_min != null).length, 8);

const baseline = SCHEDULE_ROWS.map((row, index) => ({
  ...row,
  id: `baseline-${index}`,
  active_from: BASELINE_EFFECTIVE_DATE,
  is_published: true,
}));
const octoberWeek = resolveSchedule({ recurring: baseline, fromDate: "2026-10-05", toDate: "2026-10-11" });
const futureWeek = resolveSchedule({ recurring: baseline, fromDate: "2027-01-04", toDate: "2027-01-10" });
assert.equal(octoberWeek.length, 51);
assert.equal(futureWeek.length, 51);
assert.equal(octoberWeek.filter((item) => item.day_of_week === "Friday").length, 0);
assert.equal(filterSchedule(octoberWeek, { studio: "martial_arts", access: "kids" }).length, 8);
assert.equal(filterSchedule(octoberWeek, { studio: "floor", access: "all" }).length, 2);
assert.deepEqual(
  octoberWeek.find((item) => item.class_name === "Kids Kick Boxing" && item.age_min === 9)?.access_types,
  ["prepaid", "kids"],
);

console.log("Schedule resolver validation passed.");
