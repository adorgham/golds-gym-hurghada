import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS } from "@/lib/site";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { Search } from "lucide-react";

const ALL_SPECS = ["Bodybuilding","Strength","Weight Loss","Functional Training","Mobility","Rehabilitation","Women's Fitness","Sports Performance","Beginner Training","Nutrition Coaching"];

const FALLBACK = [
  { name: "Ahmed Mohamed", slug: "ahmed-mohamed", title: "Head Strength Coach", years_experience: 12, specializations: ["Strength","Bodybuilding","Sports Performance"], languages: ["Arabic","English"], client_focus: ["Athletes","Advanced"] },
  { name: "Sara Hassan", slug: "sara-hassan", title: "Women's Fitness Specialist", years_experience: 8, specializations: ["Women's Fitness","Weight Loss","Beginner Training"], languages: ["Arabic","English","French"], client_focus: ["Women","Beginners"] },
  { name: "Omar Khalil", slug: "omar-khalil", title: "Functional Training Coach", years_experience: 6, specializations: ["Functional Training","Mobility","Sports Performance"], languages: ["Arabic","English"], client_focus: ["All Levels"] },
  { name: "Lina Farouk", slug: "lina-farouk", title: "Yoga & Mobility Coach", years_experience: 7, specializations: ["Mobility","Rehabilitation","Weight Loss"], languages: ["Arabic","English","German"], client_focus: ["Recovery","All Levels"] },
  { name: "Karim Adel", slug: "karim-adel", title: "Bodybuilding Coach", years_experience: 10, specializations: ["Bodybuilding","Nutrition Coaching","Strength"], languages: ["Arabic","English"], client_focus: ["Bodybuilders","Advanced"] },
  { name: "Mona Said", slug: "mona-said", title: "Weight Loss & Nutrition Coach", years_experience: 9, specializations: ["Weight Loss","Nutrition Coaching","Beginner Training"], languages: ["Arabic","English","Italian"], client_focus: ["Beginners","Weight Loss"] },
];

export default function Trainers() {
  useSeo({
    title: "Personal Trainers",
    description: "Meet the elite personal trainers of Gold's Gym Hurghada. Browse specialties, certifications and book your coach on the Red Sea.",
    canonical: "https://goldsgymhurghada.com/trainers",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Trainers", url: "https://goldsgymhurghada.com/trainers" }]),
  });

  const [trainers, setTrainers] = useState([]);
  const [query, setQuery] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");

  useEffect(() => {
    base44.entities.Trainer.list("display_order").then(setTrainers).catch(() => setTrainers([]));
  }, []);

  const list = trainers.length ? trainers : FALLBACK;

  const filtered = useMemo(() => {
    return list.filter((t) => {
      const matchSpec = activeSpec === "All" || (t.specializations || []).includes(activeSpec);
      const q = query.toLowerCase();
      const matchQuery = !q || t.name.toLowerCase().includes(q) || (t.title || "").toLowerCase().includes(q);
      return matchSpec && matchQuery;
    });
  }, [list, activeSpec, query]);

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="The Titan Directory" title="MEET THE" accent="TRAINERS" subtitle="Elite coaches with proven results. Find the mentor for your goal." />
        </div>
      </section>

      <section className="px-5 lg:px-10 pb-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trainers…" className="w-full bg-white/[0.03] border border-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {["All", ...ALL_SPECS].map((s) => (
              <button key={s} onClick={() => setActiveSpec(s)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wide uppercase border transition-all ${
                  activeSpec === s ? "bg-gold text-obsidian border-gold" : "border-white/10 text-white/60 hover:border-gold hover:text-gold"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 lg:px-10 pb-24">
        <div className="max-w-[1400px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t, i) => (
            <Reveal key={t.slug || i} delay={(i % 3) * 80}>
              <Link to={t.slug ? `/trainers/${t.slug}` : "/trainers"}
                onClick={() => track(EVENTS.trainerView, { trainer: t.name, location: "trainers_directory" })}
                className="group block">
                <div className="aspect-[3/4] overflow-hidden bg-white/5 relative mb-4">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-heading text-7xl text-white/15">{t.name.charAt(0)}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-gold/40 transition-colors" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(t.specializations || []).slice(0, 2).map((s) => (
                        <span key={s} className="text-[9px] tracking-wide uppercase font-bold bg-gold/90 text-obsidian px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <h3 className="font-heading text-2xl text-white group-hover:text-gold">{t.name}</h3>
                <p className="text-white/45 text-sm">{t.title}</p>
                <p className="text-white/30 text-xs mt-1">{t.years_experience}+ years · {(t.languages || []).join(" · ")}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-white/40 py-20">No trainers match your filter.</p>}
      </section>
    </div>
  );
}