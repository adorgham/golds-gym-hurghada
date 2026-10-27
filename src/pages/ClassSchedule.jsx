import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import SectionHeading from "@/components/SectionHeading";
import ContentState from "@/components/ContentState";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
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
const STUDIO_TONES = {
  aerobics: { rail: "border-l-fuchsia-400", dot: "bg-fuchsia-400", text: "text-fuchsia-300", border: "border-fuchsia-400/50" },
  spinning: { rail: "border-l-cyan-400", dot: "bg-cyan-400", text: "text-cyan-300", border: "border-cyan-400/50" },
  martial_arts: { rail: "border-l-orange-400", dot: "bg-orange-400", text: "text-orange-300", border: "border-orange-400/50" },
  floor: { rail: "border-l-yellow-300", dot: "bg-yellow-300", text: "text-yellow-200", border: "border-yellow-300/50" },
};
const ACCESS_TONES = {
  prepaid: "border-green-400/50 bg-green-500/15 text-green-300",
  ladies_only: "border-pink-400/50 bg-pink-500/15 text-pink-300",
  kids: "border-blue-400/50 bg-blue-500/15 text-blue-300",
};

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
      <section className="px-5 pb-8 pt-12 lg:px-10 lg:pb-10 lg:pt-14">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading eyebrow="Group Fitness" title="GROUP CLASS" accent="SCHEDULE" subtitle="Find your class and keep moving. Filter by day, studio or access to find the right session for your goals." />
        </div>
      </section>

      <section className="px-5 pb-5 lg:px-10">
        <div className="mx-auto max-w-[1400px] border border-white/10 bg-white/[0.025] p-4 lg:p-5">
          <div className="grid min-w-0 gap-5 lg:grid-cols-[auto_1fr_1fr_auto] lg:items-end lg:gap-6">
            <FilterGroup label="View">
              {[{ value: "week", label: "Week" }, { value: "day", label: "Day" }].map((item) => (
                <FilterButton key={item.value} active={view === item.value} onClick={() => updateParams({ view: item.value })}>{item.label}</FilterButton>
              ))}
            </FilterGroup>
          <FilterGroup label="Studio (Location)">
            <FilterButton active={studio === "all"} onClick={() => updateParams({ studio: "all" })}>All</FilterButton>
            {STUDIOS.map((item) => <FilterButton key={item.value} active={studio === item.value} tone={STUDIO_TONES[item.value]} onClick={() => updateParams({ studio: item.value })}>{item.shortLabel}</FilterButton>)}
          </FilterGroup>

          <FilterGroup label="Members & Access">
            {ACCESS_TYPES.map((item) => <FilterButton key={item.value} active={access === item.value} tone={item.value === "all" ? null : { border: ACCESS_TONES[item.value].split(" ")[0], text: ACCESS_TONES[item.value].split(" ")[2] }} onClick={() => updateParams({ access: item.value })}>{item.label}</FilterButton>)}
          </FilterGroup>
            <div className="flex items-center gap-2 lg:justify-end">
              <button type="button" onClick={() => move(-1)} aria-label={`Previous ${view}`} className="border border-white/10 p-2.5 text-white/60 hover:border-gold hover:text-gold"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => updateParams({ date: today })} className="border border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/70 hover:border-gold hover:text-gold">Today</button>
              <button type="button" onClick={() => move(1)} aria-label={`Next ${view}`} className="border border-white/10 p-2.5 text-white/60 hover:border-gold hover:text-gold"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>

      <ScheduleLegend />

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
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="border-l-2 border-gold pl-5 text-sm text-white/55">Schedule times may change. Cancelled and amended sessions are labelled explicitly. Booking and live capacity are not shown on this website yet.</div>
          <div className="flex flex-col gap-4 border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4"><CalendarDays className="h-7 w-7 text-gold" /><div><p className="font-heading text-xl text-white">NEW HERE?</p><p className="text-sm text-white/45">Choose the access option that fits your stay and start training.</p></div></div>
            <Link to="/memberships" className="border border-gold px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-obsidian">View memberships →</Link>
          </div>
        </div>
      </section>}
    </div>
  );
}

function FilterGroup({ label, children }) {
  return <fieldset className="min-w-0 max-w-full"><legend className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{label}</legend><div className="flex max-w-full gap-2 overflow-x-auto hide-scrollbar">{children}</div></fieldset>;
}

function FilterButton({ active, tone = null, onClick, children }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`whitespace-nowrap border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${active ? "border-gold bg-gold text-obsidian" : `${tone?.border || "border-white/10"} ${tone?.text || "text-white/60"} hover:border-gold hover:text-gold`}`}>{children}</button>;
}

function ScheduleLegend() {
  return <section className="px-5 pb-5 lg:px-10"><div className="mx-auto grid max-w-[1400px] gap-5 border border-white/10 bg-white/[0.025] p-4 lg:grid-cols-2 lg:p-5"><LegendGroup title="Studio (Location)" subtitle="Where the class takes place.">{STUDIOS.map((item) => <LegendItem key={item.value} color={STUDIO_TONES[item.value].dot} title={item.label} description={{ aerobics: "Dance, cardio and group fitness", spinning: "Indoor cycling classes", martial_arts: "Combat and self-defence", floor: "On the main gym floor" }[item.value]} />)}</LegendGroup><LegendGroup title="Members & Access" subtitle="Who can join this class.">{ACCESS_TYPES.filter((item) => item.value !== "all").map((item) => <LegendItem key={item.value} color={{ prepaid: "bg-green-400", ladies_only: "bg-pink-400", kids: "bg-blue-400" }[item.value]} title={item.label} description={{ prepaid: "Requires a class pass", ladies_only: "For ladies only", kids: "Youth session; ages shown per class" }[item.value]} />)}</LegendGroup></div></section>;
}

function LegendGroup({ title, subtitle, children }) {
  return <div className="min-w-0"><div className="mb-3"><p className="font-heading text-sm uppercase text-white">{title}</p><p className="text-[10px] text-white/35">{subtitle}</p></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{children}</div></div>;
}

function LegendItem({ color, title, description }) {
  return <div className="flex min-w-0 items-start gap-2"><span aria-hidden="true" className={`mt-1 h-3 w-3 shrink-0 ${color}`} /><div className="min-w-0"><p className="text-xs font-semibold text-white/80">{title}</p><p className="text-[9px] leading-snug text-white/35">{description}</p></div></div>;
}

function WeekView({ dates, sessions }) {
  return (
    <section className="px-5 pb-24 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="hidden grid-cols-7 gap-px border border-white/10 bg-white/10 lg:grid">
          {dates.map((date, index) => <DayColumn key={date} date={date} day={DAYS[index]} sessions={sessions.filter((item) => item.occurrence_date === date)} />)}
        </div>
        <div className="space-y-6 lg:hidden">
          {dates.map((date, index) => <MobileDay key={date} date={date} day={DAYS[index]} sessions={sessions.filter((item) => item.occurrence_date === date)} />)}
        </div>
      </div>
    </section>
  );
}

function DayColumn({ date, day, sessions }) {
  return <div className="min-w-0 bg-obsidian"><div className="border-b border-white/10 p-3"><div className="font-heading text-base text-white">{day.slice(0, 3).toUpperCase()}</div><div className="text-[10px] text-white/40">{formatScheduleDate(date, { day: "numeric", month: "short" })} · {sessions.length} {sessions.length === 1 ? "class" : "classes"}</div></div><div className="space-y-2 p-2">{sessions.map((session) => <SessionCard key={session.occurrence_id} session={session} compact />)}{sessions.length === 0 && <div className="py-8 text-center text-xs text-white/20">—</div>}</div></div>;
}

function MobileDay({ date, day, sessions }) {
  if (sessions.length === 0) return null;
  return <div><div className="mb-3 flex items-baseline justify-between border-b border-white/10 pb-2"><h3 className="font-heading text-xl text-white">{day}</h3><span className="text-xs text-white/40">{formatScheduleDate(date, { day: "numeric", month: "long" })}</span></div><div className="space-y-3">{sessions.map((session) => <SessionCard key={session.occurrence_id} session={session} />)}</div></div>;
}

function DayView({ date, sessions, week, onChooseDate }) {
  return <section className="min-w-0 px-5 pb-24 lg:px-10"><div className="mx-auto min-w-0 max-w-[1000px]"><div className="mb-6 flex max-w-full gap-2 overflow-x-auto hide-scrollbar">{week.map((item) => <button type="button" key={item} onClick={() => onChooseDate(item)} aria-pressed={date === item} className={`min-w-20 border px-3 py-2 text-center ${date === item ? "border-gold bg-gold text-obsidian" : "border-white/10 text-white/60"}`}><span className="block text-[10px] font-semibold uppercase">{formatScheduleDate(item, { weekday: "short" })}</span><span className="font-heading text-lg">{formatScheduleDate(item, { day: "numeric" })}</span></button>)}</div>{sessions.length > 0 ? <div className="space-y-3">{sessions.map((session) => <SessionCard key={session.occurrence_id} session={session} />)}</div> : <ContentState compact title="No matching classes on this day" message="Choose another day or clear the active filters." actionTo={null} />}</div></section>;
}

function SessionCard({ session, compact = false }) {
  const badges = session.access_types.filter((item) => item !== "all");
  const studioTone = STUDIO_TONES[session.studio] || STUDIO_TONES.floor;
  return (
    <article className={`border border-l-4 p-3 transition-colors hover:border-white/25 ${studioTone.rail} ${session.is_cancelled ? "border-red-400/30 bg-red-500/5" : "border-white/10 bg-white/[0.025]"}`}>
      <div className="flex items-start justify-between gap-2">
        <time className={`text-xs font-bold tracking-wide ${session.is_cancelled ? "text-red-300 line-through" : "text-gold"}`}>{session.start_time}</time>
        <div className="flex flex-wrap justify-end gap-1">
          {session.source_type === "one_off" && <span className="border border-blue-300/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-200">Special</span>}
          {session.is_modified && <span className="border border-gold/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold">Updated</span>}
          {session.is_cancelled && <span className="border border-red-400/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-300">Cancelled</span>}
        </div>
      </div>
      <h3 className={`mt-1 font-heading ${compact ? "text-base" : "text-xl"} leading-tight text-white ${session.is_cancelled ? "line-through opacity-60" : ""}`}>{session.class_name}</h3>
      <div className="mt-2 space-y-1 text-[10px] text-white/55">
        <div className="flex items-center gap-1"><User className="h-3 w-3" /> {session.trainer_slug ? <Link to={`/trainers/${session.trainer_slug}`} className="hover:text-gold">{session.trainer_name}</Link> : session.trainer_name || "Trainer TBA"}</div>
        {(session.duration_minutes || session.difficulty) && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.duration_minutes ? `${session.duration_minutes} min` : session.difficulty}{session.duration_minutes && session.difficulty ? ` · ${session.difficulty}` : ""}</div>}
        <div className="flex items-center gap-1"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${studioTone.dot}`} /> {studioLabel(session.studio)}</div>
      </div>
      {badges.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{badges.map((item) => <span key={item} className={`border px-1.5 py-0.5 text-[9px] font-bold uppercase ${ACCESS_TONES[item] || "border-gold/40 text-gold"}`}>{accessLabel(item)}</span>)}</div>}
      {(session.age_min != null || session.age_max != null) && <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/65">Ages {session.age_min ?? "…"}–{session.age_max ?? "…"}</p>}
      {session.notes && <p className="mt-2 text-[10px] text-white/45">{session.notes}</p>}
    </article>
  );
}
