import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import SectionHeading from "@/components/SectionHeading";
import ContentState from "@/components/ContentState";
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import {
  ACCESS_TYPES,
  DAYS,
  STUDIOS,
  accessLabel,
  addDays,
  filterSchedule,
  formatScheduleDate,
  getCairoToday,
  isValidDateKey,
  resolveSchedule,
  startOfWeek,
  studioLabel,
  weekDates,
} from "@/lib/schedule";

const VALID_STUDIOS = new Set(["all", ...STUDIOS.map((item) => item.value)]);
const VALID_ACCESS = new Set(ACCESS_TYPES.map((item) => item.value));

export default function ClassSchedule() {
  useSeo({
    title: "Group Class Schedule",
    description: "View the current published weekly group-class schedule at Gold's Gym Hurghada, including times, trainers, studios and access information.",
    canonical: "https://goldsgymhurghada.com/classes/schedule",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Classes", url: "https://goldsgymhurghada.com/classes/schedule" }]),
  });

  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ recurring: [], overrides: [], oneOffs: [], classes: [], trainers: [] });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const today = getCairoToday();
  const view = params.get("view") === "day" ? "day" : "week";
  const requestedDate = params.get("date");
  const anchorDate = isValidDateKey(requestedDate) ? requestedDate : today;
  const studio = VALID_STUDIOS.has(params.get("studio")) ? params.get("studio") : "all";
  const access = VALID_ACCESS.has(params.get("access")) ? params.get("access") : "all";
  const weekStart = startOfWeek(anchorDate);
  const dates = weekDates(anchorDate);

  useEffect(() => {
    const next = new URLSearchParams(params);
    let changed = false;
    if (requestedDate && !isValidDateKey(requestedDate)) { next.delete("date"); changed = true; }
    if (params.has("studio") && !VALID_STUDIOS.has(params.get("studio"))) { next.delete("studio"); changed = true; }
    if (params.has("access") && !VALID_ACCESS.has(params.get("access"))) { next.delete("access"); changed = true; }
    if (params.has("view") && !["week", "day"].includes(params.get("view"))) { next.delete("view"); changed = true; }
    if (changed) setParams(next, { replace: true });
  }, [params, requestedDate, setParams]);

  useEffect(() => {
    Promise.all([
      base44.entities.ClassSession.list(),
      base44.entities.ScheduleOverride.list(),
      base44.entities.OneOffSession.list(),
      base44.entities.FitnessClass.list(),
      base44.entities.Trainer.list(),
    ])
      .then(([recurring, overrides, oneOffs, classes, trainers]) => setData({ recurring, overrides, oneOffs, classes, trainers }))
      .catch(() => { setData({ recurring: [], overrides: [], oneOffs: [], classes: [], trainers: [] }); setFailed(true); })
      .finally(() => setLoading(false));
  }, []);

  const resolved = useMemo(() => resolveSchedule({
    ...data,
    fromDate: weekStart,
    toDate: addDays(weekStart, 6),
  }), [data, weekStart]);
  const filtered = useMemo(() => filterSchedule(resolved, { studio, access }), [resolved, studio, access]);

  const updateParams = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "view" && value === "week")) next.delete(key);
      else next.set(key, value);
    });
    setParams(next);
  };

  const move = (direction) => {
    const amount = view === "week" ? 7 : 1;
    updateParams({ date: addDays(anchorDate, direction * amount) });
  };

  return (
    <div className="pt-28">
      <section className="px-5 py-12 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading eyebrow="The Pulse Schedule" title="GROUP CLASS" accent="SCHEDULE" subtitle="Browse the published timetable by date, studio and members/access classification." />
        </div>
      </section>

      <section className="px-5 pb-8 lg:px-10">
        <div className="mx-auto max-w-[1400px] space-y-5 border border-white/10 bg-white/[0.02] p-4 lg:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterGroup label="View">
              {[{ value: "week", label: "Week" }, { value: "day", label: "Day" }].map((item) => (
                <FilterButton key={item.value} active={view === item.value} onClick={() => updateParams({ view: item.value })}>{item.label}</FilterButton>
              ))}
            </FilterGroup>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => move(-1)} aria-label={`Previous ${view}`} className="border border-white/10 p-2 text-white/60 hover:border-gold hover:text-gold"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => updateParams({ date: today })} className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:border-gold hover:text-gold">Today</button>
              <button type="button" onClick={() => move(1)} aria-label={`Next ${view}`} className="border border-white/10 p-2 text-white/60 hover:border-gold hover:text-gold"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <FilterGroup label="Studio">
            <FilterButton active={studio === "all"} onClick={() => updateParams({ studio: "all" })}>All</FilterButton>
            {STUDIOS.map((item) => <FilterButton key={item.value} active={studio === item.value} onClick={() => updateParams({ studio: item.value })}>{item.shortLabel}</FilterButton>)}
          </FilterGroup>

          <FilterGroup label="Members & Access">
            {ACCESS_TYPES.map((item) => <FilterButton key={item.value} active={access === item.value} onClick={() => updateParams({ access: item.value })}>{item.label}</FilterButton>)}
          </FilterGroup>
        </div>
      </section>

      <section className="px-5 pb-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{view === "week" ? "Week" : formatScheduleDate(anchorDate, { weekday: "long" })}</p>
            <h2 className="font-heading text-2xl text-white">
              {view === "week"
                ? `${formatScheduleDate(weekStart, { day: "numeric", month: "short" })} – ${formatScheduleDate(addDays(weekStart, 6), { day: "numeric", month: "short", year: "numeric" })}`
                : formatScheduleDate(anchorDate, { day: "numeric", month: "long", year: "numeric" })}
            </h2>
          </div>
          {(studio !== "all" || access !== "all") && <button type="button" onClick={() => updateParams({ studio: "all", access: "all" })} className="text-xs font-semibold uppercase tracking-wide text-gold hover:underline">Clear filters</button>}
        </div>
      </section>

      {loading ? (
        <section className="px-5 pb-24 lg:px-10"><p className="mx-auto max-w-[1400px] py-16 text-center text-white/40">Loading…</p></section>
      ) : failed && resolved.length === 0 ? (
        <section className="px-5 pb-24 lg:px-10"><div className="mx-auto max-w-[1400px]"><ContentState title="Schedule temporarily unavailable" message="Contact the gym for the latest confirmed class times." /></div></section>
      ) : resolved.length === 0 ? (
        <section className="px-5 pb-24 lg:px-10"><div className="mx-auto max-w-[1400px]"><ContentState title="The class timetable is being updated" message="No sessions are published for this period yet. Contact the gym for confirmed times." /></div></section>
      ) : filtered.length === 0 ? (
        <section className="px-5 pb-24 lg:px-10"><div className="mx-auto max-w-[1400px]"><ContentState title="No classes match these filters" message="Clear one or both filters to see the published schedule for this period." actionTo={null} /></div></section>
      ) : view === "week" ? (
        <WeekView dates={dates} sessions={filtered} />
      ) : (
        <DayView date={anchorDate} sessions={filtered.filter((item) => item.occurrence_date === anchorDate)} onChooseDate={(date) => updateParams({ date })} week={dates} />
      )}

      {!loading && resolved.length > 0 && <section className="px-5 pb-24 lg:px-10">
        <div className="mx-auto max-w-[1400px] border-l-2 border-gold pl-5 text-sm text-white/55">
          Schedule times may change. Cancelled and amended sessions are labelled explicitly. Booking and live capacity are not shown on this website yet.
        </div>
      </section>}
    </div>
  );
}

function FilterGroup({ label, children }) {
  return <fieldset><legend className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{label}</legend><div className="flex gap-2 overflow-x-auto hide-scrollbar">{children}</div></fieldset>;
}

function FilterButton({ active, onClick, children }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`whitespace-nowrap border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${active ? "border-gold bg-gold text-obsidian" : "border-white/10 text-white/60 hover:border-gold hover:text-gold"}`}>{children}</button>;
}

function WeekView({ dates, sessions }) {
  return (
    <section className="px-5 pb-24 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="hidden grid-cols-7 gap-px border border-white/10 bg-white/10 md:grid">
          {dates.map((date, index) => <DayColumn key={date} date={date} day={DAYS[index]} sessions={sessions.filter((item) => item.occurrence_date === date)} />)}
        </div>
        <div className="space-y-6 md:hidden">
          {dates.map((date, index) => <MobileDay key={date} date={date} day={DAYS[index]} sessions={sessions.filter((item) => item.occurrence_date === date)} />)}
        </div>
      </div>
    </section>
  );
}

function DayColumn({ date, day, sessions }) {
  return <div className="min-w-0 bg-obsidian"><div className="border-b border-white/10 p-3"><div className="font-heading text-sm text-white">{day.slice(0, 3).toUpperCase()}</div><div className="text-[10px] text-white/40">{formatScheduleDate(date, { day: "numeric", month: "short" })} · {sessions.length}</div></div><div className="space-y-2 p-2">{sessions.map((session) => <SessionCard key={session.occurrence_id} session={session} compact />)}{sessions.length === 0 && <div className="py-8 text-center text-xs text-white/20">—</div>}</div></div>;
}

function MobileDay({ date, day, sessions }) {
  if (sessions.length === 0) return null;
  return <div><div className="mb-3 flex items-baseline justify-between border-b border-white/10 pb-2"><h3 className="font-heading text-xl text-white">{day}</h3><span className="text-xs text-white/40">{formatScheduleDate(date, { day: "numeric", month: "long" })}</span></div><div className="space-y-3">{sessions.map((session) => <SessionCard key={session.occurrence_id} session={session} />)}</div></div>;
}

function DayView({ date, sessions, week, onChooseDate }) {
  return <section className="px-5 pb-24 lg:px-10"><div className="mx-auto max-w-[1000px]"><div className="mb-6 flex gap-2 overflow-x-auto hide-scrollbar">{week.map((item) => <button type="button" key={item} onClick={() => onChooseDate(item)} aria-pressed={date === item} className={`min-w-20 border px-3 py-2 text-center ${date === item ? "border-gold bg-gold text-obsidian" : "border-white/10 text-white/60"}`}><span className="block text-[10px] font-semibold uppercase">{formatScheduleDate(item, { weekday: "short" })}</span><span className="font-heading text-lg">{formatScheduleDate(item, { day: "numeric" })}</span></button>)}</div>{sessions.length > 0 ? <div className="space-y-3">{sessions.map((session) => <SessionCard key={session.occurrence_id} session={session} />)}</div> : <ContentState compact title="No matching classes on this day" message="Choose another day or clear the active filters." actionTo={null} />}</div></section>;
}

function SessionCard({ session, compact = false }) {
  const badges = session.access_types.filter((item) => item !== "all");
  return (
    <article className={`border p-3 ${session.is_cancelled ? "border-red-400/30 bg-red-500/5" : "border-white/10 bg-gold/[0.06]"}`}>
      <div className="flex items-start justify-between gap-2">
        <time className={`text-xs font-bold tracking-wide ${session.is_cancelled ? "text-red-300 line-through" : "text-gold"}`}>{session.start_time}</time>
        <div className="flex flex-wrap justify-end gap-1">
          {session.source_type === "one_off" && <span className="border border-blue-300/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-200">Special</span>}
          {session.is_modified && <span className="border border-gold/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold">Updated</span>}
          {session.is_cancelled && <span className="border border-red-400/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-300">Cancelled</span>}
        </div>
      </div>
      <h3 className={`mt-1 font-heading ${compact ? "text-sm" : "text-lg"} leading-tight text-white ${session.is_cancelled ? "line-through opacity-60" : ""}`}>{session.class_name}</h3>
      <div className="mt-2 space-y-1 text-[10px] text-white/55">
        <div className="flex items-center gap-1"><User className="h-3 w-3" /> {session.trainer_slug ? <Link to={`/trainers/${session.trainer_slug}`} className="hover:text-gold">{session.trainer_name}</Link> : session.trainer_name || "Trainer TBA"}</div>
        {(session.duration_minutes || session.difficulty) && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.duration_minutes ? `${session.duration_minutes} min` : session.difficulty}{session.duration_minutes && session.difficulty ? ` · ${session.difficulty}` : ""}</div>}
        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {studioLabel(session.studio)}</div>
      </div>
      {badges.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{badges.map((item) => <span key={item} className="bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-obsidian">{accessLabel(item)}</span>)}</div>}
      {(session.age_min != null || session.age_max != null) && <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/65">Ages {session.age_min ?? "…"}–{session.age_max ?? "…"}</p>}
      {session.notes && <p className="mt-2 text-[10px] text-white/45">{session.notes}</p>}
    </article>
  );
}
