import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { absoluteUrl, useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, HAS_WHATSAPP, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Reveal from "@/components/Reveal";
import LeadForm from "@/components/LeadForm";
import { Check, X, ArrowRight, Clock } from "lucide-react";
import ContentState from "@/components/ContentState";
import { isPublished } from "@/lib/content";

export default function PassDetail() {
  const { slug } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    base44.entities.Pass.filter({ slug })
      .then((records) => setPass(records.find(isPublished) || null))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
    track(EVENTS.passView, { pass: slug, location: "pass_detail" });
  }, [slug]);

  useSeo({
    title: pass ? `${pass.name} — Gold's Gym Hurghada` : "Gym Pass",
    description: pass?.description || `Buy a ${pass?.name || "gym pass"} at Gold's Gym Hurghada.`,
    canonical: `/passes/${slug}`,
    noindex: !pass,
    jsonLd: breadcrumbsLd([
      { name: "Home", url: absoluteUrl("/") },
      { name: "Passes", url: absoluteUrl("/passes") },
      { name: pass?.name || "Pass", url: absoluteUrl(`/passes/${slug}`) },
    ]),
  });

  if (loading) return <div className="pt-32 px-5 text-white/40">Loading…</div>;
  if (!pass) return <div className="min-h-[60vh] px-5 pb-24 pt-36 lg:px-10"><div className="mx-auto max-w-3xl"><ContentState title={failed ? "Pass details temporarily unavailable" : "Pass not found"} message="This pass is not currently published. Contact the gym for approved visitor options." actionTo="/passes" actionLabel="View available passes" /></div></div>;
  const p = pass;

  return (
    <div className="pt-28">
      <div className="px-5 lg:px-10 py-6">
        <div className="max-w-[1400px] mx-auto text-xs text-white/40 flex gap-2 items-center">
          <Link to="/" className="hover:text-gold">Home</Link> <span>/</span>
          <Link to="/passes" className="hover:text-gold">Passes</Link> <span>/</span>
          <span className="text-gold">{p.name}</span>
        </div>
      </div>

      <section className="px-5 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gold" />
              <span className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase">{p.days} {p.days === 1 ? "Day" : "Days"} Access</span>
            </div>
            <h1 className="font-heading text-6xl lg:text-7xl text-white leading-[0.9] tracking-tighter">{p.name}</h1>
            <p className="text-gold font-semibold mt-3">{p.tagline}</p>
            <p className="text-white/55 text-lg mt-5 max-w-lg">{p.description}</p>
            <div className="flex items-baseline gap-2 mt-8">
              <span className="font-heading text-6xl text-white">{p.price?.toLocaleString()}</span>
              <span className="text-gold font-semibold text-xl">{p.currency || "EGP"}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {HAS_WHATSAPP ? <a href={whatsappUrl(`Hi, I'd like to request the ${p.name} (${p.price} ${p.currency || "EGP"}).`)} target="_blank" rel="noreferrer"
                onClick={() => track(EVENTS.passSelect, { pass: slug, location: "pass_detail" })}
                className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-8 py-4 hover:brightness-110 transition-all clip-tag">
                <WhatsAppIcon className="w-4 h-4" /> REQUEST THIS PASS <ArrowRight className="w-4 h-4" />
              </a> : <Link to="/contact" onClick={() => track(EVENTS.passSelect, { pass: slug, location: "pass_detail" })}
                className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-8 py-4 hover:brightness-110 transition-all clip-tag">
                REQUEST THIS PASS <ArrowRight className="w-4 h-4" />
              </Link>}
              <Link to="/facilities" className="inline-flex items-center border border-white/20 text-white font-heading tracking-wide px-8 py-4 hover:border-gold hover:text-gold transition-all">
                SEE FACILITIES
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="border border-white/10 bg-white/[0.02] p-7">
              <h2 className="font-heading text-2xl text-white mb-5">WHAT'S INCLUDED</h2>
              <ul className="space-y-3 mb-6">
                {p.benefits?.map((b) => (
                  <li key={b} className="flex gap-3 text-white/75"><Check className="w-5 h-5 text-gold shrink-0" /> {b}</li>
                ))}
              </ul>
              {p.restrictions?.length > 0 && (
                <>
                  <h3 className="font-heading text-sm text-white/50 uppercase tracking-wide mb-3">Restrictions</h3>
                  <ul className="space-y-2">
                    {p.restrictions.map((r) => (
                      <li key={r} className="flex gap-3 text-white/40 text-sm"><X className="w-4 h-4 shrink-0" /> {r}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/50 text-sm mb-3">Prefer to talk? Request info and we'll handle the rest.</p>
                <LeadForm leadType="pass" product={p.name} sourcePage={`/passes/${slug}`} title="" ctaLabel="REQUEST INFO" variant="compact" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 lg:px-10 py-16">
        <div className="max-w-[1400px] mx-auto border-l-2 border-gold pl-6">
          <p className="text-white/60 text-lg max-w-2xl">Recommended for <span className="text-gold font-semibold">{p.recommended_for}</span>. Whether you're in Hurghada for a day or a week, the Mecca of Fitness is open to you.</p>
        </div>
      </section>
    </div>
  );
}
