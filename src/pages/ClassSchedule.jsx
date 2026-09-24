import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS } from "@/lib/site";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { Clock, User } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIMES = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","16:00","17:00","18:00","19:00","20:00","21:00"];

const FALLBACK = [
  { class_name: "BODY PUMP", day_of_week: "Monday", start_time: "18:00", trainer_name: "Ahmed Mohamed", difficulty: "Intermediate", category: "Strength", duration_minutes: 60, spaces_taken: 8, capacity: 20 },
  { class_name: "SPINNING", day_of_week: "Monday", start_time: "07:00", trainer_name: "Omar Khalil", difficulty: "All Levels", category: "Cardio", duration_minutes: 45, spaces_taken: 12, capacity: 15 },
  { class_name: "YOGA FLOW", day_of_week: "Tuesday", start_time: "19:30", trainer_name: "Lina Farouk", difficulty: "Beginner", category: "Mobility", duration_minutes: 60, spaces_taken: 5, capacity: 20 },
  { class_name: "FUNCTIONAL HIIT", day_of_week: "Tuesday", start_time: "18:00", trainer_name: "Omar Khalil", difficulty: "Advanced", category: "Functional", duration_minutes: 45, spaces_taken: 10, capacity: 15 },
  { class_name: "BODY PUMP", day_of_week: "Wednesday", start_time: "18:00", trainer_name: "Ahmed Mohamed", difficulty: "Intermediate", category: "Strength", duration_minutes: 60, spaces_taken: 9, capacity: 20 },
  { class_name: "BOXING FIT", day_of_week: "Wednesday", start_time: "19:00", trainer_name: "Karim Adel", difficulty: "Intermediate", category: "Cardio", duration_minutes: 50, spaces_taken: 14, capacity: 16 },
  { class_name: "SPINNING", day_of_week: "Thursday", start_time: "07:00", trainer_name: "Omar Khalil", difficulty: "All Levels", category: "Cardio", duration_minutes: 45, spaces_taken: 6, capacity: 15 },
  { class_name: "YOGA FLOW", day_of_week: "Thursday", start_time: "19:30", trainer_name: "Lina Farouk", difficulty: "Beginner", category: "Mobility", duration_minutes: 60, spaces_taken: 4, capacity: 20 },
  { class_name: "FUNCTIONAL HIIT", day_of_week: "Friday", start_time: "10:00", trainer_name: "Omar Khalil", difficulty: "Advanced", category: "Functional", duration_minutes: 45, spaces_taken: 11, capacity: 15 },
  { class_name: "BODY PUMP", day_of_week: "Friday", start_time: "18:00", trainer_name: "Ahmed Mohamed", difficulty: "Intermediate", category: "Strength", duration_minutes: 60, spaces_taken: 15, capacity: 20 },
  { class_name: "CORE & ABS", day_of_week: "Saturday", start_time: "11:00", trainer_name: "Sara Hassan", difficulty: "All Levels", category: "Strength", duration_minutes: 30, spaces_taken: 7, capacity: 20 },
  { class_name: "SPINNING", day_of_week: "Saturday", start_time: "09:00", trainer_name: "Omar Khalil", difficulty: "All Levels", category: "Cardio", duration_minutes: 45, spaces_taken: 13, capacity: 15 },
];

const CATEGORIES = ["All","Strength","Cardio","Functional","Mobility"];

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

  useEffect(() => {
    base44.entities.ClassSession.list().then(setSessions).catch(() => setSessions([]));
  }, []);

  const list = sessions.length ? sessions : FALLBACK;

  const filtered = useMemo(() => {
    return list.filter((s) => category === "All" || s.category === category);
  }, [list, category]);

  const fullness = (s) => (s.capacity ? (s.spaces_taken || 0) / s.capacity : 0);
  const goldIntensity = (s) => {
    const f = fullness(s);
    if (f > 0.85) return "bg-gold text-obsidian";
    if (f > 0.5) return "bg-gold/60 text-obsidian";
    return "bg-gold/20 text-gold";
  };

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="The Pulse Schedule" title="GROUP CLASS" accent="SCHEDULE" subtitle="Find your class. Filter by day, category or coach. The heat-map shows how full each class is." />
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
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wide uppercase border transition-all ${category === c ? "bg-gold text-obsidian border-gold" : "border-white/10 text-white/60 hover:border-gold hover:text-gold"}`}>{c}</button>
            ))}
          </div>
        </div>
      </section>

      {view === "week" ? (
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
                          className={`block w-full text-left p-3 border border-white/10 hover:border-gold transition-all ${goldIntensity(s)}`}>
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
                    <div className="col-span-6 sm:col-span-4">
                      <div className="font-heading text-lg text-white">{s.class_name}</div>
                      <div className="text-xs text-white/45">{s.trainer_name} · {s.difficulty}</div>
                    </div>
                    <div className="hidden sm:block col-span-2 text-sm text-white/50">{s.category}</div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <div className="text-xs text-white/40">{s.capacity - (s.spaces_taken || 0)} spots</div>
                      <div className="h-1 bg-white/10 mt-1 w-full"><div className={`h-full ${goldIntensity(s).split(" ")[0]}`} style={{ width: `${fullness(s) * 100}%` }} /></div>
                    </div>
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

      <section className="px-5 lg:px-10 pb-24">
        <Reveal className="max-w-[1400px] mx-auto">
          <div className="border-l-2 border-gold pl-5 text-white/55 text-sm">
            Heat-map intensity shows class fullness. Brighter gold = more full. Walk-ins welcome, but arrive early for popular classes.
          </div>
        </Reveal>
      </section>
    </div>
  );
}