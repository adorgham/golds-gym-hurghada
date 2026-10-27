import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import SectionHeading from "@/components/SectionHeading";
import ContentState from "@/components/ContentState";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, SlidersHorizontal, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [mobileFullWeek, setMobileFullWeek] = useState(false);
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
      <section className="px-5 pb-4 pt-7 lg:px-10 lg:pb-10 lg:pt-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="lg:hidden">
            <div className="mb-3 flex items-center gap-3"><span className="h-px w-8 bg-gold" /><span className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">Group Fitness</span></div>
            <h1 className="font-heading text-4xl leading-none tracking-tight text-white">GROUP CLASS <span className="gold-text">SCHEDULE</span></h1>
          </div>
          <div className="hidden lg:block"><SectionHeading eyebrow="Group Fitness" title="GROUP CLASS" accent="SCHEDULE" subtitle="Find your class and keep moving. Filter by day, studio or access to find the right session for your goals." /></div>
        </div>
      </section>

      <MobileScheduleControls
        access={access}
        activeDate={anchorDate}
        dates={dates}
        fullWeek={mobileFullWeek}
        onApplyFilters={({ studio: nextStudio, access: nextAccess }) => {
          const matches = filterSchedule(resolved, { studio: nextStudio, access: nextAccess });
          const selectedHasMatch = matches.some((item) => item.occurrence_date === anchorDate);
          const nextAvailable = matches.find((item) => item.occurrence_date >= anchorDate)?.occurrence_date || matches[0]?.occurrence_date || anchorDate;
          updateParams({ studio: nextStudio, access: nextAccess, date: selectedHasMatch ? anchorDate : nextAvailable });
        }}
        onChooseDate={(date) => { updateParams({ date }); setMobileFullWeek(false); }}
        onMoveWeek={(direction) => updateParams({ date: addDays(anchorDate, direction * 7) })}
        onToggleFullWeek={() => setMobileFullWeek((value) => !value)}
        sessions={filtered}
        studio={studio}
        today={today}
      />

      <section className="hidden px-5 pb-5 lg:block lg:px-10">
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

      <section className="hidden px-5 pb-8 lg:block lg:px-10">
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

      <div className="lg:hidden">
        {loading ? (
          <section className="px-5 pb-24"><p className="py-16 text-center text-white/40">Loading…</p></section>
        ) : failed && resolved.length === 0 ? (
          <section className="px-5 pb-24"><ContentState title="Schedule temporarily unavailable" message="Contact the gym for the latest confirmed class times." /></section>
        ) : resolved.length === 0 ? (
          <section className="px-5 pb-24"><ContentState title="The class timetable is being updated" message="No sessions are published for this period yet. Contact the gym for confirmed times." /></section>
        ) : filtered.length === 0 ? (
          <section className="px-5 pb-24"><ContentState title="No classes match these filters" message="Clear one or both filters to see the published schedule for this period." actionTo={null} /></section>
        ) : mobileFullWeek ? (
          <MobileWeekSchedule dates={dates} sessions={filtered} />
        ) : (
          <MobileDaySchedule date={anchorDate} sessions={filtered.filter((item) => item.occurrence_date === anchorDate)} />
        )}
      </div>

      <div className="hidden lg:block">{loading ? (
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
      )}</div>

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

function MobileScheduleControls({ access, activeDate, dates, fullWeek, onApplyFilters, onChooseDate, onMoveWeek, onToggleFullWeek, sessions, studio, today }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStudio, setDraftStudio] = useState(studio);
  const [draftAccess, setDraftAccess] = useState(access);
  const activeFilterCount = Number(studio !== "all") + Number(access !== "all");
  const weekLabel = `${formatScheduleDate(dates[0], { day: "numeric", month: "short" })} – ${formatScheduleDate(dates[6], { day: "numeric", month: "short" })}`;

  const openFilters = () => {
    setDraftStudio(studio);
    setDraftAccess(access);
    setFiltersOpen(true);
  };

  return <>
    <section className="px-5 pb-5 lg:hidden">
      <div className="border-y border-white/10 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onMoveWeek(-1)} aria-label="Previous week" className="grid h-11 w-11 place-items-center border border-white/10 text-white/65"><ChevronLeft className="h-4 w-4" /></button>
            <div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">{fullWeek ? "Full week" : "Choose a day"}</p><p className="font-heading text-lg text-white">{weekLabel}</p></div>
            <button type="button" onClick={() => onMoveWeek(1)} aria-label="Next week" className="grid h-11 w-11 place-items-center border border-white/10 text-white/65"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={openFilters} className={`relative flex min-h-11 shrink-0 items-center gap-2 border px-3 text-[10px] font-bold uppercase tracking-wide ${activeFilterCount ? "border-gold text-gold" : "border-white/15 text-white/70"}`} aria-label={activeFilterCount ? `Filters and class guide, ${activeFilterCount} active` : "Filters and class guide"}><SlidersHorizontal className="h-4 w-4" /><span>Filters<br />& guide</span>{activeFilterCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center bg-gold px-1 text-[10px] font-bold text-obsidian">{activeFilterCount}</span>}</button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar" aria-label="Schedule dates">
          {dates.map((date) => {
            const count = sessions.filter((item) => item.occurrence_date === date).length;
            const active = !fullWeek && activeDate === date;
            return <button type="button" key={date} onClick={() => onChooseDate(date)} aria-pressed={active} className={`min-w-[66px] border px-2 py-2.5 text-center ${active ? "border-gold bg-gold text-obsidian" : "border-white/10 text-white/65"}`}><span className="block text-[9px] font-semibold uppercase tracking-wide">{date === today ? "Today" : formatScheduleDate(date, { weekday: "short" })}</span><span className="block font-heading text-xl leading-none">{formatScheduleDate(date, { day: "numeric" })}</span><span className={`mt-1 block text-[9px] ${active ? "text-obsidian/65" : "text-white/35"}`}>{count} {count === 1 ? "class" : "classes"}</span></button>;
          })}
        </div>

        <button type="button" onClick={onToggleFullWeek} className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold">{fullWeek ? "View selected day" : "View full week"} →</button>
      </div>
    </section>

    <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-white/15 bg-obsidian text-white sm:max-w-md">
        <DialogHeader className="text-left"><DialogTitle className="font-heading text-2xl">FILTER & CLASS GUIDE</DialogTitle><DialogDescription className="text-white/50">Choose a class location or access type. The descriptions explain what each option means.</DialogDescription></DialogHeader>
        <MobileFilterChoice label="Studio (Location)" value={draftStudio} onChange={setDraftStudio} options={[
          { value: "all", label: "All studios", description: "Show every location" },
          ...STUDIOS.map((item) => ({ value: item.value, label: item.shortLabel, color: STUDIO_TONES[item.value].dot, description: { aerobics: "Dance, cardio and group fitness", spinning: "Indoor cycling classes", martial_arts: "Combat and self-defence", floor: "Main gym floor classes" }[item.value] })),
        ]} />
        <MobileFilterChoice label="Members & Access" value={draftAccess} onChange={setDraftAccess} options={ACCESS_TYPES.map((item) => ({ ...item, color: { prepaid: "bg-green-400", ladies_only: "bg-pink-400", kids: "bg-blue-400" }[item.value], description: { all: "Show every access type", prepaid: "Requires a class pass", ladies_only: "For ladies only", kids: "Youth class; ages shown per class" }[item.value] }))} />
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={() => { setDraftStudio("all"); setDraftAccess("all"); }} className="min-h-11 border border-white/15 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/65">Reset</button>
          <button type="button" onClick={() => { onApplyFilters({ studio: draftStudio, access: draftAccess }); setFiltersOpen(false); }} className="min-h-11 bg-gold px-4 py-3 text-xs font-bold uppercase tracking-wide text-obsidian">Show classes</button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}

function MobileFilterChoice({ label, onChange, options, value }) {
  return <fieldset><legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</legend><div className="grid grid-cols-2 gap-2">{options.map((item) => { const active = value === item.value; return <button type="button" key={item.value} aria-pressed={active} onClick={() => onChange(item.value)} className={`min-h-[68px] border px-3 py-2.5 text-left ${active ? "border-gold bg-gold text-obsidian" : "border-white/10 text-white/65"}`}><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">{item.color && <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 ${item.color}`} />}{item.label}</span><span className={`mt-1 block text-[9px] leading-snug ${active ? "text-obsidian/65" : "text-white/35"}`}>{item.description}</span></button>; })}</div></fieldset>;
}

function MobileDaySchedule({ date, sessions }) {
  return <section className="px-5 pb-8"><div className="mb-4 flex items-end justify-between border-b border-white/10 pb-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">{formatScheduleDate(date, { weekday: "long" })}</p><h2 className="font-heading text-2xl text-white">{formatScheduleDate(date, { day: "numeric", month: "long" })}</h2></div><span className="text-xs text-white/40">{sessions.length} {sessions.length === 1 ? "class" : "classes"}</span></div>{sessions.length > 0 ? <div className="space-y-3">{sessions.map((session) => <SessionCard key={session.occurrence_id} session={session} />)}</div> : <ContentState compact title="No matching classes on this day" message="Choose another day or adjust your filters." actionTo={null} />}</section>;
}

function MobileWeekSchedule({ dates, sessions }) {
  return <section className="space-y-7 px-5 pb-8">{dates.map((date) => { const daySessions = sessions.filter((item) => item.occurrence_date === date); if (daySessions.length === 0) return null; return <MobileDay key={date} date={date} day={formatScheduleDate(date, { weekday: "long" })} sessions={daySessions} />; })}</section>;
}

function FilterGroup({ label, children }) {
  return <fieldset className="min-w-0 max-w-full"><legend className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{label}</legend><div className="flex max-w-full gap-2 overflow-x-auto hide-scrollbar">{children}</div></fieldset>;
}

function FilterButton({ active, tone = null, onClick, children }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`whitespace-nowrap border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${active ? "border-gold bg-gold text-obsidian" : `${tone?.border || "border-white/10"} ${tone?.text || "text-white/60"} hover:border-gold hover:text-gold`}`}>{children}</button>;
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
