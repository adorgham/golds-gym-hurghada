import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, HAS_WHATSAPP, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { Check, ArrowRight, Clock, MapPin } from "lucide-react";
import ContentState from "@/components/ContentState";
import { publishedOnly } from "@/lib/content";

export default function Passes() {
  useSeo({
    title: "Gym Passes — Day, 3, 5 & 7 Day Passes",
    description: "Short-term gym passes for Hurghada visitors, tourists and business travelers. Day pass, 3-day, 5-day and 7-day access to Gold's Gym Hurghada.",
    canonical: "https://goldsgymhurghada.com/passes",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Passes", url: "https://goldsgymhurghada.com/passes" }]),
  });

  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    base44.entities.Pass.list("display_order")
      .then((records) => setPasses(publishedOnly(records)))
      .catch(() => { setPasses([]); setFailed(true); })
      .finally(() => setLoading(false));
  }, []);

  const items = passes;

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Short-Term Passes" title="VISITING HURGHADA?" accent="TRAIN WITH US." subtitle="Day passes and weekly access built for tourists, business travelers and seasonal residents. No commitment — just world-class training." />
        </div>
      </section>

      <section className="px-5 lg:px-10 pb-16">
        {loading && <p className="max-w-[1400px] mx-auto py-16 text-center text-white/40">Loading…</p>}
        {!loading && items.length === 0 && <div className="max-w-[1400px] mx-auto"><ContentState title={failed ? "Passes temporarily unavailable" : "Pass options are being updated"} message="Contact the gym for currently approved visitor passes and pricing." /></div>}
        <div className="max-w-[1400px] mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p, i) => (
            <Reveal key={p.slug || i} delay={i * 70}>
              <Link to={`/passes/${p.slug}`} onClick={() => track(EVENTS.passView, { pass: p.slug, location: "passes_grid" })}
                className={`group block h-full border ${p.is_featured ? "border-gold bg-gold/[0.04]" : "border-white/10 bg-white/[0.02]"} p-6 hover:border-gold transition-all`}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase">{p.days} {p.days === 1 ? "Day" : "Days"}</span>
                </div>
                <h3 className="font-heading text-2xl text-white group-hover:text-gold mb-1">{p.name}</h3>
                <p className="text-white/40 text-xs mb-4">{p.recommended_for}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-heading text-4xl text-white">{p.price.toLocaleString()}</span>
                  <span className="text-gold font-semibold text-sm">{p.currency || "EGP"}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {p.benefits?.slice(0, 3).map((b) => (
                    <li key={b} className="flex gap-2 text-xs text-white/60"><Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" /> {b}</li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-gold font-heading text-sm group-hover:gap-2.5 transition-all">
                  VIEW DETAILS <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {items.length > 0 && <section className="px-5 lg:px-10 pb-24">
        <Reveal className="max-w-[1400px] mx-auto">
          <div className="grid sm:grid-cols-3 gap-4 border border-white/10 bg-white/[0.02] p-7">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gold shrink-0" />
              <div><div className="text-white font-semibold text-sm">Hurghada location</div><div className="text-white/40 text-xs">Contact us for directions</div></div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gold shrink-0" />
              <div><div className="text-white font-semibold text-sm">Opening hours</div><div className="text-white/40 text-xs">Confirm before your visit</div></div>
            </div>
            {HAS_WHATSAPP ? <a href={whatsappUrl("Hi, I'd like to ask about a gym pass.")} target="_blank" rel="noreferrer" onClick={() => track(EVENTS.whatsappClick, { location: "passes_info" })}
              className="flex items-center gap-3 hover:text-gold">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold"><WhatsAppIcon className="w-5 h-5" /></div>
              <div><div className="text-white font-semibold text-sm">Ask about passes</div><div className="text-white/40 text-xs">Message our team</div></div>
            </a> : <Link to="/contact" className="flex items-center gap-3 hover:text-gold">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold"><ArrowRight className="w-5 h-5" /></div>
              <div><div className="text-white font-semibold text-sm">Ask about passes</div><div className="text-white/40 text-xs">Send an enquiry</div></div>
            </Link>}
          </div>
        </Reveal>
      </section>}
    </div>
  );
}
