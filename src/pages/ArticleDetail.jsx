import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import { ArrowRight, Clock, Dumbbell, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ContentState from "@/components/ContentState";
import { isPublished, sectionLabel } from "@/lib/content";

export default function ArticleDetail({ section: sectionProp }) {
  const { slug } = useParams();
  const section = sectionProp;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    base44.entities.Article.filter({ section, slug })
      .then((records) => setArticle(records.find(isPublished) || null))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [section, slug]);

  const a = article || {};
  useSeo({
    title: a.title || "Article not found",
    description: a.excerpt || a.title,
    canonical: `https://goldsgymhurghada.com/${section}/${slug}`,
    noindex: !article,
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

  if (!article) {
    return <div className="min-h-[60vh] px-5 pb-24 pt-36 lg:px-10"><div className="mx-auto max-w-3xl"><ContentState title={failed ? "Article temporarily unavailable" : "Article not found"} message="This article is not published or the link is no longer available." actionTo={`/${section}`} actionLabel={`View ${sectionLabel(section)}`} /></div></div>;
  }

  return (
    <div className="pt-28">
      <div className="px-5 lg:px-10 py-6">
        <div className="max-w-3xl mx-auto text-xs text-white/40 flex gap-2 items-center flex-wrap">
          <Link to="/" className="hover:text-gold">Home</Link> <span>/</span>
          <Link to={`/${section}`} className="hover:text-gold capitalize">{sectionLabel(section)}</Link> <span>/</span>
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
            <Link to={`/${section}`} className="text-gold font-heading hover:gap-3 transition-all flex items-center gap-2">← BACK TO {sectionLabel(section).toUpperCase()}</Link>
            <Link to="/memberships" className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-6 py-3 clip-tag">JOIN NOW <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </article>
    </div>
  );
}
