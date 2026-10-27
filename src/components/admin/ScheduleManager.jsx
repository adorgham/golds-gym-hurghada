import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Copy, ExternalLink, Pencil, Plus, RotateCcw, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ContentManager, { CONTENT_CONFIG } from "@/components/admin/ContentManager";
import {
  ACCESS_TYPES,
  DAYS,
  STUDIOS,
  accessLabel,
  addDays,
  duplicateOverrideKeys,
  formatScheduleDate,
  getCairoToday,
  normalizeAccessTypes,
  normalizeStudio,
  resolveSchedule,
  startOfWeek,
  studioLabel,
  weekDates,
} from "@/lib/schedule";

const EMPTY = { classes: [], trainers: [], recurring: [], overrides: [], oneOffs: [] };

export default function ScheduleManager({ data = EMPTY, setData }) {
  const [section, setSection] = useState("schedule");
  const [weekStart, setWeekStart] = useState(startOfWeek(getCairoToday()));
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dates = weekDates(weekStart);
  const resolved = useMemo(() => resolveSchedule({ ...data, fromDate: weekStart, toDate: addDays(weekStart, 6), includeDrafts: true }), [data, weekStart]);
  const duplicateKeys = duplicateOverrideKeys(data.overrides);

  const change = (key, items) => setData((current) => ({ ...current, [key]: items }));
  const replace = (key, id, value) => change(key, data[key].map((item) => item.id === id ? { ...item, ...value } : item));

  const saveEditor = async (form) => {
    setSaving(true);
    setError("");
    try {
      if (editor.kind === "recurring") {
        const created = await base44.entities.ClassSession.create({ ...form, is_recurring: true, status: "Active" });
        change("recurring", [...data.recurring, created]);
      } else if (editor.kind === "one_off") {
        if (editor.item?.id) {
          const updated = await base44.entities.OneOffSession.update(editor.item.id, form);
          replace("oneOffs", editor.item.id, { ...form, ...updated });
        } else {
          const created = await base44.entities.OneOffSession.create({ ...form, status: "Scheduled" });
          change("oneOffs", [...data.oneOffs, created]);
        }
      } else if (editor.kind === "occurrence") {
        await saveOccurrence(editor.occurrence, form);
      }
      setEditor(null);
    } catch (cause) {
      setError(cause.message || "Could not save the schedule change.");
    } finally {
      setSaving(false);
    }
  };

  const saveOccurrence = async (occurrence, form) => {
    const { scope, ...values } = form;
    if (occurrence.source_type === "one_off") {
      const payload = { ...values, session_date: occurrence.occurrence_date, status: occurrence.is_cancelled ? "Cancelled" : "Scheduled" };
      const updated = await base44.entities.OneOffSession.update(occurrence.one_off_session_id, payload);
      replace("oneOffs", occurrence.one_off_session_id, { ...payload, ...updated });
      return;
    }

    if (scope === "occurrence") {
      const existing = data.overrides.find((item) => item.recurring_session_id === occurrence.recurring_session_id && item.effective_date === occurrence.occurrence_date);
      const payload = {
        recurring_session_id: occurrence.recurring_session_id,
        effective_date: occurrence.occurrence_date,
        change_type: "Modify",
        replacement_trainer_id: values.trainer_id,
        replacement_trainer_name: values.trainer_name,
        remove_trainer: !values.trainer_id,
        replacement_start_time: values.start_time,
        replacement_duration_minutes: values.duration_minutes,
        replacement_studio: values.studio,
        replacement_access_types: values.access_types,
        replacement_age_min: values.age_min,
        replacement_age_max: values.age_max,
        notes: values.notes,
        is_published: values.is_published,
      };
      if (existing) {
        const updated = await base44.entities.ScheduleOverride.update(existing.id, payload);
        replace("overrides", existing.id, { ...payload, ...updated });
      } else {
        const created = await base44.entities.ScheduleOverride.create(payload);
        change("overrides", [...data.overrides, created]);
      }
      return;
    }

    const base = occurrence.base;
    const replacement = {
      ...base,
      class_id: values.class_id,
      class_name: values.class_name,
      trainer_id: values.trainer_id,
      trainer_name: values.trainer_name,
      start_time: values.start_time,
      duration_minutes: values.duration_minutes,
      studio: values.studio,
      access_types: values.access_types,
      age_min: values.age_min,
      age_max: values.age_max,
      notes: values.notes,
      active_from: occurrence.occurrence_date,
      active_until: base.active_until,
      is_published: values.is_published,
      is_recurring: true,
      status: "Active",
    };
    delete replacement.id;
    delete replacement.created_date;
    delete replacement.updated_date;
    delete replacement.created_by;
    if (!replacement.active_until) delete replacement.active_until;

    if (base.active_from && occurrence.occurrence_date <= base.active_from) {
      const updated = await base44.entities.ClassSession.update(base.id, replacement);
      replace("recurring", base.id, { ...replacement, ...updated });
      return;
    }

    const created = await base44.entities.ClassSession.create(replacement);
    const futureOverrides = data.overrides.filter((item) => item.recurring_session_id === base.id && item.effective_date >= occurrence.occurrence_date);
    const migratedOverrides = await Promise.all(futureOverrides.map(async (item) => {
      const updated = await base44.entities.ScheduleOverride.update(item.id, { recurring_session_id: created.id });
      return { ...item, ...updated, recurring_session_id: created.id };
    }));
    const oldEnd = addDays(occurrence.occurrence_date, -1);
    const ended = await base44.entities.ClassSession.update(base.id, { active_until: oldEnd });
    setData((current) => ({
      ...current,
      recurring: current.recurring.map((item) => item.id === base.id ? { ...item, ...ended, active_until: oldEnd } : item).concat(created),
      overrides: current.overrides.map((item) => migratedOverrides.find((updated) => updated.id === item.id) || item),
    }));
  };

  const cancelOccurrence = async (occurrence) => {
    if (occurrence.source_type === "one_off") {
      const status = occurrence.is_cancelled ? "Scheduled" : "Cancelled";
      const updated = await base44.entities.OneOffSession.update(occurrence.one_off_session_id, { status });
      replace("oneOffs", occurrence.one_off_session_id, { ...updated, status });
      return;
    }
    const existing = data.overrides.find((item) => item.recurring_session_id === occurrence.recurring_session_id && item.effective_date === occurrence.occurrence_date);
    if (occurrence.is_cancelled && existing) {
      await base44.entities.ScheduleOverride.delete(existing.id);
      change("overrides", data.overrides.filter((item) => item.id !== existing.id));
      return;
    }
    const payload = { recurring_session_id: occurrence.recurring_session_id, effective_date: occurrence.occurrence_date, change_type: "Cancel", notes: "", is_published: occurrence.base?.is_published !== false };
    if (existing) {
      const updated = await base44.entities.ScheduleOverride.update(existing.id, payload);
      replace("overrides", existing.id, { ...payload, ...updated });
    } else {
      const created = await base44.entities.ScheduleOverride.create(payload);
      change("overrides", [...data.overrides, created]);
    }
  };

  const removeRecord = async (entity, key, item, label) => {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    try {
      await base44.entities[entity].delete(item.id);
      change(key, data[key].filter((candidate) => candidate.id !== item.id));
    } catch (cause) {
      window.alert(cause.message || `Could not delete ${label}.`);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
        <div><h2 className="font-heading text-xl text-white">Class Schedule</h2><p className="text-xs text-white/40">Recurring weekly rules plus date-specific changes and one-off sessions.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to={`/classes/schedule?date=${weekStart}`} target="_blank"><ExternalLink /> Preview website</Link></Button>
          <Button variant="outline" onClick={() => { setError(""); setEditor({ kind: "one_off" }); }}><CalendarDays /> Add one-off</Button>
          <Button className="bg-gold text-obsidian hover:bg-gold/90" onClick={() => { setError(""); setEditor({ kind: "recurring" }); }}><Plus /> Add weekly session</Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 p-4">
        <Button size="sm" variant={section === "schedule" ? "default" : "outline"} onClick={() => setSection("schedule")}>Schedule</Button>
        <Button size="sm" variant={section === "classes" ? "default" : "outline"} onClick={() => setSection("classes")}>Class catalogue</Button>
        <Button size="sm" variant={section === "exceptions" ? "default" : "outline"} onClick={() => setSection("exceptions")}>Exceptions</Button>
      </div>

      {section === "classes" ? (
        <ContentManager {...CONTENT_CONFIG.classes} items={data.classes} onChange={(items) => change("classes", items)} />
      ) : section === "exceptions" ? (
        <Exceptions overrides={data.overrides} oneOffs={data.oneOffs} recurring={data.recurring} onOpen={(item) => { setWeekStart(startOfWeek(item.effective_date || item.session_date)); setSection("schedule"); }} onDelete={removeRecord} />
      ) : (
        <div className="p-5">
          {duplicateKeys.length > 0 && <p className="mb-4 rounded bg-red-500/15 p-3 text-sm text-red-300">Data integrity warning: {duplicateKeys.length} recurring occurrence(s) have duplicate overrides. Resolve these before publishing.</p>}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Button size="icon" variant="outline" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft /></Button><Button variant="outline" onClick={() => setWeekStart(startOfWeek(getCairoToday()))}>Current week</Button><Button size="icon" variant="outline" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight /></Button></div>
            <div className="font-heading text-lg text-white">{formatScheduleDate(weekStart, { day: "numeric", month: "short" })} – {formatScheduleDate(addDays(weekStart, 6), { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
          <div className="space-y-6">{dates.map((date, index) => <AdminDay key={date} date={date} day={DAYS[index]} sessions={resolved.filter((item) => item.occurrence_date === date)} onEdit={(occurrence) => { setError(""); setEditor({ kind: "occurrence", occurrence }); }} onDuplicate={(occurrence) => { setError(""); setEditor({ kind: "recurring", prefill: occurrence }); }} onCancel={cancelOccurrence} />)}</div>
        </div>
      )}

      <ScheduleEditor open={Boolean(editor)} editor={editor} classes={data.classes} trainers={data.trainers} saving={saving} error={error} onClose={() => setEditor(null)} onSave={saveEditor} />
    </div>
  );
}

function AdminDay({ date, day, sessions, onEdit, onDuplicate, onCancel }) {
  return <section><div className="mb-2 flex items-baseline gap-3 border-b border-white/10 pb-2"><h3 className="font-heading text-lg text-white">{day}</h3><span className="text-xs text-white/40">{formatScheduleDate(date, { day: "numeric", month: "long" })}</span></div>{sessions.length === 0 ? <p className="py-3 text-sm text-white/25">No sessions.</p> : <div className="space-y-2">{sessions.map((session) => <div key={session.occurrence_id} className={`flex flex-wrap items-center gap-3 border p-3 ${session.is_cancelled ? "border-red-400/30 bg-red-500/5" : "border-white/10"}`}><div className="w-16 font-heading text-lg text-gold">{session.start_time}</div><div className="min-w-48 flex-1"><div className="font-semibold text-white">{session.class_name} {session.is_cancelled && <span className="ml-2 text-xs uppercase text-red-300">Cancelled</span>}</div><div className="text-xs text-white/45">{session.trainer_name || "Trainer TBA"} · {studioLabel(session.studio)} · {session.access_types.map(accessLabel).join(", ")}</div></div><div className="flex items-center gap-1">{!session.is_published && <span className="mr-2 text-[10px] font-bold uppercase text-amber-300">Draft</span>}<Button size="icon" variant="ghost" title="Edit" onClick={() => onEdit(session)}><Pencil /></Button>{session.source_type === "recurring" && <Button size="icon" variant="ghost" title="Duplicate weekly session" onClick={() => onDuplicate(session)}><Copy /></Button>}<Button size="icon" variant="ghost" title={session.is_cancelled ? "Restore occurrence" : "Cancel this occurrence"} onClick={() => onCancel(session).catch((cause) => window.alert(cause.message || "Could not update this occurrence."))}>{session.is_cancelled ? <RotateCcw /> : <X />}</Button></div></div>)}</div>}</section>;
}

function Exceptions({ overrides, oneOffs, recurring, onOpen, onDelete }) {
  const recurringMap = new Map(recurring.map((item) => [item.id, item]));
  return <div className="space-y-8 p-5"><section><h3 className="mb-3 font-heading text-lg text-white">Date-specific changes</h3><div className="space-y-2">{[...overrides].sort((a, b) => String(b.effective_date).localeCompare(String(a.effective_date))).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border border-white/10 p-3"><button type="button" onClick={() => onOpen(item)} className="text-left"><div className="text-sm text-white">{item.effective_date} · {recurringMap.get(item.recurring_session_id)?.class_name || "Recurring session"}</div><div className="text-xs text-white/40">{item.change_type}{item.is_published === false ? " · Draft" : ""}</div></button><Button size="icon" variant="ghost" title="Delete override" onClick={() => onDelete("ScheduleOverride", "overrides", item, "this override")}><X /></Button></div>)}{overrides.length === 0 && <p className="text-sm text-white/30">No exceptions.</p>}</div></section><section><h3 className="mb-3 font-heading text-lg text-white">One-off sessions</h3><div className="space-y-2">{[...oneOffs].sort((a, b) => String(b.session_date).localeCompare(String(a.session_date))).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border border-white/10 p-3"><button type="button" onClick={() => onOpen(item)} className="text-left"><div className="text-sm text-white">{item.session_date} · {item.start_time} · {item.class_name}</div><div className="text-xs text-white/40">{item.status}{item.is_published === false ? " · Draft" : ""}</div></button><Button size="icon" variant="ghost" title="Delete one-off" onClick={() => onDelete("OneOffSession", "oneOffs", item, "this one-off session")}><X /></Button></div>)}{oneOffs.length === 0 && <p className="text-sm text-white/30">No one-off sessions.</p>}</div></section></div>;
}

function ScheduleEditor({ open, editor, classes, trainers, saving, error, onClose, onSave }) {
  const [form, setForm] = useState(/** @type {Record<string, any>} */ ({}));
  useEffect(() => {
    if (!editor) return;
    const source = editor.occurrence || editor.prefill || editor.item || {};
    const kind = editor.kind;
    setForm({
      class_id: source.class_id || "",
      trainer_id: source.trainer_id || "",
      day_of_week: source.day_of_week || DAYS[0],
      session_date: source.session_date || source.occurrence_date || getCairoToday(),
      start_time: source.start_time || "",
      duration_minutes: source.duration_minutes || "",
      studio: normalizeStudio(source.studio || source.room) || "",
      access_types: normalizeAccessTypes(source.access_types),
      age_min: source.age_min ?? "",
      age_max: source.age_max ?? "",
      active_from: source.active_from || getCairoToday(),
      active_until: source.active_until || "",
      notes: source.notes || "",
      is_published: editor.prefill ? false : source.is_published === true,
      scope: kind === "occurrence" ? "occurrence" : "",
    });
  }, [editor]);
  if (!editor) return null;

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const chooseClass = (id) => {
    const selected = classes.find((item) => item.id === id);
    setForm((current) => ({ ...current, class_id: id, duration_minutes: selected?.duration_minutes || current.duration_minutes, studio: selected?.default_studio || current.studio, access_types: selected?.default_access_types || current.access_types }));
  };
  const submit = (event) => {
    event.preventDefault();
    const selectedClass = classes.find((item) => item.id === form.class_id);
    const trainer = trainers.find((item) => item.id === form.trainer_id);
    const shared = { class_id: form.class_id, class_name: selectedClass?.name || "", trainer_id: form.trainer_id, trainer_name: trainer?.name || "", start_time: form.start_time, ...(form.duration_minutes ? { duration_minutes: Number(form.duration_minutes) } : {}), studio: form.studio, access_types: form.access_types, ...(form.age_min !== "" ? { age_min: Number(form.age_min) } : {}), ...(form.age_max !== "" ? { age_max: Number(form.age_max) } : {}), notes: form.notes, is_published: form.is_published };
    if (editor.kind === "recurring") onSave({ ...shared, day_of_week: form.day_of_week, active_from: form.active_from, ...(form.active_until ? { active_until: form.active_until } : {}) });
    else if (editor.kind === "one_off") onSave({ ...shared, session_date: form.session_date });
    else onSave({ ...shared, scope: form.scope });
  };
  const title = editor.kind === "recurring" ? "Add weekly session" : editor.kind === "one_off" ? (editor.item ? "Edit one-off session" : "Add one-off session") : "Edit schedule occurrence";

  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto border-white/15 bg-obsidian text-white"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription className="text-white/50">New and amended sessions can remain drafts until the timetable is approved.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4">{error && <p className="rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}{classes.length === 0 && <p className="rounded bg-amber-500/15 p-3 text-sm text-amber-200">Create a class in the Class catalogue before adding schedule sessions.</p>}<div className="grid gap-4 sm:grid-cols-2"><Field label="Class"><select required value={form.class_id || ""} onChange={(event) => chooseClass(event.target.value)} className={selectClass}><option value="">Select class…</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Trainer (optional)"><select value={form.trainer_id || ""} onChange={(event) => set("trainer_id", event.target.value)} className={selectClass}><option value="">Unassigned / TBA</option>{trainers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>{editor.kind === "recurring" && <Field label="Day"><select required value={form.day_of_week || DAYS[0]} onChange={(event) => set("day_of_week", event.target.value)} className={selectClass}>{DAYS.map((day) => <option key={day}>{day}</option>)}</select></Field>}{editor.kind === "one_off" && <Field label="Date"><Input required type="date" value={form.session_date || ""} onChange={(event) => set("session_date", event.target.value)} /></Field>}<Field label="Start time"><Input required type="time" value={form.start_time || ""} onChange={(event) => set("start_time", event.target.value)} /></Field><Field label="Duration (optional)"><Input min="1" type="number" value={form.duration_minutes || ""} onChange={(event) => set("duration_minutes", event.target.value)} /></Field><Field label="Studio / location"><select required value={form.studio || ""} onChange={(event) => set("studio", event.target.value)} className={selectClass}><option value="">Select studio…</option>{STUDIOS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Minimum age (optional)"><Input min="0" type="number" value={form.age_min ?? ""} onChange={(event) => set("age_min", event.target.value)} /></Field><Field label="Maximum age (optional)"><Input min={form.age_min || 0} type="number" value={form.age_max ?? ""} onChange={(event) => set("age_max", event.target.value)} /></Field>{editor.kind === "recurring" && <><Field label="Active from"><Input required type="date" value={form.active_from || ""} onChange={(event) => set("active_from", event.target.value)} /></Field><Field label="Active until (optional)"><Input type="date" min={form.active_from} value={form.active_until || ""} onChange={(event) => set("active_until", event.target.value)} /></Field></>}{editor.kind === "occurrence" && editor.occurrence.source_type === "recurring" && <Field label="Apply change to"><select value={form.scope || "occurrence"} onChange={(event) => set("scope", event.target.value)} className={selectClass}><option value="occurrence">This occurrence only</option><option value="future">This and future occurrences</option></select></Field>}</div><fieldset><legend className="mb-2 text-sm text-white/70">Members & Access</legend><div className="flex flex-wrap gap-3">{ACCESS_TYPES.filter((item) => item.value !== "all").map((item) => <label key={item.value} className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={form.access_types?.includes(item.value) || false} onChange={(event) => { const next = event.target.checked ? [...(form.access_types || []).filter((value) => value !== "all"), item.value] : (form.access_types || []).filter((value) => value !== item.value); set("access_types", next.length ? next : ["all"]); }} /> {item.label}</label>)}</div><p className="mt-1 text-xs text-white/35">Leave all unchecked for unrestricted access.</p></fieldset><Field label="Public schedule note (optional)"><textarea value={form.notes || ""} onChange={(event) => set("notes", event.target.value)} className="min-h-20 w-full rounded-md border border-white/15 bg-transparent p-3 text-sm" /></Field><label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_published || false} onChange={(event) => set("is_published", event.target.checked)} /> Published on the public website</label><div className="flex justify-end gap-2 border-t border-white/10 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button disabled={saving || classes.length === 0} className="bg-gold text-obsidian hover:bg-gold/90">{saving ? "Saving…" : "Save schedule"}</Button></div></form></DialogContent></Dialog>;
}

const selectClass = "h-9 w-full rounded-md border border-white/15 bg-obsidian px-3 text-sm text-white";
function Field({ label, children }) { return <label className="space-y-1.5 text-sm text-white/70"><span>{label}</span>{children}</label>; }
