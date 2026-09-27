import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Reveal from "@/components/Reveal";
import LeadForm from "@/components/LeadForm";
import { Check, X, ArrowRight, Clock } from "lucide-react";

const FALLBACK = {
  "day-pass": { name: "Day Pass", price: 200, days: 1, tagline: "Best for trying the gym", description: "Full access to Gold's Gym Hurghada for one day. Perfect for visitors who want to experience the Mecca of Fitness.", benefits: ["Full gym access for 1 day","All strength & cardio equipment","Locker & towel service","Changing rooms & showers"], restrictions: ["Valid only on day of first entry","Non-transferable"], recommended_for: "Visitors & first-timers" },
  "3-day-pass": { name: "3-Day Pass", price: 500, days: 3, tagline: "Best for a long weekend", description: "Three consecutive days of full access. Ideal for a long weekend on the Red Sea.", benefits: ["3 consecutive days access","All equipment","Locker service","1 group class included"], restrictions: ["Days must be consecutive","Non-transferable"], recommended_for: "Weekend visitors" },
  "5-day-pass": { name: "5-Day Pass", price: 750, days: 5, tagline: "Best for a short trip", description: "Five consecutive days of full access for short-stay travelers who want to keep their routine.", benefits: ["5 consecutive days access","All equipment","Locker service","3 group classes included"], restrictions: ["Days must be consecutive","Non-transferable"], recommended_for: "Short-stay travelers" },
  "7-day-pass": { name: "7-Day Pass", price: 1000, days: 7, tagline: "Best value for a week", description: "A full week of unlimited access — the best value for holidaymakers and seasonal residents.", benefits: ["7 consecutive days access","All equipment","Locker service","Unlimited group classes","Free fitness assessment"], restrictions: ["Days must be consecutive","Non-transferable"], recommended_for: "Holidaymakers & seasonal residents" },
};

export default function PassDetail() {
  const { slug } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Pass.filter({ slug })
      .then((r) => setPass(r?.[0] || FALLBACK[slug] || FALLBACK["day-pass"]))
      .catch(() => setPass(FALLBACK[slug] || FALLBACK["day-pass"]))
      .finally(() => setLoading(false));
    track(EVENTS.passView, { pass: slug, location: "pass_detail" });
  }, [slug]);

  useSeo({
    title: pass ? `${pass.name} — Gold's Gym Hurghada` : "Gym Pass",
    description: pass?.description || `Buy a ${pass?.name || "gym pass"} at Gold's Gym Hurghada.`,
    canonical: `https://goldsgymhurghada.com/passes/${slug}`,
    jsonLd: breadcrumbsLd([
      { name: "Home", url: "https://goldsgymhurghada.com/" },
      { name: "Passes", url: "https://goldsgymhurghada.com/passes" },
      { name: pass?.name || "Pass", url: `https://goldsgymhurghada.com/passes/${slug}` },
    ]),
  });

  if (loading) return <div className="pt-32 px-5 text-white/40">Loading…</div>;
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
              <a href={whatsappUrl(`Hi, I'd like to buy the ${p.name} (${p.price} ${p.currency || "EGP"}).`)} target="_blank" rel="noreferrer"
                onClick={() => track(EVENTS.passSelect, { pass: slug, location: "pass_detail" })}
                className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-8 py-4 hover:brightness-110 transition-all clip-tag">
                <WhatsAppIcon className="w-4 h-4" /> BUY THIS PASS <ArrowRight className="w-4 h-4" />
              </a>
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