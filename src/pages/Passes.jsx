import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { Check, ArrowRight, Clock, MapPin } from "lucide-react";

export default function Passes() {
  useSeo({
    title: "Gym Passes — Day, 3, 5 & 7 Day Passes",
    description: "Short-term gym passes for Hurghada visitors, tourists and business travelers. Day pass, 3-day, 5-day and 7-day access to Gold's Gym Hurghada.",
    canonical: "https://goldsgymhurghada.com/passes",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Passes", url: "https://goldsgymhurghada.com/passes" }]),
  });

  const [passes, setPasses] = useState([]);

  useEffect(() => {
    base44.entities.Pass.list("display_order").then(setPasses).catch(() => setPasses([]));
  }, []);

  const items = passes.length ? passes : [
    { name: "Day Pass", slug: "day-pass", price: 200, days: 1, tagline: "Best for trying the gym", benefits: ["Full gym access for 1 day","All equipment","Locker service"], recommended_for: "Visitors & first-timers" },
    { name: "3-Day Pass", slug: "3-day-pass", price: 500, days: 3, tagline: "Best for a long weekend", benefits: ["3 consecutive days access","All equipment","Locker service","1 group class"], recommended_for: "Weekend visitors" },
    { name: "5-Day Pass", slug: "5-day-pass", price: 750, days: 5, tagline: "Best for a short trip", benefits: ["5 consecutive days access","All equipment","Locker service","3 group classes"], recommended_for: "Short-stay travelers" },
    { name: "7-Day Pass", slug: "7-day-pass", price: 1000, days: 7, tagline: "Best value for a week", benefits: ["7 consecutive days access","All equipment","Locker service","Unlimited group classes","Free fitness assessment"], recommended_for: "Holidaymakers & seasonal residents", is_featured: true },
  ];

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Short-Term Passes" title="VISITING HURGHADA?" accent="TRAIN WITH US." subtitle="Day passes and weekly access built for tourists, business travelers and seasonal residents. No commitment — just world-class training." />
        </div>
      </section>

      <section className="px-5 lg:px-10 pb-16">
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

      <section className="px-5 lg:px-10 pb-24">
        <Reveal className="max-w-[1400px] mx-auto">
          <div className="grid sm:grid-cols-3 gap-4 border border-white/10 bg-white/[0.02] p-7">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gold shrink-0" />
              <div><div className="text-white font-semibold text-sm">Red Sea Location</div><div className="text-white/40 text-xs">Hurghada Marina</div></div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gold shrink-0" />
              <div><div className="text-white font-semibold text-sm">Open Daily 06:00–24:00</div><div className="text-white/40 text-xs">Train on your schedule</div></div>
            </div>
            <a href={whatsappUrl("Hi, I'd like to buy a gym pass.")} target="_blank" rel="noreferrer" onClick={() => track(EVENTS.whatsappClick, { location: "passes_info" })}
              className="flex items-center gap-3 hover:text-gold">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold"><WhatsAppIcon className="w-5 h-5" /></div>
              <div><div className="text-white font-semibold text-sm">Buy on WhatsApp</div><div className="text-white/40 text-xs">Fast & easy</div></div>
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}