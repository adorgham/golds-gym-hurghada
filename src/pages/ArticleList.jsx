import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { ArrowRight } from "lucide-react";
import ContentState from "@/components/ContentState";
import { publishedOnly } from "@/lib/content";

const META = {
  "blog": { title: "Blog", accent: "BLOG", eyebrow: "Fitness Journal", desc: "News, stories and insights from Gold's Gym Hurghada." },
  "fitness-guides": { title: "Fitness Guides", accent: "GUIDES", eyebrow: "Knowledge", desc: "In-depth guides to help you train smarter and reach your goals faster." },
  "workouts": { title: "Workouts", accent: "WORKOUTS", eyebrow: "Training Library", desc: "Structured workouts with sets, reps and coach notes — ready to follow." },
  "fitness-tips": { title: "Fitness Tips", accent: "TIPS", eyebrow: "Quick Wins", desc: "Bite-sized advice to improve your training, nutrition and recovery." },
};

export default function ArticleList({ section: sectionProp }) {
  const { section: sectionParam } = useParams();
  const section = sectionProp || sectionParam;
  const meta = META[section] || META["blog"];
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    base44.entities.Article.filter({ section })
      .then((records) => setItems(publishedOnly(records)))
      .catch(() => { setItems([]); setFailed(true); })
      .finally(() => setLoading(false));
  }, [section]);

  const list = items;
  const categories = ["All", ...new Set(list.map((a) => a.category).filter(Boolean))];
  const filtered = filter === "All" ? list : list.filter((a) => a.category === filter);

  useSeo({
    title: meta.title,
    description: meta.desc,
    canonical: `https://goldsgymhurghada.com/${section}`,
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: meta.title, url: `https://goldsgymhurghada.com/${section}` }]),
  });

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow={meta.eyebrow} title={meta.title.toUpperCase().includes(meta.accent) ? meta.title.toUpperCase().replace(meta.accent, "") : meta.title} accent={meta.accent} subtitle={meta.desc} />
        </div>
      </section>

      {categories.length > 1 && (
        <section className="px-5 lg:px-10 pb-6">
          <div className="max-w-[1400px] mx-auto flex gap-2 overflow-x-auto hide-scrollbar">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)} className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wide uppercase border transition-all ${filter === c ? "bg-gold text-obsidian border-gold" : "border-white/10 text-white/60 hover:border-gold hover:text-gold"}`}>{c}</button>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 lg:px-10 pb-24">
        {loading && <p className="py-20 text-center text-white/40">Loading…</p>}
        {!loading && list.length === 0 && <div className="max-w-[1400px] mx-auto"><ContentState title={failed ? "Content temporarily unavailable" : "New content is coming soon"} message="No approved articles have been published in this section yet." /></div>}
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a, i) => (
            <Reveal key={a.slug || i} delay={(i % 3) * 80}>
              <Link to={`/${section}/${a.slug}`} className="group block h-full">
                <div className="aspect-[16/10] overflow-hidden bg-white/5 mb-4">
                  {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase mb-2">{a.category}{a.difficulty ? ` · ${a.difficulty}` : ""}</div>
                <h3 className="font-heading text-xl text-white group-hover:text-gold leading-tight">{a.title}</h3>
                <p className="text-white/45 text-sm mt-2">{a.excerpt}</p>
                {a.target_muscle_groups && <p className="text-white/30 text-xs mt-2">{a.target_muscle_groups.join(" · ")}</p>}
                <span className="inline-flex items-center gap-1 text-gold text-sm font-heading mt-3 group-hover:gap-2 transition-all">READ <ArrowRight className="w-3.5 h-3.5" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
        {!loading && list.length > 0 && filtered.length === 0 && <p className="text-center text-white/40 py-20">No articles match this filter.</p>}
      </section>
    </div>
  );
}
