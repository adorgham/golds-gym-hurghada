import assert from "node:assert/strict";
import { filterSchedule, isValidDateKey, normalizeTrainerName, resolveSchedule, startOfWeek } from "../src/lib/schedule.js";

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

console.log("Schedule resolver validation passed.");
