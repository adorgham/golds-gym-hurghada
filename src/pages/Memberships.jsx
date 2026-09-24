import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, whatsappUrl } from "@/lib/site";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import LeadForm from "@/components/LeadForm";
import { Check, ArrowRight, X } from "lucide-react";

export default function Memberships() {
  useSeo({
    title: "Memberships",
    description: "Choose your Gold's Gym Hurghada membership. Monthly plans for residents and regular members — full access to the Mecca of Fitness on the Red Sea.",
    canonical: "https://goldsgymhurghada.com/memberships",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Memberships", url: "https://goldsgymhurghada.com/memberships" }]),
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    base44.entities.Membership.list("display_order").then(setItems).catch(() => setItems([]));
  }, []);

  const plans = items.length ? items : [
    {
      name: "Monthly Membership", slug: "monthly", price: 1500, currency: "EGP", duration: "1 month",
      tagline: "Best for residents",
      description: "Unlimited access to the full Gold's Gym Hurghada facility.",
      benefits: ["Unlimited gym access", "All group classes included", "Locker & towel service", "Free fitness assessment", "Guest pass once per month"],
      restrictions: ["Auto-renews monthly", "Cancellation 30 days notice"],
      recommended_for: "Hurghada residents and regular members",
      is_featured: true,
    },
  ];

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Memberships" title="YOUR STRONGEST" accent="VERSION" subtitle="Train every day at the Mecca of Fitness. Choose the plan that fits your life on the Red Sea." />
        </div>
      </section>

      {/* Comparison pillars */}
      <section className="px-5 lg:px-10 pb-20">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((m, i) => (
            <Reveal key={m.slug || i} delay={i * 80}>
              <div className={`relative h-full border ${m.is_featured ? "border-gold bg-gold/[0.04]" : "border-white/10 bg-white/[0.02]"} p-7 flex flex-col`}>
                {m.is_featured && (
                  <span className="absolute -top-3 left-7 bg-gold text-obsidian text-[10px] font-heading tracking-wide px-3 py-1 clip-tag">MOST POPULAR</span>
                )}
                <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase mb-2">{m.recommended_for || m.tagline}</div>
                <h3 className="font-heading text-3xl text-white mb-1">{m.name}</h3>
                <p className="text-white/45 text-sm mb-5">{m.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-heading text-5xl text-white">{m.price.toLocaleString()}</span>
                  <span className="text-gold font-semibold">{m.currency}</span>
                  <span className="text-white/40 text-sm ml-1">/ {m.duration}</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {m.benefits?.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm text-white/70">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {b}
                    </li>
                  ))}
                  {m.restrictions?.map((r) => (
                    <li key={r} className="flex gap-2.5 text-sm text-white/35">
                      <X className="w-4 h-4 mt-0.5 shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
                <div className="space-y-2">
                  <Link to="/contact" onClick={() => track(EVENTS.membershipSelect, { membership: m.name, location: "memberships_page" })}
                    className={`block text-center font-heading tracking-wide py-3.5 clip-tag transition-all ${m.is_featured ? "bg-gold text-obsidian hover:brightness-110" : "border border-white/20 text-white hover:border-gold hover:text-gold"}`}>
                    JOIN NOW
                  </Link>
                  <a href={whatsappUrl(`Hi, I'm interested in the ${m.name}.`)} target="_blank" rel="noreferrer"
                    onClick={() => track(EVENTS.whatsappClick, { location: "membership_card", membership: m.name })}
                    className="block text-center text-sm text-white/55 hover:text-gold py-1.5">
                    Ask on WhatsApp →
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-5 lg:px-10 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <h3 className="font-heading text-2xl text-white mb-6">COMPARE PLANS</h3>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-3 text-white/50 font-semibold uppercase text-xs tracking-wide">Feature</th>
                  {plans.map((m) => (
                    <th key={m.slug} className="text-left py-4 px-3 font-heading text-white">{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Unlimited gym access","Group classes","Locker service","Fitness assessment","Guest pass","Personal training session"].map((feat) => (
                  <tr key={feat} className="border-b border-white/5">
                    <td className="py-3.5 px-3 text-white/60">{feat}</td>
                    {plans.map((m) => (
                      <td key={m.slug} className="py-3.5 px-3">
                        {m.benefits?.some((b) => b.toLowerCase().includes(feat.toLowerCase().split(" ")[0])) || feat.includes("Personal") === false ? (
                          <Check className="w-4 h-4 text-gold" />
                        ) : (
                          <X className="w-4 h-4 text-white/20" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-white/5">
                  <td className="py-3.5 px-3 text-white/60 font-semibold">Price</td>
                  {plans.map((m) => (
                    <td key={m.slug} className="py-3.5 px-3 font-heading text-gold">{m.price.toLocaleString()} {m.currency}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <section className="px-5 lg:px-10 pb-24">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading eyebrow="Not ready yet?" title="REQUEST" accent="INFO" subtitle="Get membership details, book a tour, or request a callback. We'll help you find the right plan." />
            <div className="mt-8 space-y-3">
              <Link to="/passes" className="inline-flex items-center gap-2 text-gold font-heading hover:gap-3 transition-all">EXPLORE SHORT-TERM PASSES <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
          <div className="border border-white/10 bg-white/[0.02] p-7">
            <LeadForm leadType="membership" product="Monthly Membership" sourcePage="/memberships" title="Request Membership Info" ctaLabel="REQUEST INFO" />
          </div>
        </div>
      </section>
    </div>
  );
}