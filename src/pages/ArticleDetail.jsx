import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import { ArrowRight, Clock, Dumbbell, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";

const FALLBACK = {
  "push-day-workout": {
    title: "The Push Day Blueprint", section: "workouts", category: "Strength", difficulty: "Intermediate", duration_minutes: 60,
    goal: "Build strength and hypertrophy in chest, shoulders and triceps",
    equipment: ["Barbell","Dumbbells","Bench","Cables"],
    target_muscle_groups: ["Chest","Shoulders","Triceps"],
    author_name: "Ahmed Mohamed",
    content: "## The Push Day Blueprint\n\nA complete push session targeting chest, shoulders and triceps. Warm up thoroughly, then work through the compounds before isolation work.\n\n### 1. Barbell Bench Press\n- **Sets:** 4 × 6-8\n- **Rest:** 2-3 min\n\n### 2. Overhead Press\n- **Sets:** 3 × 8-10\n- **Rest:** 2 min\n\n### 3. Incline Dumbbell Press\n- **Sets:** 3 × 10-12\n- **Rest:** 90 sec\n\n### 4. Cable Fly\n- **Sets:** 3 × 12-15\n- **Rest:** 60 sec\n\n### 5. Triceps Pushdown\n- **Sets:** 3 × 12-15\n- **Rest:** 60 sec\n\n**Trainer note:** Keep your shoulder blades retracted on pressing movements. If you can't hit the rep range with clean form, drop the weight.",
  },
  "nutrition-fat-loss": {
    title: "Nutrition for Fat Loss: A No-Nonsense Guide", section: "fitness-guides", category: "Nutrition", difficulty: "All Levels",
    goal: "Lose fat while preserving muscle",
    equipment: [],
    target_muscle_groups: [],
    author_name: "Mona Said",
    content: "## Nutrition for Fat Loss\n\nFat loss comes down to a sustained calorie deficit. But how you get there matters for keeping muscle and energy.\n\n### 1. Set a moderate deficit\nAim for 300-500 calories below maintenance. Aggressive cuts cost muscle.\n\n### 2. Prioritise protein\n1.6-2.2g per kg of bodyweight. Protein preserves muscle and keeps you full.\n\n### 3. Train while you cut\nKeep resistance training 3-4x per week. Add cardio for extra deficit, not as a replacement.\n\n### 4. Track and adjust\nWeigh yourself 2-3x per week, average the trend. Adjust every 2 weeks, not daily.",
  },
  "mobility-drills": {
    title: "5 Mobility Drills Every Lifter Needs", section: "fitness-tips", category: "Mobility", difficulty: "Beginner",
    goal: "Improve movement quality and reduce injury risk",
    equipment: ["Foam Roller","Resistance Band"],
    target_muscle_groups: ["Hips","Shoulders","Thoracic Spine"],
    author_name: "Lina Farouk",
    content: "## 5 Mobility Drills\n\nMove better, lift heavier, stay injury-free. Do these 3-4x per week.\n\n1. **90/90 hip rotations** — 2x10 each side\n2. **Cat-cow** — 2x10\n3. **World's greatest stretch** — 2x5 each side\n4. **Band dislocates** — 2x15\n5. **Thoracic rotations** — 2x10 each side\n\nSpend 5-10 minutes before training. Consistency beats intensity here.",
  },
  "welcome-mecca": {
    title: "Welcome to the Mecca of Fitness", section: "blog", category: "News",
    content: "## Welcome to Gold's Gym Hurghada\n\nThe Mecca of Fitness has arrived on the Red Sea. Whether you're a resident or a visitor, your strongest version starts here.",
  },
};

export default function ArticleDetail() {
  const { section, slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Article.filter({ section, slug })
      .then((r) => setArticle(r?.[0] || FALLBACK[slug] || { title: "Article", content: "Coming soon.", section }))
      .catch(() => setArticle(FALLBACK[slug] || { title: "Article", content: "Coming soon.", section }))
      .finally(() => setLoading(false));
  }, [section, slug]);

  const a = article || {};
  useSeo({
    title: a.title,
    description: a.excerpt || a.title,
    canonical: `https://goldsgymhurghada.com/${section}/${slug}`,
    jsonLd: [
      breadcrumbsLd([
        { name: "Home", url: "https://goldsgymhurghada.com/" },
        { name: section, url: `https://goldsgymhurghada.com/${section}` },
        { name: a.title || "Article", url: `https://goldsgymhurghada.com/${section}/${slug}` },
      ]),
      { "@context": "https://schema.org", "@type": "BlogPosting", headline: a.title, author: { "@type": "Person", name: a.author_name }, datePublished: a.published_date },
    ],
  });

  if (loading) return <div className="pt-32 px-5 text-white/40">Loading…</div>;

  return (
    <div className="pt-28">
      <div className="px-5 lg:px-10 py-6">
        <div className="max-w-3xl mx-auto text-xs text-white/40 flex gap-2 items-center flex-wrap">
          <Link to="/" className="hover:text-gold">Home</Link> <span>/</span>
          <Link to={`/${section}`} className="hover:text-gold capitalize">{section.replace("-", " ")}</Link> <span>/</span>
          <span className="text-gold truncate">{a.title}</span>
        </div>
      </div>

      <article className="px-5 lg:px-10 py-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase mb-3">{a.category}{a.difficulty ? ` · ${a.difficulty}` : ""}</div>
            <h1 className="font-heading text-4xl lg:text-6xl text-white leading-[0.95] tracking-tighter">{a.title}</h1>
            {a.author_name && <p className="text-white/45 mt-4">By {a.author_name}{a.published_date ? ` · ${a.published_date}` : ""}</p>}
          </Reveal>

          {(a.duration_minutes || a.goal || a.equipment?.length || a.target_muscle_groups?.length) && (
            <Reveal delay={100}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 my-8">
                {a.goal && <div className="bg-obsidian p-4"><Target className="w-4 h-4 text-gold mb-2" /><div className="text-[10px] tracking-wide text-white/40 uppercase">Goal</div><div className="text-white text-sm">{a.goal}</div></div>}
                {a.duration_minutes && <div className="bg-obsidian p-4"><Clock className="w-4 h-4 text-gold mb-2" /><div className="text-[10px] tracking-wide text-white/40 uppercase">Duration</div><div className="text-white text-sm">{a.duration_minutes} min</div></div>}
                {a.equipment?.length > 0 && <div className="bg-obsidian p-4"><Dumbbell className="w-4 h-4 text-gold mb-2" /><div className="text-[10px] tracking-wide text-white/40 uppercase">Equipment</div><div className="text-white text-sm">{a.equipment.join(", ")}</div></div>}
                {a.target_muscle_groups?.length > 0 && <div className="bg-obsidian p-4 sm:col-span-2 lg:col-span-3"><div className="text-[10px] tracking-wide text-white/40 uppercase mb-1">Target Muscles</div><div className="flex flex-wrap gap-2 mt-2">{a.target_muscle_groups.map((m) => <span key={m} className="text-xs border border-gold/40 text-gold px-2.5 py-1">{m}</span>)}</div></div>}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <div className="prose-content text-white/75 leading-relaxed text-lg">
              <ReactMarkdown>{a.content || ""}</ReactMarkdown>
            </div>
          </Reveal>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <Link to={`/${section}`} className="text-gold font-heading hover:gap-3 transition-all flex items-center gap-2">← BACK TO {section.replace("-", " ").toUpperCase()}</Link>
            <Link to="/memberships" className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-6 py-3 clip-tag">JOIN NOW <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </article>
    </div>
  );
}