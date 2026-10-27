export const GYM_TIME_ZONE = "Africa/Cairo";
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const STUDIOS = [
  { value: "aerobics", label: "Aerobics Studio", shortLabel: "Aerobics" },
  { value: "spinning", label: "Spinning Studio", shortLabel: "Spinning" },
  { value: "martial_arts", label: "Martial Arts Studio", shortLabel: "Martial Arts" },
  { value: "floor", label: "Floor", shortLabel: "Floor" },
];

export const ACCESS_TYPES = [
  { value: "all", label: "All" },
  { value: "prepaid", label: "Pre-Paid" },
  { value: "ladies_only", label: "Ladies Only" },
  { value: "kids", label: "Kids" },
];

const LEGACY_STUDIO_MAP = new Map([
  ["aerobics", "aerobics"], ["aerobics studio", "aerobics"],
  ["spinning", "spinning"], ["spinning studio", "spinning"],
  ["martial_arts", "martial_arts"], ["martial arts", "martial_arts"], ["martial arts studio", "martial_arts"],
  ["floor", "floor"], ["gym floor", "floor"], ["main floor", "floor"],
]);

function dateFromKey(dateKey) {
  return new Date(`${dateKey}T12:00:00Z`);
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const parsed = dateFromKey(value);
  return !Number.isNaN(parsed.getTime()) && dateKey(parsed) === value;
}

export function getCairoToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GYM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDays(date, amount) {
  const value = dateFromKey(date);
  value.setUTCDate(value.getUTCDate() + amount);
  return dateKey(value);
}

export function dayName(date) {
  const index = dateFromKey(date).getUTCDay();
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][index];
}

export function startOfWeek(date) {
  const index = DAYS.indexOf(dayName(date));
  return addDays(date, -index);
}

export function weekDates(date) {
  const start = startOfWeek(date);
  return DAYS.map((_, index) => addDays(start, index));
}

export function formatScheduleDate(date, options = {}) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(dateFromKey(date));
}

export function normalizeStudio(value) {
  return LEGACY_STUDIO_MAP.get(String(value || "").trim().toLowerCase()) || "";
}

export function studioLabel(value, short = false) {
  const studio = STUDIOS.find((item) => item.value === normalizeStudio(value));
  return studio ? (short ? studio.shortLabel : studio.label) : "Location TBA";
}

export function normalizeAccessTypes(value) {
  const values = Array.isArray(value) ? value : value ? [value] : ["all"];
  const allowed = new Set(ACCESS_TYPES.map((item) => item.value));
  const normalized = [...new Set(values.map((item) => String(item).trim().toLowerCase().replace(/[ -]+/g, "_")).filter((item) => allowed.has(item)))];
  if (normalized.length === 0 || normalized.includes("all")) return ["all"];
  return normalized;
}

export function accessLabel(value) {
  return ACCESS_TYPES.find((item) => item.value === value)?.label || value;
}

export function normalizeTrainerName(value) {
  const name = String(value || "").trim();
  return name.toLowerCase() === "diann" ? "Diana" : name;
}

function includeRecord(record, includeDrafts) {
  return includeDrafts || record?.is_published !== false;
}

function latestOverrides(records, includeDrafts) {
  const result = new Map();
  [...(records || [])]
    .filter((item) => includeRecord(item, includeDrafts))
    .sort((a, b) => String(a.updated_date || a.created_date || "").localeCompare(String(b.updated_date || b.created_date || "")))
    .forEach((item) => result.set(`${item.recurring_session_id}:${item.effective_date}`, item));
  return result;
}

export function resolveSchedule({
  recurring = [],
  overrides = [],
  oneOffs = [],
  classes = [],
  trainers = [],
  fromDate,
  toDate,
  includeDrafts = false,
}) {
  if (!fromDate || !toDate || fromDate > toDate) return [];
  const classMap = new Map(classes.map((item) => [item.id, item]));
  const trainerMap = new Map(trainers.map((item) => [item.id, item]));
  const overrideMap = latestOverrides(overrides, includeDrafts);
  const resolved = [];

  for (let date = fromDate; date <= toDate; date = addDays(date, 1)) {
    for (const base of recurring) {
      if (!includeRecord(base, includeDrafts) || base.status === "Archived") continue;
      if (base.day_of_week !== dayName(date)) continue;
      if (base.active_from && date < base.active_from) continue;
      if (base.active_until && date > base.active_until) continue;

      const override = overrideMap.get(`${base.id}:${date}`);
      const classRecord = classMap.get(base.class_id);
      const originalTrainer = trainerMap.get(base.trainer_id);
      const replacementTrainer = trainerMap.get(override?.replacement_trainer_id);
      const hasReplacementAccess = override && Object.prototype.hasOwnProperty.call(override, "replacement_access_types");
      const hasReplacementAgeMin = override && Object.prototype.hasOwnProperty.call(override, "replacement_age_min");
      const hasReplacementAgeMax = override && Object.prototype.hasOwnProperty.call(override, "replacement_age_max");
      const trainerRemoved = override?.remove_trainer === true;

      resolved.push({
        occurrence_id: `recurring:${base.id}:${date}`,
        source_type: "recurring",
        recurring_session_id: base.id,
        override_id: override?.id || "",
        occurrence_date: date,
        day_of_week: base.day_of_week,
        class_id: base.class_id || "",
        class_name: base.class_name || classRecord?.name || "Class",
        trainer_id: trainerRemoved ? "" : (override?.replacement_trainer_id || base.trainer_id || ""),
        trainer_name: trainerRemoved ? "" : normalizeTrainerName(override?.replacement_trainer_name || replacementTrainer?.name || base.trainer_name || originalTrainer?.name),
        trainer_slug: trainerRemoved ? "" : (replacementTrainer?.slug || originalTrainer?.slug || ""),
        start_time: override?.replacement_start_time || base.start_time,
        duration_minutes: override?.replacement_duration_minutes ?? base.duration_minutes ?? classRecord?.duration_minutes,
        difficulty: base.difficulty || classRecord?.difficulty || "",
        studio: normalizeStudio(override?.replacement_studio || base.studio || base.room || classRecord?.default_studio),
        access_types: normalizeAccessTypes(hasReplacementAccess ? override.replacement_access_types : (base.access_types || classRecord?.default_access_types)),
        age_min: hasReplacementAgeMin ? override.replacement_age_min : base.age_min,
        age_max: hasReplacementAgeMax ? override.replacement_age_max : base.age_max,
        is_cancelled: override?.change_type === "Cancel",
        is_modified: override?.change_type === "Modify",
        is_published: base.is_published !== false && (!override || override.is_published !== false),
        notes: override?.notes || base.notes || "",
        base,
        override,
      });
    }
  }

  for (const session of oneOffs) {
    if (!includeRecord(session, includeDrafts)) continue;
    if (!session.session_date || session.session_date < fromDate || session.session_date > toDate) continue;
    const classRecord = classMap.get(session.class_id);
    const trainer = trainerMap.get(session.trainer_id);
    resolved.push({
      occurrence_id: `oneoff:${session.id}`,
      source_type: "one_off",
      one_off_session_id: session.id,
      occurrence_date: session.session_date,
      day_of_week: dayName(session.session_date),
      class_id: session.class_id || "",
      class_name: session.class_name || classRecord?.name || "Class",
      trainer_id: session.trainer_id || "",
      trainer_name: normalizeTrainerName(session.trainer_name || trainer?.name),
      trainer_slug: trainer?.slug || "",
      start_time: session.start_time,
      duration_minutes: session.duration_minutes ?? classRecord?.duration_minutes,
      difficulty: session.difficulty || classRecord?.difficulty || "",
      studio: normalizeStudio(session.studio || classRecord?.default_studio),
      access_types: normalizeAccessTypes(session.access_types || classRecord?.default_access_types),
      age_min: session.age_min,
      age_max: session.age_max,
      is_cancelled: session.status === "Cancelled",
      is_modified: false,
      is_published: session.is_published !== false,
      notes: session.notes || "",
      oneOff: session,
    });
  }

  return resolved.sort((a, b) => a.occurrence_date.localeCompare(b.occurrence_date) || String(a.start_time || "").localeCompare(String(b.start_time || "")) || a.class_name.localeCompare(b.class_name));
}

export function filterSchedule(sessions, { studio = "all", access = "all" } = {}) {
  return (sessions || []).filter((session) => {
    const studioMatches = studio === "all" || session.studio === studio;
    const accessMatches = access === "all" || normalizeAccessTypes(session.access_types).includes(access);
    return studioMatches && accessMatches;
  });
}

export function duplicateOverrideKeys(overrides = []) {
  const counts = new Map();
  for (const item of overrides) {
    const key = `${item.recurring_session_id}:${item.effective_date}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
}
