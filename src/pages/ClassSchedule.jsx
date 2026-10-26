import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS } from "@/lib/site";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { Clock, User } from "lucide-react";
import ContentState from "@/components/ContentState";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export default function ClassSchedule() {
  useSeo({
    title: "Group Class Schedule",
    description: "Weekly group fitness schedule at Gold's Gym Hurghada. Body Pump, Spinning, Yoga, Functional HIIT and more. Filter by day, coach or category.",
    canonical: "https://goldsgymhurghada.com/classes/schedule",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Classes", url: "https://goldsgymhurghada.com/classes/schedule" }]),
  });

  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState("week");
  const [category, setCategory] = useState("All");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    base44.entities.ClassSession.list()
      .then(setSessions)
      .catch(() => { setSessions([]); setFailed(true); })
      .finally(() => setLoading(false));
  }, []);

  const list = sessions;
  const categories = useMemo(() => ["All", ...new Set(list.map((session) => session.category).filter(Boolean))], [list]);

  const filtered = useMemo(() => {
    return list.filter((s) => category === "All" || s.category === category);
  }, [list, category]);

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="The Pulse Schedule" title="GROUP CLASS" accent="SCHEDULE" subtitle="Browse the currently published weekly class timetable by day and category." />
        </div>
      </section>

      <section className="px-5 lg:px-10 pb-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex gap-2">
            {[["week","Week"],["day","Day"]].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-xs font-semibold tracking-wide uppercase border transition-all ${view === v ? "bg-gold text-obsidian border-gold" : "border-white/10 text-white/60 hover:border-gold"}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wide uppercase border transition-all ${category === c ? "bg-gold text-obsidian border-gold" : "border-white/10 text-white/60 hover:border-gold hover:text-gold"}`}>{c}</button>
            ))}
          </div>
        </div>
      </section>

      {loading ? <section className="px-5 lg:px-10 pb-24"><p className="max-w-[1400px] mx-auto py-16 text-center text-white/40">Loading…</p></section> : list.length === 0 ? <section className="px-5 lg:px-10 pb-24"><div className="max-w-[1400px] mx-auto"><ContentState title={failed ? "Schedule temporarily unavailable" : "The class timetable is being updated"} message="Contact the gym for the latest confirmed class times." /></div></section> : view === "week" ? (
        <section className="px-5 lg:px-10 pb-24">
          <div className="max-w-[1400px] mx-auto overflow-x-auto hide-scrollbar">
            <div className="grid grid-cols-7 min-w-[900px] gap-px bg-white/10 border border-white/10">
              {DAYS.map((day) => {
                const dayClasses = filtered.filter((s) => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
                return (
                  <div key={day} className="bg-obsidian">
                    <div className="p-3 border-b border-white/10 sticky top-0">
                      <div className="font-heading text-sm text-white">{day.slice(0, 3).toUpperCase()}</div>
                      <div className="text-[10px] text-white/40">{dayClasses.length} classes</div>
                    </div>
                    <div className="p-2 space-y-2">
                      {dayClasses.map((s, i) => (
                        <button key={i} onClick={() => track(EVENTS.classView, { class: s.class_name, location: "schedule" })}
                          className="block w-full bg-gold/10 text-left text-gold p-3 border border-white/10 hover:border-gold transition-all">
                          <div className="text-[10px] font-bold tracking-wide opacity-80">{s.start_time}</div>
                          <div className="font-heading text-sm leading-tight mt-1">{s.class_name}</div>
                          <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1"><User className="w-2.5 h-2.5" /> {s.trainer_name}</div>
                          <div className="text-[10px] opacity-60 mt-1">{s.duration_minutes}min · {s.difficulty}</div>
                        </button>
                      ))}
                      {dayClasses.length === 0 && <div className="text-center text-white/20 text-xs py-8">—</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-5 lg:px-10 pb-24">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
              {DAYS.map((d) => (
                <button key={d} onClick={() => setSelectedDay(d)} className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wide uppercase border transition-all ${selectedDay === d ? "bg-gold text-obsidian border-gold" : "border-white/10 text-white/60 hover:border-gold"}`}>{d.slice(0,3)}</button>
              ))}
            </div>
            <div className="space-y-3">
              {filtered.filter((s) => s.day_of_week === selectedDay).sort((a,b) => a.start_time.localeCompare(b.start_time)).map((s, i) => (
                <Reveal key={i}>
                  <div className="grid grid-cols-12 gap-4 items-center border border-white/10 p-4 hover:border-gold transition-all">
                    <div className="col-span-3 sm:col-span-2 font-heading text-2xl text-gold">{s.start_time}</div>
                    <div className="col-span-9 sm:col-span-5">
                      <div className="font-heading text-lg text-white">{s.class_name}</div>
                      <div className="text-xs text-white/45">{s.trainer_name} · {s.difficulty}</div>
                    </div>
                    <div className="hidden sm:block col-span-3 text-sm text-white/50">{s.category}</div>
                    <div className="col-span-12 sm:col-span-2 sm:text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-white/50"><Clock className="w-3 h-3" /> {s.duration_minutes}min</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {list.length > 0 && <section className="px-5 lg:px-10 pb-24">
        <Reveal className="max-w-[1400px] mx-auto">
          <div className="border-l-2 border-gold pl-5 text-white/55 text-sm">
            Published times may change. Contact the gym to confirm a class before travelling. Booking and live capacity are not shown on this website yet.
          </div>
        </Reveal>
      </section>}
    </div>
  );
}
