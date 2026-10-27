export const BASELINE_EFFECTIVE_DATE = "2026-10-01";

export const TRAINER_NAMES = [
  "Diana", "Jeyna", "Luba", "Zsanett", "Veronica", "Gogo", "Gabriella",
  "Eva", "Samantha", "Ramadan", "Hamees", "Waleed", "Ibrahim",
];

const PLACEHOLDER_TRAINERS = new Set([
  "Ahmed Mohamed", "Omar Khalil", "Sara Hassan", "Karim Adel", "Mona Said", "Lina Farouk",
]);

// day, time, class, trainer, studio, access codes, minimum age, maximum age
const RAW_ROWS = [
  ["Saturday", "10:00", "Tabata", "Diana", "aerobics", ["ladies_only"]],
  ["Saturday", "11:15", "Pilates", "Jeyna", "aerobics", ["ladies_only"]],
  ["Saturday", "12:15", "Air Yoga Group", "Luba", "aerobics", ["prepaid"]],
  ["Saturday", "18:00", "Zumba", "Zsanett", "aerobics", ["ladies_only"]],
  ["Saturday", "19:00", "Hatha Yoga", "Zsanett", "aerobics", ["ladies_only"]],
  ["Sunday", "09:30", "Air Yoga Group", null, "aerobics", ["prepaid"]],
  ["Sunday", "11:00", "Muscle Factory", "Veronica", "aerobics", ["ladies_only"]],
  ["Sunday", "12:15", "Private Air Yoga", "Luba", "aerobics", ["prepaid"]],
  ["Sunday", "13:00", "Private Air Yoga", "Luba", "aerobics", ["prepaid"]],
  ["Sunday", "19:15", "Step Body Workout", "Diana", "aerobics", ["ladies_only"]],
  ["Sunday", "20:15", "Flex & Flow", "Diana", "aerobics", ["ladies_only"]],
  ["Monday", "10:00", "Tae Bo", "Diana", "aerobics", ["ladies_only"]],
  ["Monday", "11:00", "Stretching", "Diana", "aerobics", ["ladies_only"]],
  ["Monday", "12:00", "Belly Dance", "Gabriella", "aerobics", ["ladies_only"]],
  ["Monday", "13:00", "Private Air Yoga", "Luba", "aerobics", ["prepaid"]],
  ["Monday", "18:00", "Circuit Training", "Gogo", "aerobics", ["ladies_only"]],
  ["Monday", "19:00", "Functional Fitness", "Veronica", "floor", ["all"]],
  ["Tuesday", "10:00", "Fat Burning", "Eva", "aerobics", ["ladies_only"]],
  ["Tuesday", "11:15", "Flex & Flow", "Diana", "aerobics", ["ladies_only"]],
  ["Tuesday", "12:15", "Private Air Yoga", "Luba", "aerobics", ["prepaid"]],
  ["Tuesday", "13:00", "Private Air Yoga", "Luba", "aerobics", ["prepaid"]],
  ["Tuesday", "19:00", "Body Pump", "Eva", "aerobics", ["ladies_only"]],
  ["Wednesday", "09:30", "Air Yoga Group", null, "aerobics", ["prepaid"]],
  ["Wednesday", "11:00", "Step Body Workout", "Eva", "aerobics", ["ladies_only"]],
  ["Wednesday", "13:00", "Private Air Yoga on Hammocks", "Luba", "aerobics", ["prepaid"]],
  ["Wednesday", "19:00", "Tae Bo", "Diana", "aerobics", ["all"]],
  ["Wednesday", "20:15", "Belly Dance", "Samantha", "aerobics", ["ladies_only"]],
  ["Thursday", "10:00", "Sweat & Shine", "Veronica", "aerobics", ["ladies_only"]],
  ["Thursday", "11:15", "Mobility", "Jeyna", "aerobics", ["ladies_only"]],
  ["Thursday", "12:15", "Private Air Yoga", "Luba", "aerobics", ["prepaid"]],
  ["Thursday", "13:00", "Private Air Yoga", "Luba", "aerobics", ["prepaid"]],
  ["Thursday", "18:00", "Dance Latin Aerobic", "Eva", "aerobics", ["ladies_only"]],
  ["Thursday", "19:15", "Body Pump", "Eva", "aerobics", ["ladies_only"]],
  ["Thursday", "19:00", "Explosive Fit", "Ramadan", "floor", ["all"]],
  ["Thursday", "20:15", "Stretching & Flexibility", "Eva", "aerobics", ["all"]],
  ["Saturday", "19:00", "Spinning", "Hamees", "spinning", ["all"]],
  ["Monday", "10:00", "Spinning", "Hamees", "spinning", ["ladies_only"]],
  ["Monday", "19:00", "Spinning", "Hamees", "spinning", ["all"]],
  ["Wednesday", "19:00", "Spinning", "Hamees", "spinning", ["ladies_only"]],
  ["Saturday", "18:00", "Kids Kick Boxing", null, "martial_arts", ["kids"], 4, 8],
  ["Saturday", "19:00", "Kids Kick Boxing", null, "martial_arts", ["prepaid", "kids"], 9, 13],
  ["Saturday", "20:00", "Adult Kick Boxing", "Waleed", "martial_arts", ["prepaid"]],
  ["Sunday", "18:00", "MMA & Boxing", null, "martial_arts", ["kids"], 4, 6],
  ["Sunday", "19:00", "MMA & Boxing", null, "martial_arts", ["kids"], 6, 12],
  ["Sunday", "20:00", "Adult Boxing", "Ibrahim", "martial_arts", ["prepaid"]],
  ["Wednesday", "18:00", "Kids Kick Boxing", null, "martial_arts", ["kids"], 4, 8],
  ["Wednesday", "19:00", "Kids Kick Boxing", null, "martial_arts", ["prepaid", "kids"], 9, 13],
  ["Wednesday", "20:00", "Adult Kick Boxing", "Waleed", "martial_arts", ["prepaid"]],
  ["Thursday", "18:00", "MMA & Boxing", null, "martial_arts", ["kids"], 4, 6],
  ["Thursday", "19:00", "MMA & Boxing", null, "martial_arts", ["kids"], 6, 12],
  ["Thursday", "20:00", "Adult Boxing", "Ibrahim", "martial_arts", ["prepaid"]],
];

function slugify(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function canonicalName(value) {
  const name = String(value || "").trim();
  return name.toLowerCase() === "diann" ? "Diana" : name;
}

export const SCHEDULE_ROWS = RAW_ROWS.map(([day_of_week, start_time, class_name, trainer_name, studio, access_types, age_min, age_max]) => ({
  day_of_week,
  start_time,
  class_name,
  trainer_name,
  studio,
  access_types,
  ...(age_min != null ? { age_min } : {}),
  ...(age_max != null ? { age_max } : {}),
  source_key: `october-2026:${day_of_week.toLowerCase()}:${start_time}:${studio}:${slugify(class_name)}`,
}));

export const CLASS_NAMES = [...new Set(SCHEDULE_ROWS.map((row) => row.class_name))];

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

export async function migrateOctober2026Schedule(client, { apply = false } = {}) {
  const [trainers, classes, sessions] = await Promise.all([
    client.entities.Trainer.list("created_date", 5000, 0),
    client.entities.FitnessClass.list("created_date", 5000, 0),
    client.entities.ClassSession.list("created_date", 5000, 0),
  ]);

  const trainerNames = trainers.map((item) => canonicalName(item.name).toLowerCase());
  const classNames = classes.map((item) => String(item.name || "").trim().toLowerCase());
  const duplicateTrainers = duplicateValues(trainerNames);
  const duplicateClasses = duplicateValues(classNames);
  if (duplicateTrainers.length || duplicateClasses.length) {
    throw new Error(`Resolve canonical duplicates first. Trainers: ${duplicateTrainers.join(", ") || "none"}; classes: ${duplicateClasses.join(", ") || "none"}`);
  }

  const trainerMap = new Map(trainers.map((item) => [canonicalName(item.name).toLowerCase(), item]));
  const classMap = new Map(classes.map((item) => [String(item.name || "").trim().toLowerCase(), item]));
  const placeholderRecords = trainers.filter((item) => PLACEHOLDER_TRAINERS.has(item.name) && item.is_published !== false);
  const missingTrainers = TRAINER_NAMES.filter((name) => !trainerMap.has(name.toLowerCase()));
  const missingClasses = CLASS_NAMES.filter((name) => !classMap.has(name.toLowerCase()));
  const existingSourceKeys = new Set(sessions.map((item) => item.source_key).filter(Boolean));
  const missingSessions = SCHEDULE_ROWS.filter((row) => !existingSourceKeys.has(row.source_key));

  const plan = {
    apply,
    existing: { trainers: trainers.length, classes: classes.length, recurring_sessions: sessions.length },
    unpublish_placeholder_trainers: placeholderRecords.map((item) => ({ id: item.id, name: item.name })),
    create_trainers: missingTrainers,
    create_classes: missingClasses,
    create_recurring_sessions: missingSessions.length,
    baseline_effective_date: BASELINE_EFFECTIVE_DATE,
  };
  if (!apply) return plan;

  if (placeholderRecords.length) {
    await client.entities.Trainer.bulkUpdate(placeholderRecords.map((item) => ({ id: item.id, is_published: false, is_featured: false })));
  }
  if (missingTrainers.length) {
    const created = await client.entities.Trainer.bulkCreate(missingTrainers.map((name, index) => ({
      name,
      slug: slugify(name),
      display_order: 100 + index,
      is_featured: false,
      is_published: false,
    })));
    for (const item of created) trainerMap.set(canonicalName(item.name).toLowerCase(), item);
  }
  if (missingClasses.length) {
    const created = await client.entities.FitnessClass.bulkCreate(missingClasses.map((name) => ({
      name,
      slug: slugify(name),
      category: "Group Class",
      is_published: true,
    })));
    for (const item of created) classMap.set(String(item.name).trim().toLowerCase(), item);
  }

  if (missingSessions.length) {
    await client.entities.ClassSession.bulkCreate(missingSessions.map((row) => {
      const trainer = row.trainer_name ? trainerMap.get(canonicalName(row.trainer_name).toLowerCase()) : null;
      const classRecord = classMap.get(row.class_name.toLowerCase());
      if (!classRecord) throw new Error(`Missing class mapping for ${row.class_name}`);
      if (row.trainer_name && !trainer) throw new Error(`Missing trainer mapping for ${row.trainer_name}`);
      return {
        class_id: classRecord.id,
        class_name: row.class_name,
        ...(trainer ? { trainer_id: trainer.id, trainer_name: trainer.name } : {}),
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        studio: row.studio,
        access_types: row.access_types,
        ...(row.age_min != null ? { age_min: row.age_min } : {}),
        ...(row.age_max != null ? { age_max: row.age_max } : {}),
        source_key: row.source_key,
        active_from: BASELINE_EFFECTIVE_DATE,
        status: "Active",
        is_recurring: true,
        is_published: true,
      };
    }));
  }

  return { ...plan, applied: true };
}

if (typeof base44 !== "undefined") {
  const apply = typeof Deno !== "undefined" && Deno.env.get("APPLY_SCHEDULE_MIGRATION") === "1";
  console.log(JSON.stringify(await migrateOctober2026Schedule(base44, { apply }), null, 2));
}
